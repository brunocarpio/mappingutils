# mappingutils

Lightweight JSON transformation utility.

## Table of Contents
- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Use cases](#use-cases)
- [Functions](#functions)
  - [addProp(obj, key, value)](#addpropobj-key-value)
  - [mergeObjArr(objArr, prop)](#mergeobjarrobjarr-prop)
  - [mapObj(source, mappings)](#mapobjsource-mappings)
  - [mapObjArr(source, mappings)](#mapobjarrsource-mappings)
- [Running tests](#running-tests)
- [Issue reporting](#issue-reporting)
- [Contributing](#contributing)
- [License](#license)

## Installation

`npm install mappingutils`

## Basic usage
This package uses JSONPath to query the values from the input objects and to set the values on the target objects.
Check out [JSONPath](https://www.npmjs.com/package/jsonpath#jsonpath-syntax) for more details on the syntax.

```javascript
import { mapObj } from "mappingutils";

let source = {
  event: {
    agency: "MI6",
    data: {
      name: "James",
      lname: "Bond",
      id: "007",
    },
  },
};

let mapping = {
  "$.code": "$.event.data.id",
  "$.private.agency": "$.event.agency",
  "$.private.agent": [
      "$.event.data.name",
      "$.event.data.lname",
      (a, b) => `${a} ${b}`.toUpperCase(),
  ],
};

let output = mapObj(source, mapping);
console.log(output);
```

```javascript
[
  {
    code: "007",
    private: {
      agency: "MI6",
      agent: "JAMES BOND",
    }
  }
]
```

## Use cases
Here are some practical scenarios where mappingutils can be useful:

* API Data Transformation: Easily map and structure incoming JSON data from external APIs into a desired format for internal use.
* Data Cleaning: Use the provided transformation functions to clean and standardize data (e.g., trimming whitespace, converting case).
* Data Aggregation: Group or merge similar objects into a single structure for simplified data processing or reporting.

## Functions

#### addProp(obj, key, value)

Add a `key` property to the object `obj` with the value `value`. Returns a deep copy of the object with the new property added.

- Example: 
```javascript
import { addProp } from "mappingutils";

let obj = {
  name: "Alice",
  age: 30,
};

let updatedObj = addProp(obj, "$.address.city", "Wonderland");
console.log(updatedObj);
```

```javascript
{
  name: "Alice",
  age: 30,
  address: {
    city: "Wonderland"
  }
}
```

#### mergeObjArr(objArr, prop)

Merges the `prop` array values of the object `objArr`. Returns a deep copy of the first object in the array, with the `prop` array values concatenated.

- Example: 
```javascript
import { mergeObjArr } from "mappingutils";

let objArr = [
  { tx_number: 1111, tx_date: "2024-10-26", items: [{ item: "9991" }] },
  { tx_number: 1112, tx_date: "2024-10-26", items: [{ item: "9992" }, { item: "9993" }], },
  { tx_number: 1113, tx_date: "2024-10-26", items: [{ item: "9994" }] },
];

let mergedObj = mergeObjArr(objArr, "$.items[]");
console.log(mergedObj);
```

```javascript
{
  tx_number: 1111,
  tx_date: '2024-10-26',
  items: [
    { item: '9991' },
    { item: '9992' },
    { item: '9993' },
    { item: '9994' }
  ]
}
```

#### mapObj(source, mappings)

Transforms the `source` object based on the provided `mapping` transformation, where a mapping is an object with from, to, and an optional property fn to apply to the from value.
Each mapping object's key-value pair should use JSONPath syntax:
- The key represents the target field path in the transformed object.
- The value represents the source field path(s) in the source object.
- If a single source field is required, the value should be a JSONPath string pointing to that field.
- If multiple source fields are required, provide an array where:
- Each element before the last is a JSONPath string pointing to a source field.
- The last element is a function that takes the resolved source values as arguments and computes the target field value.

Returns an array of transformed objects, with fields derived from applying the `mapping` to the `source` object.

- Example: 
```javascript
import { mapObj } from "./src/index.js";

let source = {
    event: {
        name: "Bond Movies",
        movies: [
            {
                name: "Licence to Kill",
                star: "Timothy Dalton",
                rating: 6.6,
            },
            {
                name: "GoldenEye",
                star: "Pierce Brosnan",
                rating: 7.2,
            },
            {
                name: "Tomorrow Never Dies",
                star: "Pierce Brosnan",
                rating: 6.5,
            },
            {
                name: "Skyfall",
                star: "Daniel Craig",
                rating: 7.8,
            },
        ],
    },
};

let mapping = {
    "$.movie.title": "$.event.movies[*].name",
    "$.movie.rating": "$.event.movies[*].rating",
};

let output = mapObj(source, mapping);
console.log(output);
```

```
[
  { movie: { title: 'Licence to Kill', rating: 6.6 } },
  { movie: { title: 'GoldenEye', rating: 7.2 } },
  { movie: { title: 'Tomorrow Never Dies', rating: 6.5 } },
  { movie: { title: 'Skyfall', rating: 7.8 } }
]
```

#### mapObjArr(source, mappings)

Transforms each object in the `source` array based on the provided `mapping` transformation.
The mapping object should follow the same conventions as in the `mapObj` function.

- Example: 
```javascript
import { mapObjArr } from "mappingutils";

let source = [
  {
    id: 1,
    name: "Alice",
    score: 90,
    extra_curricular_activities: ["Trivia and Quiz"],
  },
  {
    id: 2,
    name: "Bob",
    score: 80,
    extra_curricular_activities: ["Robotics Club"],
  },
];

let mapping = {
  "$.name": "$.name",
  "$.grade": ["$.score", (score) => (score >= 85 ? "A" : "B")],
};

let outputArr = mapObjArr(source, mapping);
console.log(JSON.stringify(outputArr, null, 2));
```

```javascript
[
  {
    "fname": "Alice",
    "grade": "A"
  },
  {
    "fname": "Bob",
    "grade": "B"
  }
]
```

## Running tests
To ensure that your changes are working as expected, you can run the test suite:

`npm run test`

Make sure all tests pass before submitting a pull request.

## Issue reporting

If you encounter any issues or have suggestions for improvements, please open an issue in the GitHub repository. To help us address your concerns more effectively, please use the following template:

### Issue Template

**Title**: [Short description of the issue]

**Description**:
A clear and concise description of what the issue is.

**Steps to Reproduce**:
1. [Step one]
2. [Step two]
3. [Step three]

**Expected Behavior**:
A clear description of what you expected to happen.

**Actual Behavior**:
A clear description of what actually happened.

**Environment**:
- Node.js version: [your Node.js version]
- Operating System: [your OS]
- Package version: [version of mappingutils]

**Additional Context**:
Any other context or screenshots about the issue.

## Contributing
We welcome contributions! If you find a bug or have a feature request, feel free to create an issue in the GitHub repository.

## License
MIT
