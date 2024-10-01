//@ts-check

import assert from "node:assert/strict";
import { mapObj } from "../dist/index.js";
import { describe, it } from "node:test";

describe("mapping no nested objects", () => {
    let transformation = [
        {
            from: "key",
            to: "otherKey",
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
                from: "number",
                to: "otherNumber",
            },
            {
                from: "array",
                to: "otherArray",
            },
            {
                from: "object",
                to: "otherObject",
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
            from: "key",
            to: "object.anotherKey",
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
                from: "object.propOne",
                to: "objectWrapper.newObject.newPropOne",
            },
            {
                from: "object.propTwo",
                to: "objectWrapper.newObject.newPropTwo",
            },
            {
                from: "object.propThree",
                to: "objectWrapper.newObject.newPropThree",
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

    it("should create one object output, no extra property", () => {
        let transformation = [
            {
                from: "items[0].item",
                to: "item",
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
                from: "items[0].item",
                to: "item",
            },
            {
                from: "date",
                to: "date",
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
                from: "items[*].item",
                to: "item",
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

    it("should create two objects and an additional non array field", () => {
        let transformation = [
            {
                from: "items[*].item",
                to: "item",
            },
            {
                from: "date",
                to: "date",
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
                from: "items[*].availableCountries[*].country",
                to: "constraints.availableCountry",
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
                from: "items[*].item",
                to: "item",
            },
            {
                from: "items[*].availableCountries[*].country",
                to: "constraints.availableCountry",
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
                from: "date",
                to: "date",
            },
            {
                from: "items[*].item",
                to: "item",
            },
            {
                from: "items[*].availableCountries[*].country",
                to: "constraints.availableCountry",
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

        it("should aggregate all countries for item", () => {
            let transformation = [
                {
                    from: "date",
                    to: "date",
                },
                {
                    from: "items[*].item",
                    to: "item",
                },
                {
                    from: "items[*].availableCountries[*].country",
                    to: "availableCountries[]",
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
                    from: "date",
                    to: "date",
                },
                {
                    from: "items[*].item",
                    to: "item",
                },
                {
                    from: "items[*].availableCountries[*].country",
                    to: "availableCountries[].code",
                },
                {
                    from: "items[*].availableCountries[*].countryName",
                    to: "availableCountries[].name",
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
                    availableCountries: [
                        {
                            code: "BR",
                            name: "Brasil",
                        },
                    ],
                },
            ];
            let arr = mapObj(source, transformation);
            assert.deepEqual(arr, target);
        });
    });
});
