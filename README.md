# mappingutils

Transform input objects with ease.


## MapObj Example

```javascript
import { mapObj } from "mappingutils";

let source = `
{
    "store": {
        "book": [
            {
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
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
        ],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    },
    "expensive": 10
}
`;

let transformation = [
    {
        from: 'store.book[?(@.category=="fiction")].category',
        to: "category",
    },
    {
        from: 'store.book[?(@.category=="fiction")].author',
        to: "author",
    },
    {
        from: 'store.book[?(@.category=="fiction")].title',
        to: "book.title",
    },
    {
        from: 'store.book[?(@.category=="fiction")].price',
        to: "book.price",
    },
];

let outputArr = mapObj(JSON.parse(source), transformation);
console.log(JSON.stringify(outputArr, null, 2));

// [
//   {
//     "category": "fiction",
//     "author": "Evelyn Waugh",
//     "book": {
//       "title": "Sword of Honour",
//       "price": 12.99
//     }
//   },
//   {
//     "category": "fiction",
//     "author": "Herman Melville",
//     "book": {
//       "title": "Moby Dick",
//       "price": 8.99
//     }
//   },
//   {
//     "category": "fiction",
//     "author": "J. R. R. Tolkien",
//     "book": {
//       "title": "The Lord of the Rings",
//       "price": 22.99
//     }
//   }
// ]

```
It uses [JSONPath](https://www.npmjs.com/package/jsonpath#jsonpath-syntax) syntax for selecting the values from the input and a similar syntax for the output.

Another example where grouping by books for the fiction category using the same input as before.

```javascript
import { mapObj, mergeObjArr } from "mappingutils";

let transformation = [
    {
        from: 'store.book[?(@.category=="fiction")].category',
        to: "category",
    },
    {
        from: 'store.book[?(@.category=="fiction")].title',
        to: "books[].name",
    },
    {
        from: 'store.book[?(@.category=="fiction")].author',
        to: "books[].author",
    },
];

let outputArr = mapObj(JSON.parse(source), transformation);
let merged = mergeObjArr(outputArr, "books[*]");
console.log(JSON.stringify(merged, null, 2));

// {
//   "category": "fiction",
//   "books": [
//     {
//       "name": "Sword of Honour",
//       "author": "Evelyn Waugh"
//     },
//     {
//       "name": "Moby Dick",
//       "author": "Herman Melville"
//     },
//     {
//       "name": "The Lord of the Rings",
//       "author": "J. R. R. Tolkien"
//     }
//   ]
// }

```


## Methods

#### addProp(obj, key, value)

Add a `key` property to the object `obj` with the value `value`. Returns a deep copy of the object with the new property added.

#### mergeObjArr(objArr, prop)

Merge the `prop` array values of  the object `objArr`.  Returns a deep copy of the first object in the array, with the `prop` array values concatenated.

#### mapObj(source, mappings)

Transforms an input object `source` given the provided array of mappings `mappings`.  Returns an array of objects resulting from transforming the input object.

#### mapObjArr(source, mappings)

 Transforms an input array of objects `source` given the provided array of mappings `mappings`. Returns an array of objects resulting from transforming the input objects.


## License

MIT