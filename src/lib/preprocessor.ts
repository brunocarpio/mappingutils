import jp from "jsonpath";

export function preprocess(mapping: object) {
    for (let k of Object.keys(mapping)) {
        jp.parse(k);
    }
    let values = Object.values(mapping);
    for (let i = 0; i < values.length; i++) {
        let v = values[i];
        if (Array.isArray(v)) {
            for (let j = 0; j < v.length; j++) {
                if (typeof v[j] === "function") {
                    v[j] = `FUNCTION:"${v[j].toString()}`;
                }
            }
        } else if (typeof v === "function") {
            values[i] = `FUNCTION:"${values[i].toString()}`;
        }
    }

    return JSON.stringify(values);
}
