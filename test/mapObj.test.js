import { mapObj } from "../dist/main.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("mapping no nested objects", () => {
    it("should return an empty array", () => {
        let source = {
            notKey: "some value",
        };
        let mapping = {
            "$.otherKey": "$.key",
        };
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, []);
    });
    it("should map all types with a different name in the target", () => {
        let source = {
            number: 1,
            array: [1, 2, 3, 4],
            object: {
                object: "value",
            },
        };
        let mapping = {
            "$.otherNumber": "$.number",
            "$.otherArray": "$.array",
            "$.otherObject": "$.object",
        };
        let target = [
            {
                otherNumber: 1,
                otherArray: [1, 2, 3, 4],
                otherObject: {
                    object: "value",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
});
describe("mapping nested objects", () => {
    it("should wrap multiple properties in the target", () => {
        let source = {
            object: {
                propOne: 1,
                propTwo: "two",
                propThree: [1, 2, 3, "banana"],
            },
        };
        let mapping = {
            "$.objectWrapper.newObject.newPropOne": "$.object.propOne",
            "$.objectWrapper.newObject.newPropTwo": "$.object.propTwo",
            "$.objectWrapper.newObject.newPropThree": "$.object.propThree",
        };
        let target = [
            {
                objectWrapper: {
                    newObject: {
                        newPropOne: 1,
                        newPropTwo: "two",
                        newPropThree: [1, 2, 3, "banana"],
                    },
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
});
describe("mapping array values in the source object", () => {
    let source = {
        date: "20240921",
        items: [
            {
                item: 11111,
                availableCountries: [
                    {
                        country: "US",
                    },
                    {
                        country: "PE",
                    },
                    {
                        country: "CH",
                    },
                ],
            },
            {
                item: 22222,
                availableCountries: [
                    {
                        country: "UY",
                    },
                ],
            },
            {
                item: 33333,
                availableCountries: [
                    {
                        country: "BR",
                    },
                ],
            },
        ],
    };
    it("should return an empty array when the source object is empty", () => {
        let emptySource = {};
        let mapping = {
            "$.item": "$.items[0].item",
        };
        let arr = mapObj(emptySource, mapping);
        assert.deepEqual(arr, []);
    });
    it("should return an empty array when the mapping property does not exist", () => {
        let missingPropertySource = {
            date: "20240921",
        };
        let mapping = {
            "$.missingProperty": "$.items[*].nonExistentProperty",
        };
        let arr = mapObj(missingPropertySource, mapping);
        assert.deepEqual(arr, []);
    });
    it("should return an empty array when nested arrays are empty", () => {
        let emptyNestedArraySource = {
            date: "20240921",
            items: [
                {
                    item: 11111,
                    availableCountries: [],
                },
                {
                    item: 22222,
                    availableCountries: [],
                },
            ],
        };
        let mapping = {
            "$.constraints.availableCountry":
                "$.items[*].availableCountries[*].country",
        };
        let arr = mapObj(emptyNestedArraySource, mapping);
        assert.deepEqual(arr, []);
    });
    it("should return an empty array when the items array is empty", () => {
        let emptyItemsSource = {
            date: "20240921",
            items: [],
        };
        let mapping = {
            "$.item": "$.items[*].item",
        };
        let arr = mapObj(emptyItemsSource, mapping);
        assert.deepEqual(arr, []);
    });
    it("should create one object output, no extra property", () => {
        let mapping = {
            "$.item": "$.items[0].item",
        };
        let target = [
            {
                item: 11111,
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should create one object output, and an extra non array value", () => {
        let mapping = {
            "$.item": "$.items[0].item",
            "$.date": "$.date",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should create three objects one of each item", () => {
        let mapping = {
            "$.item": "$.items[*].item",
        };
        let target = [
            {
                item: 11111,
            },
            {
                item: 22222,
            },
            {
                item: 33333,
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should skip mappings when a property is missing in some items", () => {
        let incompleteSource = {
            date: "20240921",
            items: [
                {
                    item: 11111,
                    availableCountries: [{ country: "US" }],
                },
                {
                    item: 22222,
                },
                {
                    item: 33333,
                    availableCountries: [{ country: "BR" }],
                },
            ],
        };
        let mapping = {
            "$.constraints.availableCountry":
                "$.items[*].availableCountries[*].country",
        };
        let target = [
            {
                constraints: { availableCountry: "US" },
            },
            {
                constraints: { availableCountry: "BR" },
            },
        ];
        let arr = mapObj(incompleteSource, mapping);
        assert.deepEqual(arr, target);
    });
    it("should create two objects and an additional non array field", () => {
        let mapping = {
            "$.item": "$.items[*].item",
            "$.date": "$.date",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
            },
            {
                date: "20240921",
                item: 22222,
            },
            {
                date: "20240921",
                item: 33333,
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should create one object for every country value, nested array", () => {
        let mapping = {
            "$.constraints.availableCountry":
                "$.items[*].availableCountries[*].country",
        };
        let target = [
            {
                constraints: {
                    availableCountry: "US",
                },
            },
            {
                constraints: {
                    availableCountry: "PE",
                },
            },
            {
                constraints: {
                    availableCountry: "CH",
                },
            },
            {
                constraints: {
                    availableCountry: "UY",
                },
            },
            {
                constraints: {
                    availableCountry: "BR",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should create one object for every country value and an item value header for each of the five", () => {
        let mapping = {
            "$.item": "$.items[*].item",
            "$.constraints.availableCountry":
                "$.items[*].availableCountries[*].country",
        };
        let target = [
            {
                item: 11111,
                constraints: {
                    availableCountry: "US",
                },
            },
            {
                item: 11111,
                constraints: {
                    availableCountry: "PE",
                },
            },
            {
                item: 11111,
                constraints: {
                    availableCountry: "CH",
                },
            },
            {
                item: 22222,
                constraints: {
                    availableCountry: "UY",
                },
            },
            {
                item: 33333,
                constraints: {
                    availableCountry: "BR",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should create one object for every array value and the non repeating value should be present all of them", () => {
        let mapping = {
            "$.date": "$.date",
            "$.item": "$.items[*].item",
            "$.constraints.availableCountry":
                "$.items[*].availableCountries[*].country",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
                constraints: {
                    availableCountry: "US",
                },
            },
            {
                date: "20240921",
                item: 11111,
                constraints: {
                    availableCountry: "PE",
                },
            },
            {
                date: "20240921",
                item: 11111,
                constraints: {
                    availableCountry: "CH",
                },
            },
            {
                date: "20240921",
                item: 22222,
                constraints: {
                    availableCountry: "UY",
                },
            },
            {
                date: "20240921",
                item: 33333,
                constraints: {
                    availableCountry: "BR",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
});
describe("mapping array values in the target object", () => {
    let source = {
        date: "20240921",
        items: [
            {
                item: 11111,
                availableCountries: [
                    {
                        country: "US",
                        countryName: "United States",
                    },
                    {
                        country: "PE",
                        countryName: "Peru",
                    },
                    {
                        country: "CH",
                        countryName: "Chile",
                    },
                ],
            },
            {
                item: 22222,
                availableCountries: [
                    {
                        country: "UY",
                        countryName: "Uruguay",
                    },
                ],
            },
            {
                item: 33333,
                availableCountries: [
                    {
                        country: "BR",
                        countryName: "Brasil",
                    },
                ],
            },
        ],
    };
    it("should return an empty array when items array is empty", () => {
        let emptyItemsSource = {
            date: "20240921",
            items: [],
        };
        let mapping = {
            "$.availableCountries[]":
                "$.items[*].availableCountries[*].country",
        };
        let arr = mapObj(emptyItemsSource, mapping);
        assert.deepEqual(arr, []);
    });
    it("should aggregate all countries for item", () => {
        let mapping = {
            "$.date": "$.date",
            "$.item": "$.items[*].item",
            "$.availableCountries[]":
                "$.items[*].availableCountries[*].country",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
                availableCountries: ["US", "PE", "CH"],
            },
            {
                date: "20240921",
                item: 22222,
                availableCountries: ["UY"],
            },
            {
                date: "20240921",
                item: 33333,
                availableCountries: ["BR"],
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should add properties to objects in the target array", () => {
        let mapping = {
            "$.date": "$.date",
            "$.item": "$.items[*].item",
            "$.availableCountries[].code":
                "$.items[*].availableCountries[*].country",
            "$.availableCountries[].name":
                "$.items[*].availableCountries[*].countryName",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
                availableCountries: [
                    {
                        code: "US",
                        name: "United States",
                    },
                    {
                        code: "PE",
                        name: "Peru",
                    },
                    {
                        code: "CH",
                        name: "Chile",
                    },
                ],
            },
            {
                date: "20240921",
                item: 22222,
                availableCountries: [
                    {
                        code: "UY",
                        name: "Uruguay",
                    },
                ],
            },
            {
                date: "20240921",
                item: 33333,
                availableCountries: [{ code: "BR", name: "Brasil" }],
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should handle items with empty availableCountries arrays", () => {
        let sourceWithEmptyCountries = {
            date: "20240921",
            items: [
                {
                    item: 11111,
                    availableCountries: [],
                },
                {
                    item: 22222,
                    availableCountries: [
                        {
                            country: "UY",
                            countryName: "Uruguay",
                        },
                    ],
                },
                {
                    item: 33333,
                    availableCountries: [],
                },
            ],
        };
        let mapping = {
            "$.date": "$.date",
            "$.item": "$.items[*].item",
            "$.availableCountries[]":
                "$.items[*].availableCountries[*].country",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
            },
            {
                date: "20240921",
                item: 22222,
                availableCountries: ["UY"],
            },
            {
                date: "20240921",
                item: 33333,
            },
        ];
        let arr = mapObj(sourceWithEmptyCountries, mapping);
        assert.deepEqual(new Set(arr), new Set(target));
    });
    it("should handle missing properties in availableCountries", () => {
        let sourceWithMissingProps = {
            date: "20240921",
            items: [
                {
                    item: 11111,
                    availableCountries: [
                        {
                            country: "US",
                        },
                        {
                            countryName: "Peru",
                        },
                    ],
                },
            ],
        };
        let mapping = {
            "$.date": "$.date",
            "$.item": "$.items[*].item",
            "$.availableCountries[].code":
                "$.items[*].availableCountries[*].country",
            "$.availableCountries[].name":
                "$.items[*].availableCountries[*].countryName",
        };
        let target = [
            {
                date: "20240921",
                item: 11111,
                availableCountries: [
                    {
                        code: "US",
                    },
                    {
                        name: "Peru",
                    },
                ],
            },
        ];
        let arr = mapObj(sourceWithMissingProps, mapping);
        assert.deepEqual(arr, target);
    });
    it("should merge an array value", () => {
        let source = {
            items: [
                {
                    item_id: "ITEM-001",
                    description: "Wireless Keyboard",
                    quantity: 1,
                    unit_price: 49.99,
                    total: 49.99,
                },
                {
                    item_id: "ITEM-002",
                    description: "Bluetooth Mouse",
                    quantity: 2,
                    unit_price: 25.5,
                    total: 51.0,
                },
            ],
        };
        let mapping = {
            "$.line_items[]": "$.items[*]",
        };
        let target = [
            {
                line_items: [
                    {
                        item_id: "ITEM-001",
                        description: "Wireless Keyboard",
                        quantity: 1,
                        unit_price: 49.99,
                        total: 49.99,
                    },
                    {
                        item_id: "ITEM-002",
                        description: "Bluetooth Mouse",
                        quantity: 2,
                        unit_price: 25.5,
                        total: 51.0,
                    },
                ],
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
});
describe("mapping with filters in the source", () => {
    let sourceStr = `
    {
        "storeNumber": "098",
        "store": {
            "book": [ 
                {
                    "category": "reference",
                    "author": "Nigel Rees",
                    "title": "Sayings of the Century",
                    "price": 8.95
                }, {
                    "category": "fiction",
                    "author": "Evelyn Waugh",
                    "title": "Sword of Honour",
                    "price": 12.99
                }, {
                    "category": "fiction",
                    "author": "Herman Melville",
                    "title": "Moby Dick",
                    "isbn": "0-553-21311-3",
                    "price": 8.99
                }, {
                    "category": "fiction",
                    "author": "J. R. R. Tolkien",
                    "title": "The Lord of the Rings",
                    "isbn": "0-395-19395-8",
                    "price": 22.99
                }
            ],
            "bicycle": {
                "color": "red",
                "price": 19.95
            }
        }
    }
    `;
    let source = JSON.parse(sourceStr);
    it("should filter only the reference category book", () => {
        let mapping = {
            "$.categories": '$.store.book[?(@.category=="reference")]',
        };
        let target = [
            {
                categories: {
                    category: "reference",
                    author: "Nigel Rees",
                    title: "Sayings of the Century",
                    price: 8.95,
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should filter only the fiction category books", () => {
        let mapping = {
            "$.store": "$.storeNumber",
            "$.book.author": '$.store.book[?(@.category=="fiction")].author',
            "$.book.title": '$.store.book[?(@.category=="fiction")].title',
        };
        let target = [
            {
                store: "098",
                book: {
                    author: "Evelyn Waugh",
                    title: "Sword of Honour",
                },
            },
            {
                store: "098",
                book: {
                    author: "Herman Melville",
                    title: "Moby Dick",
                },
            },
            {
                store: "098",
                book: {
                    author: "J. R. R. Tolkien",
                    title: "The Lord of the Rings",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should filter the first book", () => {
        let mapping = {
            "$.store": "$.storeNumber",
            "$.book.author": "$.store.book[0].author",
            "$.book.title": "$.store.book[0].title",
        };
        let target = [
            {
                store: "098",
                book: {
                    author: "Nigel Rees",
                    title: "Sayings of the Century",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should filter the last book", () => {
        let mapping = {
            "$.store": "$.storeNumber",
            "$.book.author": "$.store.book[(@.length-1)].author",
            "$.book.title": "$.store.book[(@.length-1)].title",
        };
        let target = [
            {
                store: "098",
                book: {
                    author: "J. R. R. Tolkien",
                    title: "The Lord of the Rings",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should filter the first two books via subscript union", () => {
        let mapping = {
            "$.store": "$.storeNumber",
            "$.book.author": "$.store.book[0,1].author",
            "$.book.title": "$.store.book[0,1].title",
        };
        let target = [
            {
                store: "098",
                book: {
                    author: "Nigel Rees",
                    title: "Sayings of the Century",
                },
            },
            {
                store: "098",
                book: {
                    author: "Evelyn Waugh",
                    title: "Sword of Honour",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should filter the last book via slice", () => {
        let mapping = {
            "$.store": "$.storeNumber",
            "$.book.author": "$.store.book[-1:].author",
            "$.book.title": "$.store.book[-1:].title",
        };
        let target = [
            {
                store: "098",
                book: {
                    author: "J. R. R. Tolkien",
                    title: "The Lord of the Rings",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should filter the first two books via subscript array slice", () => {
        let mapping = {
            "$.store": "$.storeNumber",
            "$.book.author": "$.store.book[:2].author",
            "$.book.title": "$.store.book[:2].title",
        };
        let target = [
            {
                store: "098",
                book: {
                    author: "Nigel Rees",
                    title: "Sayings of the Century",
                },
            },
            {
                store: "098",
                book: {
                    author: "Evelyn Waugh",
                    title: "Sword of Honour",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
});
describe("mapping with functions", () => {
    let sourceStr = `
    {
        "storeNumber": "098",
            "store": {
                "book": [
                    {
                        "category": "reference",
                        "author": "Nigel Rees",
                        "title": "  Sayings of the Century     ",
                        "price": 8.95
                    },
                    {
                        "category": "fiction",
                        "author": "Evelyn Waugh",
                        "title": "Sword of Honour",
                        "price": 12.99
                    },
                    {
                        "category": "fiction",
                        "author": "Herman Melville",
                        "title": "Moby Dick",
                        "isbn": "0-553-21311-3",
                        "price": 8.99
                    },
                    {
                        "category": "fiction",
                        "author": "J. R. R. Tolkien",
                        "title": "The Lord of the Rings",
                        "isbn": "0-395-19395-8",
                        "price": 22.99
                    }
                ]
            }
    }
    `;
    let source = JSON.parse(sourceStr);
    it("should apply uppercase to the authors and trim the title names", () => {
        let mapping = {
            "$.book.author": [
                '$.store.book[?(@.category=="reference")].author',
                (author) => author.toUpperCase(),
            ],
            "$.book.title": [
                '$.store.book[?(@.category=="reference")].title',
                (title) => title.trim(),
            ],
        };
        let target = [
            {
                book: {
                    author: "NIGEL REES",
                    title: "Sayings of the Century",
                },
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
    it("should apply function to object", () => {
        let source = {
            items: [
                {
                    item_id: "ITEM-001",
                    description: "Wireless Keyboard",
                    quantity: 1,
                    unit_price: 49.99,
                    total: 49.99,
                },
                {
                    item_id: "ITEM-002",
                    description: "Bluetooth Mouse",
                    quantity: 2,
                    unit_price: 25.5,
                    total: 51.0,
                },
            ],
        };
        let mapping = {
            "$.line_items[]": [
                "$.items[*]",
                (item) => {
                    return {
                        item_sku: item.item_id,
                        item_desc: item.description,
                    };
                },
            ],
        };
        let target = [
            {
                line_items: [
                    {
                        item_sku: "ITEM-001",
                        item_desc: "Wireless Keyboard",
                    },
                    {
                        item_sku: "ITEM-002",
                        item_desc: "Bluetooth Mouse",
                    },
                ],
            },
        ];
        let arr = mapObj(source, mapping);
        assert.deepEqual(arr, target);
    });
});
describe("mapping with multiple from values", () => {
    it("should map and concatenate properties using a function", () => {
        let source = {
            event: {
                data: {
                    name: "James",
                    lastName: "Bond",
                },
            },
        };
        let mapping = {
            "$.agent": [
                "$.event.data.name",
                "$.event.data.lastName",
                (a, b) => `${a} ${b}`,
            ],
        };
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, [{ agent: "James Bond" }]);
    });
    it("should handle missing properties in source", () => {
        let source = {
            event: {
                data: {
                    lastName: "Bond",
                },
            },
        };
        let mapping = {
            "$.agent": [
                "$.event.data.name",
                "$.event.data.lastName",
                (a, b) => `${a} ${b}`,
            ],
        };
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, [{ agent: " Bond" }]);
    });
    it("should handle multiple mappings in a single mapping", () => {
        let source = {
            event: {
                agency: "MI6",
                data: {
                    name: "James",
                    lastName: "Bond",
                },
            },
        };
        let mapping = {
            "$.agency": "$.event.agency",
            "$.agent": [
                "$.event.data.name",
                "$.event.data.lastName",
                (a, b) => `${a} ${b}`,
            ],
        };
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, [
            { agency: "MI6", agent: "James Bond" },
        ]);
    });
    it("should handle complex mapping functions with nested paths", () => {
        let source = {
            person: {
                name: "John",
                lastName: "Doe",
                details: {
                    birthDate: "1980-01-01",
                    nationality: "British",
                },
            },
        };
        let mapping = {
            "$.summary": [
                "$.person.name",
                "$.person.lastName",
                "$.person.details.birthDate",
                (firstName, lastName, birthDate) => {
                    const age =
                        new Date().getFullYear() -
                        new Date(birthDate).getFullYear();
                    return `${firstName} ${lastName}, Age: ${age}`;
                },
            ],
        };
        let output = mapObj(source, mapping);
        let currentYear = new Date().getFullYear();
        let expectedAge = currentYear - 1979;
        assert.deepStrictEqual(output, [
            { summary: `John Doe, Age: ${expectedAge}` },
        ]);
    });
    it("should handle mapping functions that throw errors", () => {
        let source = {
            user: {
                lastName: "Doe",
            },
        };
        let mapping = {
            "$.fullName": [
                "$.user.name",
                "$.user.lastName",
                (firstName, lastName) => {
                    if (!firstName || !lastName) {
                        throw new Error("Missing name components");
                    }
                    return `${firstName} ${lastName}`;
                },
            ],
        };
        assert.throws(() => mapObj(source, mapping), {
            name: "Error",
            message: /Missing name components/,
        });
    });
    it("should handle edge case where mapping function returns undefined", () => {
        let source = {
            event: {
                details: {
                    type: "Conference",
                    year: "2024",
                },
            },
        };
        let mapping = {
            "$.summary": [
                "$.event.details.type",
                "$.event.details.year",
                (_type, _year) => {
                    return undefined;
                },
            ],
        };
        let target = [
            {
                summary: "",
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should handle complex function that uses intermediate values from object", () => {
        let source = {
            order: {
                item: {
                    name: "Laptop",
                    price: 1000,
                },
                discount: 0.1,
            },
        };
        let mapping = {
            "$.finalPrice": [
                "$.order.item.price",
                "$.order.discount",
                (price, discount) => {
                    return price - price * discount;
                },
            ],
        };
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, [{ finalPrice: 900 }]);
    });
});
describe("adding default values", () => {
    it("should add a default number", () => {
        let source = {
            message: "hi",
        };
        let mapping = {
            "$.id": 12345,
            "$.message": "$.message",
        };
        let target = [
            {
                id: 12345,
                message: "hi",
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should add a default number an empty source", () => {
        let source = {};
        let mapping = {
            "$.id": 12345,
            "$.message": "$.message",
        };
        let target = [
            {
                id: 12345,
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should add a default string", () => {
        let source = {
            message: "hi",
        };
        let mapping = {
            "$.sender": "automatic",
            "$.message": "$.message",
        };
        let target = [
            {
                sender: "automatic",
                message: "hi",
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should add a default object", () => {
        let source = {
            message: "hi",
        };
        let mapping = {
            "$.message": "$.message",
            "$.users": {
                name: "AB",
                age: 31,
            },
        };
        let target = [
            {
                message: "hi",
                users: {
                    name: "AB",
                    age: 31,
                },
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should add a default boolean", () => {
        let source = {
            message: "hi",
        };
        let mapping = {
            "$.message": "$.message",
            "$.active": true,
        };
        let target = [
            {
                message: "hi",
                active: true,
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should add a default null", () => {
        let source = {
            message: "hi",
        };
        let mapping = {
            "$.message": "$.message",
            "$.number": null,
        };
        let target = [
            {
                message: "hi",
                number: null,
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
    it("should add a default array", () => {
        let source = {
            message: "hi",
        };
        let mapping = {
            "$.message": "$.message",
            "$.users": ["A", 12, { name: "AAB" }],
        };
        let target = [
            {
                message: "hi",
                users: ["A", 12, { name: "AAB" }],
            },
        ];
        let output = mapObj(source, mapping);
        assert.deepStrictEqual(output, target);
    });
});
