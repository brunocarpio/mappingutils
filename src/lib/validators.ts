import { preprocess } from "./preprocessor.js";
import parser from "../bin/gparser.js";

/**
 * @returns true if the specified mapping object is valid against the grammar
 * @throws { Error }
 * This exeception is thrown if the input is not a valid mapping against the grammar
 */
export function parse(mapping: object): boolean {
    return parser.parse(preprocess(mapping));
}

export function isStrPath(str: unknown) {
    return typeof str === "string" && str[0] === "$";
}

export function isArrPath(arr: unknown): boolean {
    return Array.isArray(arr) && arr[0] && isStrPath(arr[0]);
}
