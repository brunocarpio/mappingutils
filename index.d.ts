declare module "mappingutils" {
    /**
     * Add a `key` property to the object `obj` with the value `value`.
     * @param {object} obj - The input object.
     * @param {string} key - The path in the resulting object to set the value.
     * @param {object} value - The value to set.
     * @returns {object} A deep copy of the object with the new property added.
     */
    export function addProp(obj: object, key: string, value: object): object;
    /**
     * Merges the values of the `prop` property from each object within the `objArr` array.
     * @param {object[]} objArr - An array of objects.
     * @param {string} prop - The path to the array property to merge.
     * @returns {object} A deep copy of the first object in `objArr`, with its `prop` array containing the concatenated values from all objects in the `objArr`.
     */
    export function mergeObjArr(objArr: object[], prop: string): object;
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
    export function mapObjArr(source: object[], mapping: object): object[];
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
    export function mapObj(source: object, mapping: object): object[];
}
