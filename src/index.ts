import jp, { type PathComponent } from "jsonpath";

type Node = ReturnType<typeof jp.nodes>[number];

type ExtendedNode = Node & {
    to?: string;
    ignore?: boolean;
}

type mapping = {
    [key: string]: string | number | arrayValueMapping | Function;
}

type arrayValueMapping = [...string[], Function];

type NodePath = PathComponent[];

// Function to compute the cartesian product of input arrays, adapted from Stack Overflow
// Source: https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// Author: rsp
function cartesian(...pairs: any[][]): any[][] {
    return pairs.reduce((a, b) => a.flatMap((ae) => b.map((be) => [ae, be].flat())));
}

/**
 * Finds the upper level array type node path
 * @example
 * findParent(['$', 'items', 0, 'availableCountries', 0, 'country'], 2)
 * returns ['$', 'items', 0]
 */
function findParentPath(path: NodePath, level: number): NodePath {
    let occurrence = 0;
    for (let i = path.length - 1; i > 0; i--) {
        if (Number.isInteger(path[i])) occurrence++;
        if (occurrence === level) return path.slice(0, i + 1);
    }
    if (occurrence < level) {
        return path.slice(0, -1);
    }
    return [];
}

/**
 * Checks if path contains another node path
 * @example
 * includesPath(['$', 'items', 0, 'availableCountries', 0, 'country'], ['$', 'items', 0]) returns true
 */
function includesPath(path: NodePath, otherPath: NodePath): boolean {
    for (let i = 0; i < otherPath.length; i++) {
        if (path[i] !== otherPath[i]) return false;
    }
    return true;
}

function keyHasValidBrackets(key: string): boolean {
    if (key.includes("[") && key.at(key.indexOf("[") + 1) !== "]") {
        throw new Error("Expecting closing ']' after '['");
    }
    if (key.includes("]") && key.at(key.indexOf("]") - 1) !== "[") {
        throw new Error("Expecting openning '[' before ']'");
    }
    let next = key.indexOf("]") + 1;
    if (next > 0 && next < key.length)
        return keyHasValidBrackets(key.substring(next));
    else return true;
}

function keyIncludesBrackets(to: string): boolean {
    return to.includes("[") || to.includes("]");
}

function isValidArrayValue(from: arrayValueMapping): boolean {
    if (from.length === 1 || from.length === 0) {
        throw new Error(
            "the array should contain at least one argument and the function"
        );
    }
    let fn = from.at(-1);
    if (typeof fn !== "function") {
        throw new Error("the last element of the array must be a function");
    }
    if (fn.length !== from.length - 1) {
        throw new Error(
            "the number of arguments should match with the number of arguments in the function"
        );
    }
    return true;
}

function computeFunction(fn: Function, ...args: string[]): Exclude<any, undefined | Function> {
    let cleanedArgs = args.map((arg) => {
        if (!arg) {
            return "";
        } else {
            return arg;
        }
    });
    let computed = fn(...cleanedArgs);
    if (typeof computed === "function") {
        throw new Error("the function cannot return a function type value");
    }
    if (typeof computed === "undefined") {
        return "";
    }
    return computed;
}

function isValidFromString(from: unknown): boolean {
    return typeof from === "string" && !from.startsWith("$.");
}

function isValidFromArray(from: unknown): boolean {
    return Array.isArray(from) &&
        (from.length === 0 ||
            typeof from.at(0) !== "string" ||
            isValidFromString(from.at(0)));
}

function isValidFromObject(from: unknown): boolean {
    return typeof from === "object" && !Array.isArray(from) && from !== null;
}

function isDefaultValue(from: unknown): boolean {
    return (
        typeof from === "number" ||
        isValidFromObject(from) ||
        typeof from === "boolean" ||
        from === null ||
        isValidFromString(from) ||
        isValidFromArray(from)
    );
}

function isCommonProp(nodes: ExtendedNode[]): boolean {
    if (nodes.length === 1) {
        let node = nodes[0];
        let lastNumberIndex = node?.path.findLastIndex((n) =>
            Number.isInteger(n)
        );
        return !(
            lastNumberIndex !== node!.path.length - 1 &&
            node!.path.filter((n) => Number.isInteger(n)).length > 1
        );
    } else {
        return false;
    }
}

/**
 * Add a `key` property to the object `obj` with the value `value`.
 * @param obj - The input object.
 * @param key - The path in the resulting object to set the value.
 * @param value - The value to set.
 * @returns A deep copy of the object with the new property added.
 */
export function addProp(obj: object, key: string, value: any): object {
    if (key.includes("[]")) {
        key = key.replaceAll("[]", "[0]");
    }
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
 * @param objArr - An array of objects.
 * @param prop - The path to the array property to merge.
 * @returns A deep copy of the first object in `objArr`, with its `prop` array containing the concatenated values from all objects in the `objArr`.
 */
export function mergeObjArr(objArr: object[], prop: string): object {
    objArr = structuredClone(objArr);
    let firstObj = objArr.shift() ?? {};
    if (keyIncludesBrackets(prop) && keyHasValidBrackets(prop)) {
        prop = prop.replaceAll("[]", "[*]");
    }
    let arrToMerge = jp.query(firstObj, prop);
    let to = prop;
    for (let i = 0; i < objArr.length; i++) {
        arrToMerge = arrToMerge.concat(jp.query(objArr[i], to));
    }
    if (to.slice(-3) === "[*]") to = to.substring(0, to.length - 3);
    return addProp(firstObj ?? {}, to, arrToMerge);
}

/**
 * Transforms the `source` object  based on the provided `mapping` transformation.
 *
 * @param source - A source object to transform.
 * @param mapping - A mapping object defining the transformation rules. Each mapping object's key-value pair should use JSONPath syntax:
 *   - The key represents the target field path in the transformed object.
 *   - The value represents the source field path(s) in the source object.
 *     - If a single source field is required, the value should be a JSONPath string pointing to that field.
 *     - If multiple source fields are required, provide an array where:
 *       - Each element before the last is a JSONPath string pointing to a source field.
 *       - The last element is a function that takes the resolved source values as arguments and computes the target field value.
 *
 * @returns An array of transformed objects, with fields derived from applying the `mapping` to the `source` object.
 */
export function mapObj(source: object, mapping: mapping): object[] {
    let commonProps = {};
    let propToObj = new Map<string, object>();
    let propsToMerge = new Set<string>();
    let arrNodes: ExtendedNode[] = [];
    for (let [to, from] of Object.entries(mapping)) {
        if (from === undefined) continue;
        if (keyIncludesBrackets(to) && keyHasValidBrackets(to)) {
            propsToMerge.add(to);
        }
        if (isDefaultValue(from)) {
            commonProps = addProp(
                commonProps,
                to,
                JSON.parse(JSON.stringify(from))
            );
            continue;
        }
        if (typeof from === "string") {
            let nodes: ExtendedNode[] = jp.nodes(source, from);
            if (nodes.length === 0) continue;
            if (isCommonProp(nodes)) {
                commonProps = addProp(commonProps, to, nodes[0]?.value);
            } else {
                for (let node of nodes) {
                    node.to = to;
                }
                arrNodes = arrNodes.concat(nodes);
            }
        }
        else if ((Array.isArray(from) && isValidArrayValue(from)) && from.length === 2) {
            let arg = from.at(0) as string;
            let fn = from.at(1) as Function;
            let nodes: ExtendedNode[] = jp.nodes(source, arg);
            if (nodes.length === 0) continue;
            if (isCommonProp(nodes)) {
                let value = computeFunction(fn, nodes[0]?.value);
                commonProps = addProp(commonProps, to, value);
            } else {
                for (let node of nodes) {
                    node.to = to;
                    node.value = computeFunction(fn, node.value);
                }
                arrNodes = arrNodes.concat(nodes);
            }
        }
        else if ((Array.isArray(from) && isValidArrayValue(from)) && from.length > 2) {
            let fn = from.at(-1) as Function;
            let args = from.slice(0, -1) as string[];
            let argsPaths: NodePath[][] = [];
            let argsValues = [];
            for (let arg of args) {
                let values = [];
                let paths: NodePath[] = [];
                let nodes = jp.nodes(source, arg);
                for (let node of nodes) {
                    paths.push(node.path);
                    values.push(node.value);
                }
                argsPaths.push(paths);
                argsValues.push(values);
            }
            argsValues = argsValues.map((arr) => {
                if (arr.length === 0) {
                    return [undefined];
                } else return arr;
            });
            let cartesianValues = cartesian(...argsValues);
            let cartesianPaths: NodePath[] = cartesian(...argsPaths);
            let computedValues = [];
            for (let product of cartesianValues) {
                let val = computeFunction(fn, ...product);
                computedValues.push(val);
            }
            if (!argsPaths.flat(2).some((el) => Number.isInteger(el))) {
                for (let value of computedValues) {
                    commonProps = addProp(commonProps, to, value);
                }
                continue;
            }
            let cnodes: ExtendedNode[] = computedValues.map((value, i) => {
                return {
                    value,
                    path: cartesianPaths[i]!,
                    to,
                };
            });
            arrNodes = arrNodes.concat(cnodes);
        }
    }
    if (arrNodes.length > 0) {
        arrNodes.sort((a, b) => b.path.length - a.path.length);
        for (let node of arrNodes) {
            if (node.ignore) continue;
            let key = findParentPath(node.path, 1)?.toString() ?? "";
            let obj = propToObj.get(key) ?? {};
            obj = addProp(obj, node.to!, node.value);
            let parentPath = findParentPath(node.path, 2);
            if (parentPath) {
                let parentNodes = arrNodes.filter(
                    (otherNode) =>
                        includesPath(otherNode.path, parentPath) &&
                        otherNode.path.length < node.path.length
                );
                if (parentNodes && parentNodes.length > 0) {
                    for (let pNode of parentNodes) {
                        pNode.ignore = true;
                        obj = addProp(obj, pNode.to!, pNode.value);
                    }
                }
            }
            propToObj.set(key, obj);
        }
    }
    if (Object.keys(commonProps).length > 0) {
        if (propToObj.size === 0) {
            return [commonProps];
        }
        for (let obj of propToObj.values()) {
            Object.assign(obj, commonProps);
        }
    }
    if (propsToMerge.size > 0) {
        let propParentToObjArr = new Map<string, object[]>();
        for (let to of propsToMerge.values()) {
            let nodesMatch = arrNodes.filter((node) => node.to === to);
            for (let node of nodesMatch) {
                let oldKey = findParentPath(node.path, 1)?.toString() ?? "";
                let newKey = findParentPath(node.path, 2)?.toString() ?? "";
                let foundNode = propToObj.get(oldKey);
                if (foundNode) {
                    propToObj.delete(oldKey);
                    let arr = propParentToObjArr.get(newKey) ?? [];
                    arr.push(foundNode);
                    propParentToObjArr.set(newKey, [
                        mergeObjArr(
                            arr,
                            to.substring(0, to.lastIndexOf("[]") + 2)
                        ),
                    ]);
                }
            }
        }
        return Array.from(
            new Map([...propParentToObjArr, ...propToObj]).values()
        ).flat();
    } else {
        return Array.from(propToObj.values()).flat();
    }
}

/**
 * Transforms each object in the `source` array based on the provided `mapping` transformation.
 *
 * @param source - An array of source objects to transform.
 * @param mapping - A mapping object defining the transformation rules. Each mapping object's key-value pair should use JSONPath syntax:
 *   - The key represents the target field path in the transformed object.
 *   - The value represents the source field path(s) in the source object.
 *     - If a single source field is required, the value should be a JSONPath string pointing to that field.
 *     - If multiple source fields are required, provide an array where:
 *       - Each element before the last is a JSONPath string pointing to a source field.
 *       - The last element is a function that takes the resolved source values as arguments and computes the target field value.
 *
 * @returns An array of transformed objects, with fields derived from applying the `mapping` to each `source` object.
 */
export function mapObjArr(source: object[], mapping: mapping): object[] {
    let result = [];
    for (let obj of source) {
        let transformed = mapObj(obj, mapping);
        for (let obj of transformed) {
            result.push(obj);
        }
    }
    return result;
}
