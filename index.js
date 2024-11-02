//@ts-check

import jp from "jsonpath";

// Function to compute the cartesian product of input arrays, adapted from Stack Overflow
// Source: https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// Author: rsp
let cartesian = (...arrays) =>
    arrays.reduce((a, b) => a.flatMap((ae) => b.map((be) => [ae, be].flat())));

/**
 * Converts a string to a node path
 * Ex: '$,items,0,availableCountries,0,country' =>
 * ['$', 'items', 0, 'availableCountries', 0, 'country']
 * @param {string} str - A path string
 * @returns {(string|number)[]} The converted string to node path
 */
function strToPath(str) {
    return str.split(",").map((v) => {
        if (!Number.isNaN(+v)) {
            return +v;
        }
        return v;
    });
}

/**
 * Finds the upper level array type node path
 * Ex: findParent(['$', 'items', 0, 'availableCountries', 0, 'country'], 2)
 * returns ['$', 'items', 0]
 * @param {(string|number)[]} path - A node path
 * @param {number} level - The level up to find for the parent node
 * @returns {(string|number)[]|null} Upper level node path
 */
function findParentPath(path, level) {
    let occurrence = 0;
    for (let i = path.length - 1; i > 0; i--) {
        if (typeof path[i] === "number") occurrence++;
        if (occurrence === level) return path.slice(0, i + 1);
    }
    return null;
}

/**
 * Checks if path contains another node path
 * Ex: includesPath(['$', 'items', 0, 'availableCountries', 0, 'country'], ['$', 'items', 0])
 * returns true
 * @param {(string|number)[]} path - A node path
 * @param {(string|number)[]} otherPath - Another node path
 * @returns {boolean} True if node path includes node otherPath
 */
function includesPath(path, otherPath) {
    for (let i = 0; i < otherPath.length; i++) {
        if (path[i] !== otherPath[i]) return false;
    }
    return true;
}

/**
 * Add a `key` property to the object `obj` with the value `value`.
 * @param {object} obj - The input object.
 * @param {string} key - The path in the resulting object to set the value.
 * @param {object} value - The value to set.
 * @returns {object} A deep copy of the object with the new property added.
 */
export function addProp(obj, key, value) {
    obj = structuredClone(obj);
    let nodes = jp.nodes(obj, key);
    if (nodes.length === 0) {
        let star = key.lastIndexOf("*");
        if (star > 0)
            key = key.substring(0, star) + 0 + key.substring(star + 1);
    }
    jp.value(obj, key, value);
    return obj;
}

/**
 * Merges the values of the `prop` property from each object within the `objArr` array.
 * @param {object[]} objArr - An array of objects.
 * @param {string} prop - The path to the array property to merge.
 * @returns {object} A deep copy of the first object in `objArr`, with its `prop` array containing the concatenated values from all objects in the `objArr`.
 */
export function mergeObjArr(objArr, prop) {
    objArr = structuredClone(objArr);
    let firstObj = objArr.shift();
    if (prop.includes("[]")) {
        prop = prop.replaceAll("[]", "[*]");
    }
    let arrToMerge = jp.query(firstObj, prop);
    let to = prop;
    for (let i = 0; i < objArr.length; i++) {
        arrToMerge = arrToMerge.concat(jp.query(objArr[i], to));
    }
    if (to.slice(-3) === "[*]") to = to.substring(0, to.length - 3);
    return addProp(firstObj, to, arrToMerge);
}

/**
 * Transforms a `source` input array of objects based on the provided array of `mappings`.
 * @param {object[]} source - An array of objects.
 * @param {object[]} mappings - An array of mappings to apply to every input object.
 * @param {string|string[]} mappings[].from - The query expression for looking up in the source object.
 * @param {string} mappings[].to - The path to set the value in the target object.
 * @param {function=} mappings[].fn - An optional function to apply to the from value. Mandatory when mappings[].from is an array
 * @returns {object[]} An array of objects resulting from transforming the input objects.
 */
export function mapObjArr(source, mappings) {
    let result = [];
    for (let obj of source) {
        let transformed = mapObj(obj, mappings);
        for (let obj of transformed) {
            result.push(obj);
        }
    }
    return result;
}

/**
 * Transforms a `source` object based on the provided array of `mappings`.
 * @param {object} source - The input object.
 * @param {object[]} mappings - An array of mappings to apply to the input object.
 * @returns {object[]} An array of objects resulting from transforming the input object.
 */
export function mapObj(source, mappings) {
    let commonProps = {};
    let indexToObj = new Map();
    let propsToMerge = new Set();
    let arrNodes = [];
    for (let mapping of mappings) {
        for (let [to, from] of Object.entries(mapping)) {
            if (!from) continue;
            if (to.includes("[]")) {
                to = to.replaceAll("[]", "[*]");
                if (to.slice(-3) !== "[*]") {
                    propsToMerge.add(
                        to.substring(0, to.lastIndexOf("[*]") + 3),
                    );
                } else propsToMerge.add(to);
            }
            let fn;
            let nodes;
            if (Array.isArray(from)) {
                fn = from.at(-1);
                if (typeof fn !== "function") {
                    throw new Error("fn needs to be a function");
                }
                nodes = jp.nodes(source, from.at(0));
            }
            nodes = nodes ? nodes : jp.nodes(source, from);
            if (nodes.length === 0) continue;
            if (
                nodes.length === 1 &&
                !nodes[0].path.some((el) => Number.isInteger(el))
            ) {
                let value = nodes[0].value;
                if (fn) value = fn(value);
                commonProps = addProp(commonProps, to, value);
                continue;
            }
            for (let node of nodes) {
                node.to = to;
                if (fn) node.value = fn(node.value);
            }
            arrNodes = arrNodes.concat(nodes);
        }
    }
    arrNodes.sort((a, b) => b.path.length - a.path.length);
    for (let node of arrNodes) {
        if (node.ignore) continue;
        let key = findParentPath(node.path, 1)?.toString();
        let obj = indexToObj.get(key) ?? {};
        obj = addProp(obj, node.to, node.value);
        let parentPath = findParentPath(node.path, 2);
        if (parentPath) {
            let parentNodes = arrNodes.filter(
                (otherNode) =>
                    includesPath(otherNode.path, parentPath) &&
                    otherNode.path.length < node.path.length,
            );
            if (parentNodes && parentNodes.length > 0) {
                for (let pNode of parentNodes) {
                    pNode.ignore = true;
                    obj = addProp(obj, jp.stringify(pNode.to), pNode.value);
                }
            }
        }
        indexToObj.set(key, obj);
    }
    if (indexToObj.size === 0)
        return Object.keys(commonProps).length > 0 ? [commonProps] : [];
    for (let obj of indexToObj.values()) {
        Object.assign(obj, commonProps);
    }
    if (propsToMerge.size > 0) {
        let indexParentToObjArr = new Map();
        for (let to of propsToMerge.values()) {
            for (let [k, v] of indexToObj.entries()) {
                let indexParent = strToPath(k);
                let parentPath = findParentPath(indexParent, 2);
                if (parentPath) {
                    let arr =
                        indexParentToObjArr.get(parentPath.toString()) ?? [];
                    arr.push(v);
                    indexParentToObjArr.set(parentPath.toString(), [
                        mergeObjArr(arr, to),
                    ]);
                } else {
                    indexParentToObjArr.set(indexParent, [v]);
                }
            }
        }
        return Array.from(indexParentToObjArr.values()).flat();
    } else {
        return Array.from(indexToObj.values()).flat();
    }
}
