import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    entry: "./index.js",
    mode: "production",
    output: {
        path: resolve(__dirname, "dist/"),
        filename: "mappingutils.min.js",
        library: {
            type: "module",
        },
    },
    experiments: {
        outputModule: true,
    },
};
