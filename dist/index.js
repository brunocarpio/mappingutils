import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/reduce";
import _flatMapInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/flat-map";
import _mapInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/map";
import _flatInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/flat";
import _Number$isNaN from "@babel/runtime-corejs3/core-js-stable/number/is-nan";
import _Number$isInteger from "@babel/runtime-corejs3/core-js-stable/number/is-integer";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _lastIndexOfInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/last-index-of";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";
import _replaceAllInstanceProperty from "@babel/runtime-corejs3/core-js/instance/replace-all";
import _concatInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/concat";
import _Map from "@babel/runtime-corejs3/core-js-stable/map";
import _Set from "@babel/runtime-corejs3/core-js-stable/set";
import _Object$entries from "@babel/runtime-corejs3/core-js-stable/object/entries";
import _Array$isArray from "@babel/runtime-corejs3/core-js-stable/array/is-array";
import _someInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/some";
import _sortInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/sort";
import _filterInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/filter";
import _Object$keys from "@babel/runtime-corejs3/core-js-stable/object/keys";
import _valuesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/values";
import _Object$assign from "@babel/runtime-corejs3/core-js-stable/object/assign";
import _entriesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/entries";
import _Array$from from "@babel/runtime-corejs3/core-js-stable/array/from";
//@ts-check

import jp from "jsonpath";

// Function to compute the cartesian product of input arrays, adapted from Stack Overflow
// Source: https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// Author: rsp
let cartesian = (...arrays) => _reduceInstanceProperty(arrays).call(arrays, (a, b) => _flatMapInstanceProperty(a).call(a, ae => _mapInstanceProperty(b).call(b, be => {
  var _context;
  return _flatInstanceProperty(_context = [ae, be]).call(_context);
})));

/**
 * Converts a string to a node path
 * Ex: '$,items,0,availableCountries,0,country' =>
 * ['$', 'items', 0, 'availableCountries', 0, 'country']
 * @param {string} str - A path string
 * @returns {(string|number)[]} The converted string to node path
 */
function strToPath(str) {
  var _context2;
  return _mapInstanceProperty(_context2 = str.split(",")).call(_context2, v => {
    if (!_Number$isNaN(+v)) {
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
    if (_Number$isInteger(path[i])) occurrence++;
    if (occurrence === level) return _sliceInstanceProperty(path).call(path, 0, i + 1);
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
    let star = _lastIndexOfInstanceProperty(key).call(key, "*");
    if (star > 0) key = key.substring(0, star) + 0 + key.substring(star + 1);
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
  if (_includesInstanceProperty(prop).call(prop, "[]")) {
    prop = _replaceAllInstanceProperty(prop).call(prop, "[]", "[*]");
  }
  let arrToMerge = jp.query(firstObj, prop);
  let to = prop;
  for (let i = 0; i < objArr.length; i++) {
    arrToMerge = _concatInstanceProperty(arrToMerge).call(arrToMerge, jp.query(objArr[i], to));
  }
  if (_sliceInstanceProperty(to).call(to, -3) === "[*]") to = to.substring(0, to.length - 3);
  return addProp(firstObj, to, arrToMerge);
}

/**
 * Transforms each object in the `source` array based on the provided `mapping` transformation.
 *
 * @param {object[]} source - An array of source objects to transform.
 * @param {object} mapping - A mapping object defining the transformation rules. Each mapping object's key-value pair should use JSONPath syntax:
 *   - The key represents the target field path in the transformed object.
 *   - The value represents the source field path(s) in the source object.
 *     - If a single source field is required, the value should be a JSONPath string pointing to that field.
 *     - If multiple source fields are required, provide an array where:
 *       - Each element before the last is a JSONPath string pointing to a source field.
 *       - The last element is a function that takes the resolved source values as arguments and computes the target field value.
 *
 * @returns {object[]} An array of transformed objects, with fields derived from applying the `mapping` to each `source` object.
 */
export function mapObjArr(source, mapping) {
  let result = [];
  for (let obj of source) {
    let transformed = mapObj(obj, mapping);
    for (let obj of transformed) {
      result.push(obj);
    }
  }
  return result;
}

/**
 * Transforms the `source` object  based on the provided `mapping` transformation.
 *
 * @param {object} source - A source object to transform.
 * @param {object} mapping - A mapping object defining the transformation rules. Each mapping object's key-value pair should use JSONPath syntax:
 *   - The key represents the target field path in the transformed object.
 *   - The value represents the source field path(s) in the source object.
 *     - If a single source field is required, the value should be a JSONPath string pointing to that field.
 *     - If multiple source fields are required, provide an array where:
 *       - Each element before the last is a JSONPath string pointing to a source field.
 *       - The last element is a function that takes the resolved source values as arguments and computes the target field value.
 *
 * @returns {object[]} An array of transformed objects, with fields derived from applying the `mapping` to the `source` object.
 */
export function mapObj(source, mapping) {
  let commonProps = {};
  let indexToObj = new _Map();
  let propsToMerge = new _Set();
  let arrNodes = [];
  for (let [to, from] of _Object$entries(mapping)) {
    var _context4;
    if (!from) continue;
    if (_includesInstanceProperty(to).call(to, "[]")) {
      to = _replaceAllInstanceProperty(to).call(to, "[]", "[*]");
      if (_sliceInstanceProperty(to).call(to, -3) !== "[*]") {
        propsToMerge.add(to.substring(0, _lastIndexOfInstanceProperty(to).call(to, "[*]") + 3));
      } else {
        propsToMerge.add(to);
      }
    }
    let fn;
    let nodes;
    if (_Array$isArray(from)) {
      if (from.length === 0) continue;
      fn = from.at(-1);
      from = _sliceInstanceProperty(from).call(from, 0, -1);
      if (typeof fn !== "function") {
        throw new Error("the last element of the 'from' array must be a function");
      }
      if (from.length === 0) {
        throw new Error("there should be at least one more element than the function in the 'from' array");
      }
      if (from.length === 1) {
        nodes = jp.nodes(source, from.at(0));
      } else {
        var _context3;
        let cpath = [];
        let cvalues = [];
        for (let fromv of from) {
          let tvalues = [];
          let tpath = [];
          let nodes = jp.nodes(source, fromv);
          for (let node of nodes) {
            tpath.push(node.path);
            tvalues.push(node.value);
          }
          cpath.push(tpath);
          cvalues.push(tvalues);
        }
        cvalues = _mapInstanceProperty(cvalues).call(cvalues, arr => {
          if (arr.length === 0) {
            return [undefined];
          } else return arr;
        });
        let cproductv = cartesian(...cvalues);
        let cproductp = cartesian(...cpath);
        let values = [];
        for (let product of cproductv) {
          let val = fn(...product);
          values.push(val);
        }
        if (!_someInstanceProperty(_context3 = _flatInstanceProperty(cpath).call(cpath, 2)).call(_context3, el => _Number$isInteger(el))) {
          for (let value of values) {
            commonProps = addProp(commonProps, to, value);
          }
          continue;
        }
        let cnodes = _mapInstanceProperty(values).call(values, (value, i) => {
          return {
            value,
            path: cproductp[i],
            to
          };
        });
        arrNodes = _concatInstanceProperty(arrNodes).call(arrNodes, cnodes);
        continue;
      }
    }
    nodes = nodes ? nodes : jp.nodes(source, from);
    if (nodes.length === 0) continue;
    if (nodes.length === 1 && !_someInstanceProperty(_context4 = nodes[0].path).call(_context4, el => _Number$isInteger(el))) {
      let value = nodes[0].value;
      if (fn) value = fn(value);
      commonProps = addProp(commonProps, to, value);
      continue;
    }
    for (let node of nodes) {
      node.to = to;
      if (fn) node.value = fn(node.value);
    }
    arrNodes = _concatInstanceProperty(arrNodes).call(arrNodes, nodes);
  }
  _sortInstanceProperty(arrNodes).call(arrNodes, (a, b) => b.path.length - a.path.length);
  for (let node of arrNodes) {
    if (node.ignore) continue;
    let key = findParentPath(node.path, 1)?.toString();
    let obj = indexToObj.get(key) ?? {};
    obj = addProp(obj, node.to, node.value);
    let parentPath = findParentPath(node.path, 2);
    if (parentPath) {
      let parentNodes = _filterInstanceProperty(arrNodes).call(arrNodes, otherNode => includesPath(otherNode.path, parentPath) && otherNode.path.length < node.path.length);
      if (parentNodes && parentNodes.length > 0) {
        for (let pNode of parentNodes) {
          pNode.ignore = true;
          obj = addProp(obj, jp.stringify(pNode.to), pNode.value);
        }
      }
    }
    indexToObj.set(key, obj);
  }
  if (indexToObj.size === 0) {
    return _Object$keys(commonProps).length > 0 ? [commonProps] : [];
  }
  for (let obj of _valuesInstanceProperty(indexToObj).call(indexToObj)) {
    _Object$assign(obj, commonProps);
  }
  if (propsToMerge.size > 0) {
    var _context5;
    let indexParentToObjArr = new _Map();
    for (let to of _valuesInstanceProperty(propsToMerge).call(propsToMerge)) {
      for (let [k, v] of _entriesInstanceProperty(indexToObj).call(indexToObj)) {
        let indexParent = strToPath(k);
        let parentPath = findParentPath(indexParent, 2);
        if (parentPath) {
          let arr = indexParentToObjArr.get(parentPath.toString()) ?? [];
          arr.push(v);
          indexParentToObjArr.set(parentPath.toString(), [mergeObjArr(arr, to)]);
        } else {
          indexParentToObjArr.set(indexParent, [v]);
        }
      }
    }
    return _flatInstanceProperty(_context5 = _Array$from(_valuesInstanceProperty(indexParentToObjArr).call(indexParentToObjArr))).call(_context5);
  } else {
    var _context6;
    return _flatInstanceProperty(_context6 = _Array$from(_valuesInstanceProperty(indexToObj).call(indexToObj))).call(_context6);
  }
}
