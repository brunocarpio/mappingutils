import "core-js/modules/esnext.map.group-by.js";
//@ts-check

import jp from "jsonpath";
let isNumber = el => typeof el === "number";

/**
 * Add a `key` property to the object `obj` with the value `value`.
 * @param {object} obj - The input object.
 * @param {string} key - The path in the resulting object to set the value.
 * @param {object} value - The value to set.
 * @returns {object} - A deep copy of the object with the new property added.
 */
export function addProp(obj, key, value) {
  obj = structuredClone(obj);
  let nodes = jp.nodes(obj, key);
  if (nodes.length === 0) {
    let star = key.lastIndexOf("*");
    if (star > 0) key = key.substring(0, star) + 0 + key.substring(star + 1);
  }
  jp.value(obj, key, value);
  return obj;
}

/**
 * Merge the `prop` array values of  the object `objArr`.
 * @param {object[]} objArr - An array of objects.
 * @param {string} prop - The path to the array property to merge.
 * @returns {object} - A deep copy of the first object in the array, with the `prop` array values concatenated.
 */
export function mergeObjArr(objArr, prop) {
  objArr = structuredClone(objArr);
  let firstObj = objArr.shift();
  let arrToMerge = jp.query(firstObj, prop);
  let to = prop;
  for (let i = 0; i < objArr.length; i++) {
    arrToMerge = arrToMerge.concat(jp.query(objArr[i], to));
  }
  if (to.slice(-3) === "[*]") to = to.substring(0, to.length - 3);
  return addProp(firstObj, to, arrToMerge);
}

/**
 * Transforms an input array of objects `source` given the provided array of mappings `mappings`.
 * @param {object[]} source - An array of objects.
 * @param {object[]} mappings - An array of transformations to apply to every input object.
 * @param {string} mappings[].from - The query expression for looking up in the source object.
 * @param {string} mappings[].to - The path to set the value in the target object.
 * @param {function=} mappings[].fn - An optional function to apply to the from value.
 * @returns {object[]} - an array of objects resulting from transforming the input objects.
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
 * Transforms an input object `source` given the provided array of mappings `mappings`.
 * @param {object} source - The input object.
 * @param {object[]} mappings - An array of transformations to apply to the input object.
 * @param {string} mappings[].from - The query expression for looking up in the source object.
 * @param {string} mappings[].to - The path to set the value in the target object.
 * @param {function=} mappings[].fn - An optional function to apply to the from value.
 * @returns {object[]} - An array of objects resulting from transforming the input object.
 */
export function mapObj(source, mappings) {
  let commonProps = {};
  let indexToObjArray = new Map();
  let propsToMerge = new Set();
  for (let mapping of mappings) {
    if (mapping.from) {
      let to = mapping.to;
      if (to.includes("[]")) to = to.replaceAll("[]", "[*]");
      let nodes = jp.nodes(source, mapping.from);
      if (nodes.length === 0) continue;
      if (nodes.length === 1 && !nodes[0].path.find(isNumber)) {
        let value = nodes[0].value;
        if (mapping.fn) value = mapping.fn.call(source, value);
        commonProps = addProp(commonProps, to, value);
        continue;
      }
      let indexToNodes = Map.groupBy(nodes, node => node.path.find(isNumber));
      for (let [k, v] of indexToNodes) {
        let arr = [],
          obj = {};
        if (indexToObjArray.get(k)?.length > 0) {
          arr = indexToObjArray.get(k);
          obj = arr[0];
        }
        for (let i = 0; i < Math.max(v.length, arr.length); i++) {
          let value = v[Math.min(i, v.length - 1)].value;
          if (mapping.fn) value = mapping.fn.call(source, value);
          if (i >= arr.length) arr.push(addProp(obj, to, value));else if (i >= v.length) arr[i] = addProp(obj, to, value);else arr[i] = addProp(arr[i], to, value);
        }
        indexToObjArray.set(k, arr);
      }
    }
    if (mapping.to.includes("[]")) {
      let to = mapping.to;
      to = to.replaceAll("[]", "[*]");
      if (to.slice(-3) !== "[*]") {
        to = to.substring(0, to.lastIndexOf("[*]") + 3);
      }
      propsToMerge.add(to);
    }
  }
  if (indexToObjArray.size === 0) return Object.keys(commonProps).length > 0 ? [commonProps] : [];
  for (let v of indexToObjArray.values()) {
    for (let i = 0; i < v.length; i++) {
      Object.assign(v[i], commonProps);
    }
  }
  for (let to of propsToMerge.values()) {
    for (let k of indexToObjArray.keys()) {
      indexToObjArray.set(k, [mergeObjArr(indexToObjArray.get(k), to)]);
    }
  }
  return Array.from(indexToObjArray.values()).flat();
}
