import { describe, it } from "node:test";
import { parse } from "../dist/lib/validators.js";
import assert from "node:assert/strict";

describe("parse simple path to path", () => {
    it("should parse simple path to simple path", () => {
        let mapping = {
            "$.otherKey": "$.key",
        };
        assert.ok(parse(mapping));
    });
    it("should parse simple path to simple number", () => {
        let mapping = {
            "$.otherKey": 12,
            "$.otherKeyTwo": -12,
        };
        assert.ok(parse(mapping));
    });
    it("should parse simple path to path with filter, no string inside path", () => {
        let mapping = {
            "$.item": "$.items[0].item",
            "$.price": "$.store.book[?(@.price < 10)]",
            "$.cheap": "$.store.book[?(@.price < $.expensive)]",
        };
        assert.ok(parse(mapping));
    });
    it("should parse simple path to path with filter, string inside path", () => {
        let mapping = {
            "$.categories": '$.store.book[?(@.category=="reference")]',
        };
        assert.ok(parse(mapping));
    });
});

describe("path with filter to path", () => {
    it("should parse path with filter to simple path", () => {
        let mapping = {
            "$.store.book[0].author": "$.author",
        };
        assert.ok(parse(mapping));
    });
    it("should parse path with filter to path with filter, with no simple path to path with filter", () => {
        let mapping = {
            "$.countries[?(@.available === 'true')]":
                "$.items[*].availableCountries[*].country",
        };
        assert.ok(parse(mapping));
    });
    it("should parse path with filter to path with filter, with simple path to path with filter", () => {
        let mapping = {
            "$.item": "$.items[*].item",
            "$.countries[?(@.available === 'true')]":
                "$.items[*].availableCountries[*].country",
        };
        assert.ok(parse(mapping));
    });
});
