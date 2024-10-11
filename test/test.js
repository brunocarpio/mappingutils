//@ts-check

import assert from "node:assert/strict";
import { mapObj } from "../index.js";
import { describe, it } from "node:test";

describe("mapping no nested objects", () => {
    let transformation = [
        {
            from: "$.key",
            to: "$.otherKey",
        },
    ];

    it("should return an empty array", () => {
        let source = {
            notKey: "some value",
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 0);
    });

    it("should map a string value", () => {
        let source = {
            key: "some value",
        };
        let target = {
            otherKey: "some value",
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should map an array value", () => {
        let source = {
            key: [1, 2, 3, 4],
        };
        let target = {
            otherKey: [1, 2, 3, 4],
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should map an object value", () => {
        let source = {
            key: {
                object: "some value",
            },
        };
        let target = {
            otherKey: {
                object: "some value",
            },
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should map all types with a different name in the target", () => {
        let transformation = [
            {
                from: "$.number",
                to: "$.otherNumber",
            },
            {
                from: "$.array",
                to: "$.otherArray",
            },
            {
                from: "$.object",
                to: "$.otherObject",
            },
        ];

        let source = {
            number: 1,
            array: [1, 2, 3, 4],
            object: {
                object: "value",
            },
        };

        let target = {
            otherNumber: 1,
            otherArray: [1, 2, 3, 4],
            otherObject: {
                object: "value",
            },
        };

        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });
});

describe("mapping nested objects", () => {
    let transformation = [
        {
            from: "$.key",
            to: "$.object.anotherKey",
        },
    ];

    it("should wrap a string value in the target", () => {
        let source = {
            key: "value",
        };

        let target = {
            object: {
                anotherKey: "value",
            },
        };

        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should wrap an array value in the target", () => {
        let source = {
            key: [1, 2, 3, 4, 5],
        };

        let target = {
            object: {
                anotherKey: [1, 2, 3, 4, 5],
            },
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should wrap an object value in the target", () => {
        let source = {
            key: {
                propOne: 1,
                propTwo: "two",
                propThree: [1, 2, 3, "banana"],
            },
        };

        let target = {
            object: {
                anotherKey: {
                    propOne: 1,
                    propTwo: "two",
                    propThree: [1, 2, 3, "banana"],
                },
            },
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should wrap multiple properties in the target", () => {
        let transformation = [
            {
                from: "$.object.propOne",
                to: "$.objectWrapper.newObject.newPropOne",
            },
            {
                from: "$.object.propTwo",
                to: "$.objectWrapper.newObject.newPropTwo",
            },
            {
                from: "$.object.propThree",
                to: "$.objectWrapper.newObject.newPropThree",
            },
        ];

        let source = {
            object: {
                propOne: 1,
                propTwo: "two",
                propThree: [1, 2, 3, "banana"],
            },
        };

        let target = {
            objectWrapper: {
                newObject: {
                    newPropOne: 1,
                    newPropTwo: "two",
                    newPropThree: [1, 2, 3, "banana"],
                },
            },
        };
        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
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
        let transformation = [
            {
                from: "$.items[0].item",
                to: "$.item",
            },
        ];
        let arr = mapObj(emptySource, transformation);
        assert.equal(arr.length, 0);
    });

    it("should return an empty array when the transformation property does not exist", () => {
        let missingPropertySource = {
            date: "20240921",
        };

        let transformation = [
            {
                from: "$.items[*].nonExistentProperty",
                to: "$.missingProperty",
            },
        ];

        let arr = mapObj(missingPropertySource, transformation);
        assert.equal(arr.length, 0);
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

        let transformation = [
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.constraints.availableCountry",
            },
        ];

        let arr = mapObj(emptyNestedArraySource, transformation);
        assert.equal(arr.length, 0);
    });

    it("should return an empty array when the items array is empty", () => {
        let emptyItemsSource = {
            date: "20240921",
            items: [],
        };
        let transformation = [
            {
                from: "$.items[*].item",
                to: "$.item",
            },
        ];
        let arr = mapObj(emptyItemsSource, transformation);
        assert.equal(arr.length, 0);
    });

    it("should create one object output, no extra property", () => {
        let transformation = [
            {
                from: "$.items[0].item",
                to: "$.item",
            },
        ];

        let target = {
            item: 11111,
        };

        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should create one object output, and an extra non array value", () => {
        let transformation = [
            {
                from: "$.items[0].item",
                to: "$.item",
            },
            {
                from: "$.date",
                to: "$.date",
            },
        ];

        let target = {
            date: "20240921",
            item: 11111,
        };

        let arr = mapObj(source, transformation);
        assert.equal(arr.length, 1);
        assert.deepEqual(arr[0], target);
    });

    it("should create three objects one of each item", () => {
        let transformation = [
            {
                from: "$.items[*].item",
                to: "$.item",
            },
        ];

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

        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });

    it("should skip transformations when a property is missing in some items", () => {
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

        let transformation = [
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.constraints.availableCountry",
            },
        ];

        let target = [
            {
                constraints: { availableCountry: "US" },
            },
            {
                constraints: { availableCountry: "BR" },
            },
        ];

        let arr = mapObj(incompleteSource, transformation);
        assert.deepEqual(arr, target);
    });

    it("should create two objects and an additional non array field", () => {
        let transformation = [
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.date",
                to: "$.date",
            },
        ];

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

        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });

    it("should create one object for every country value, nested array", () => {
        let transformation = [
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.constraints.availableCountry",
            },
        ];

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

        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });

    it("should create one object for every country value and an item value header for each of the five", () => {
        let transformation = [
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.constraints.availableCountry",
            },
        ];

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

        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });

    it("should create one object for every array value and the non repeating value should be present all of them", () => {
        let transformation = [
            {
                from: "$.date",
                to: "$.date",
            },
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.constraints.availableCountry",
            },
        ];

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

        let arr = mapObj(source, transformation);
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

        let transformation = [
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.availableCountries[]",
            },
        ];

        let arr = mapObj(emptyItemsSource, transformation);
        assert.equal(arr.length, 0);
    });

    it("should aggregate all countries for item", () => {
        let transformation = [
            {
                from: "$.date",
                to: "$.date",
            },
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.availableCountries[]",
            },
        ];

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
        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });

    it("should add properties to objects in the target array", () => {
        let transformation = [
            {
                from: "$.date",
                to: "$.date",
            },
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.availableCountries[].code",
            },
            {
                from: "$.items[*].availableCountries[*].countryName",
                to: "$.availableCountries[].name",
            },
        ];

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
        let arr = mapObj(source, transformation);
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

        let transformation = [
            {
                from: "$.date",
                to: "$.date",
            },
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.availableCountries[]",
            },
        ];

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

        let arr = mapObj(sourceWithEmptyCountries, transformation);
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

        let transformation = [
            {
                from: "$.date",
                to: "$.date",
            },
            {
                from: "$.items[*].item",
                to: "$.item",
            },
            {
                from: "$.items[*].availableCountries[*].country",
                to: "$.availableCountries[].code",
            },
            {
                from: "$.items[*].availableCountries[*].countryName",
                to: "$.availableCountries[].name",
            },
        ];

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

        let arr = mapObj(sourceWithMissingProps, transformation);
        assert.deepEqual(arr, target);
    });
});

describe("mapping with filters in the source", () => {
    let source = `
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
    source = JSON.parse(source);
    it("should filter only the reference category book", () => {
        let transformation = [
            {
                from: '$.store.book[?(@.category=="reference")]',
                to: "$.categories",
            },
        ];

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
        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });
    it("should filter only the fiction category books", () => {
        let transformation = [
            {
                from: "$.storeNumber",
                to: "$.store",
            },
            {
                from: '$.store.book[?(@.category=="fiction")].author',
                to: "$.book.author",
            },
            {
                from: '$.store.book[?(@.category=="fiction")].title',
                to: "$.book.title",
            },
        ];

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
        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });
});

describe("mapping with functions", () => {
    let source = `
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
    source = JSON.parse(source);
    it("should apply uppercase to the authors and trim the title names", () => {
        let transformation = [
            {
                from: '$.store.book[?(@.category=="reference")].author',
                to: "$.book.author",
                fn: (author) => author.toUpperCase(),
            },
            {
                from: '$.store.book[?(@.category=="reference")].title',
                to: "$.book.title",
                fn: (title) => title.trim(),
            },
        ];

        let target = [
            {
                book: {
                    author: "NIGEL REES",
                    title: "Sayings of the Century",
                },
            },
        ];
        let arr = mapObj(source, transformation);
        assert.deepEqual(arr, target);
    });
});
