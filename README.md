# mappingutils

Transform input objects with ease.

## MapObj Example

```javascript
import { mapObj } from "mappingutils";

let source = {
    store: {
        book: [
            {
                category: "reference",
                author: "Nigel Rees",
                title: "     Sayings of the Century",
                price: 8.95,
            },
            {
                category: "fiction",
                author: "Evelyn Waugh",
                title: "        Sword of Honour   ",
                price: 12.99,
            },
        ],
    },
};

let transformation = [
    {
        from: "store.book[*].category",
        to: "category",
        fn: (category) => category.toUpperCase(),
    },
    {
        from: "store.book[*].title",
        to: "book.title",
        fn: (title) => title.trim(),
    },
    {
        from: "store.book[*].price",
        to: "book.price",
    },
];

let outputArr = mapObj(source, transformation);
console.log(JSON.stringify(outputArr, null, 2));

//[
//  {
//    "category": "REFERENCE",
//    "book": {
//      "title": "Sayings of the Century",
//      "price": 8.95
//    }
//  },
//  {
//    "category": "FICTION",
//    "book": {
//      "title": "Sword of Honour",
//      "price": 12.99
//    }
//  }
//]
```

It uses [JSONPath](https://www.npmjs.com/package/jsonpath#jsonpath-syntax) syntax for selecting the values from the input and a similar syntax for the output.

Another example where grouping by books for the fiction category using the same input as before.

```javascript
import { mapObj, mergeObjArr } from "mappingutils";

let transformation = [
    {
        from: "store.book[*].category",
        to: "category",
    },
    {
        from: "store.book[*].title",
        to: "books[].name",
        fn: (title) => title.trim(),
    },
    {
        from: "store.book[*].author",
        to: "books[].author",
        fn: (author) => author.toUpperCase(),
    },
];

let outputArr = mapObj(source, transformation);
let merged = mergeObjArr(outputArr, "books[*]");
console.log(JSON.stringify(merged, null, 2));

//{
//  "category": "reference",
//  "books": [
//    {
//      "name": "Sayings of the Century",
//      "author": "NIGEL REES"
//    },
//    {
//      "name": "Sword of Honour",
//      "author": "EVELYN WAUGH"
//    }
//  ]
//}
```

## Methods

#### addProp(obj, key, value)

Add a `key` property to the object `obj` with the value `value`. Returns a deep copy of the object with the new property added.

#### mergeObjArr(objArr, prop)

Merge the `prop` array values of the object `objArr`. Returns a deep copy of the first object in the array, with the `prop` array values concatenated.

#### mapObj(source, mappings)

Transforms an input object `source` given the provided array of mappings `mappings`. Returns an array of objects resulting from transforming the input object.

#### mapObjArr(source, mappings)

Transforms an input array of objects `source` given the provided array of mappings `mappings`. Returns an array of objects resulting from transforming the input objects.

## License

MIT
