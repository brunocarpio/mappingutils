import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Jison from "jison";
import { grammar } from "../lib/grammar.js";

let __filename = fileURLToPath(import.meta.url);

try {
    let parser = Jison.Parser(grammar);
    let source = parser.generate();
    writeFileSync(
        path.resolve(path.dirname(__filename), "./gparser.js"),
        source,
    );
} catch (error) {
    console.error(error);
}
