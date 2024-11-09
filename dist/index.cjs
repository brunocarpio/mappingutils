"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.addProp = addProp;
exports.mapObj = mapObj;
exports.mapObjArr = mapObjArr;
exports.mergeObjArr = mergeObjArr;
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));
var _flatMap = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/flat-map"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));
var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/flat"));
var _isNan = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/number/is-nan"));
var _isInteger = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/number/is-integer"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));
var _lastIndexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/last-index-of"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));
var _replaceAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/replace-all"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));
var _map2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/map"));
var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/entries"));
var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/some"));
var _sort = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/sort"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));
var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/values"));
var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/assign"));
var _entries2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/entries"));
var _from = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/from"));
var _jsonpath = _interopRequireDefault(require("jsonpath"));
//@ts-check

// Function to compute the cartesian product of input arrays, adapted from Stack Overflow
// Source: https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// Author: rsp
let cartesian = (...arrays) => (0, _reduce.default)(arrays).call(arrays, (a, b) => (0, _flatMap.default)(a).call(a, ae => (0, _map.default)(b).call(b, be => {
  var _context;
  return (0, _flat.default)(_context = [ae, be]).call(_context);
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
  return (0, _map.default)(_context2 = str.split(",")).call(_context2, v => {
    if (!(0, _isNan.default)(+v)) {
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
    if ((0, _isInteger.default)(path[i])) occurrence++;
    if (occurrence === level) return (0, _slice.default)(path).call(path, 0, i + 1);
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
function addProp(obj, key, value) {
  obj = structuredClone(obj);
  let nodes = _jsonpath.default.nodes(obj, key);
  if (nodes.length === 0) {
    let star = (0, _lastIndexOf.default)(key).call(key, "*");
    if (star > 0) key = key.substring(0, star) + 0 + key.substring(star + 1);
  }
  _jsonpath.default.value(obj, key, value);
  return obj;
}

/**
 * Merges the values of the `prop` property from each object within the `objArr` array.
 * @param {object[]} objArr - An array of objects.
 * @param {string} prop - The path to the array property to merge.
 * @returns {object} A deep copy of the first object in `objArr`, with its `prop` array containing the concatenated values from all objects in the `objArr`.
 */
function mergeObjArr(objArr, prop) {
  objArr = structuredClone(objArr);
  let firstObj = objArr.shift();
  if ((0, _includes.default)(prop).call(prop, "[]")) {
    prop = (0, _replaceAll.default)(prop).call(prop, "[]", "[*]");
  }
  let arrToMerge = _jsonpath.default.query(firstObj, prop);
  let to = prop;
  for (let i = 0; i < objArr.length; i++) {
    arrToMerge = (0, _concat.default)(arrToMerge).call(arrToMerge, _jsonpath.default.query(objArr[i], to));
  }
  if ((0, _slice.default)(to).call(to, -3) === "[*]") to = to.substring(0, to.length - 3);
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
function mapObjArr(source, mapping) {
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
function mapObj(source, mapping) {
  let commonProps = {};
  let indexToObj = new _map2.default();
  let propsToMerge = new _set.default();
  let arrNodes = [];
  for (let [to, from] of (0, _entries.default)(mapping)) {
    var _context4;
    if (!from) continue;
    if ((0, _includes.default)(to).call(to, "[]")) {
      to = (0, _replaceAll.default)(to).call(to, "[]", "[*]");
      if ((0, _slice.default)(to).call(to, -3) !== "[*]") {
        propsToMerge.add(to.substring(0, (0, _lastIndexOf.default)(to).call(to, "[*]") + 3));
      } else {
        propsToMerge.add(to);
      }
    }
    let fn;
    let nodes;
    if ((0, _isArray.default)(from)) {
      if (from.length === 0) continue;
      fn = from.at(-1);
      from = (0, _slice.default)(from).call(from, 0, -1);
      if (typeof fn !== "function") {
        throw new Error("the last element of the 'from' array must be a function");
      }
      if (from.length === 0) {
        throw new Error("there should be at least one more element than the function in the 'from' array");
      }
      if (from.length === 1) {
        nodes = _jsonpath.default.nodes(source, from.at(0));
      } else {
        var _context3;
        let cpath = [];
        let cvalues = [];
        for (let fromv of from) {
          let tvalues = [];
          let tpath = [];
          let nodes = _jsonpath.default.nodes(source, fromv);
          for (let node of nodes) {
            tpath.push(node.path);
            tvalues.push(node.value);
          }
          cpath.push(tpath);
          cvalues.push(tvalues);
        }
        cvalues = (0, _map.default)(cvalues).call(cvalues, arr => {
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
        if (!(0, _some.default)(_context3 = (0, _flat.default)(cpath).call(cpath, 2)).call(_context3, el => (0, _isInteger.default)(el))) {
          for (let value of values) {
            commonProps = addProp(commonProps, to, value);
          }
          continue;
        }
        let cnodes = (0, _map.default)(values).call(values, (value, i) => {
          return {
            value,
            path: cproductp[i],
            to
          };
        });
        arrNodes = (0, _concat.default)(arrNodes).call(arrNodes, cnodes);
        continue;
      }
    }
    nodes = nodes ? nodes : _jsonpath.default.nodes(source, from);
    if (nodes.length === 0) continue;
    if (nodes.length === 1 && !(0, _some.default)(_context4 = nodes[0].path).call(_context4, el => (0, _isInteger.default)(el))) {
      let value = nodes[0].value;
      if (fn) value = fn(value);
      commonProps = addProp(commonProps, to, value);
      continue;
    }
    for (let node of nodes) {
      node.to = to;
      if (fn) node.value = fn(node.value);
    }
    arrNodes = (0, _concat.default)(arrNodes).call(arrNodes, nodes);
  }
  (0, _sort.default)(arrNodes).call(arrNodes, (a, b) => b.path.length - a.path.length);
  for (let node of arrNodes) {
    if (node.ignore) continue;
    let key = findParentPath(node.path, 1)?.toString();
    let obj = indexToObj.get(key) ?? {};
    obj = addProp(obj, node.to, node.value);
    let parentPath = findParentPath(node.path, 2);
    if (parentPath) {
      let parentNodes = (0, _filter.default)(arrNodes).call(arrNodes, otherNode => includesPath(otherNode.path, parentPath) && otherNode.path.length < node.path.length);
      if (parentNodes && parentNodes.length > 0) {
        for (let pNode of parentNodes) {
          pNode.ignore = true;
          obj = addProp(obj, _jsonpath.default.stringify(pNode.to), pNode.value);
        }
      }
    }
    indexToObj.set(key, obj);
  }
  if (indexToObj.size === 0) {
    return (0, _keys.default)(commonProps).length > 0 ? [commonProps] : [];
  }
  for (let obj of (0, _values.default)(indexToObj).call(indexToObj)) {
    (0, _assign.default)(obj, commonProps);
  }
  if (propsToMerge.size > 0) {
    var _context5;
    let indexParentToObjArr = new _map2.default();
    for (let to of (0, _values.default)(propsToMerge).call(propsToMerge)) {
      for (let [k, v] of (0, _entries2.default)(indexToObj).call(indexToObj)) {
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
    return (0, _flat.default)(_context5 = (0, _from.default)((0, _values.default)(indexParentToObjArr).call(indexParentToObjArr))).call(_context5);
  } else {
    var _context6;
    return (0, _flat.default)(_context6 = (0, _from.default)((0, _values.default)(indexToObj).call(indexToObj))).call(_context6);
  }
}
