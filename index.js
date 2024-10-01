//@ts-check

import jp from "jsonpath";

/**
 * @param {object} obj
 * @param {string} key
 * @param {object} value
 * @returns {object} a deep copy of the object with the new prop added
 */
export function addProp(obj, key, value) {
    obj = structuredClone(obj);
    key = "$." + key;
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
 * @param {Array.<object>} objArr an array of objects
 * @param {string} prop name of the array property to merge
 * @returns {object} a deep copy of the first object, with the prop array elements concatenated
 */
export function mergeObjArr(objArr, prop) {
    objArr = structuredClone(objArr);
    let firstObj = objArr.shift();
    let arrToMerge = jp.query(firstObj, "$." + prop);
    let to = prop;
    for (let i = 0; i < objArr.length; i++) {
        arrToMerge = arrToMerge.concat(jp.query(objArr[i], "$." + to));
    }
    if (to.slice(-3) === "[*]") to = to.substring(0, to.length - 3);
    return addProp(firstObj, to, arrToMerge);
}

/**
 * @param {Array.<object>} source an array of objects
 * @param {Array.<{from: string, to: string}>} mappings an array of transformations to apply to every object
 * @returns {Array.<object>} an array of objects resulting from transforming the input objects
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
 * @param {object} source input object
 * @param {Array.<{from: string, to: string}>} mappings an array of transformations to apply to the input object
 * @returns {Array.<object>} an array of objects resulting from transforming the input object
 */
export function mapObj(source, mappings) {
    let outputObjects = new Map();
    outputObjects.set(0, [{}]);
    let arrToMerge = new Set();
    for (let mapping of mappings) {
        if (mapping.from) {
            let to = mapping.to;
            if (to.includes("[]")) to = to.replaceAll("[]", "[*]");
            let nodes = jp.nodes(source, "$." + mapping.from);
            if (nodes.length === 0) continue;
            if (nodes.length === 1) {
                for (let v of outputObjects.values()) {
                    for (let i = 0; i < v.length; i++) {
                        v[i] = addProp(v[i], to, nodes[0].value);
                    }
                }
            } else {
                let nodesGroup = Map.groupBy(nodes, (node) => {
                    for (let el of node.path) {
                        if (typeof el === "number") return el;
                    }
                    return -1;
                });
                for (let [k, v] of nodesGroup) {
                    let arr, obj;
                    if (outputObjects.get(k)?.length > 0) {
                        arr = outputObjects.get(k);
                        obj = arr[0];
                    } else {
                        arr = [];
                        obj = structuredClone(outputObjects.get(0)[0]);
                    }
                    for (let i = 0; i < Math.max(v.length, arr.length); i++) {
                        if (i >= arr.length)
                            arr.push(addProp(obj, to, v[i].value));
                        else if (i >= v.length)
                            arr[i] = addProp(obj, to, v[v.length - 1].value);
                        else arr[i] = addProp(arr[i], to, v[i].value);
                    }
                    outputObjects.set(k, arr);
                }
            }
        }
        if (mapping.to.includes("[]")) {
            let to = mapping.to;
            to = to.replaceAll("[]", "[*]");
            if (to.slice(-3) !== "[*]") {
                to = to.substring(0, to.lastIndexOf("[*]") + 3);
            }
            arrToMerge.add(to);
        }
    }
    for (let to of arrToMerge.values()) {
        for (let k of outputObjects.keys()) {
            outputObjects.set(k, [mergeObjArr(outputObjects.get(k), to)]);
        }
    }
    let outPutArr = Array.from(outputObjects.values()).flat();
    return outPutArr.filter((obj) => Object.keys(obj).length > 0);
}
