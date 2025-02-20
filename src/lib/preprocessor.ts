function replacer(_: string, v: unknown) {
    if (typeof v === "function") {
        return "FUNCTION";
    } else {
        return v;
    }
}

export function preprocess(mapping: object) {
    return JSON.stringify(mapping, replacer)
        .replaceAll('\\"', "'")
        .replaceAll('\"FUNCTION\"', "'FUNCTION'");
}
