# mappingutils

Lightweight JSON transformation utility.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Basic Usage](#basic-usage)
- [Use Cases](#use-cases)
- [Functions](#functions)
  - [addProp(obj, key, value)](#addpropobj-key-value)
  - [mergeObjArr(objArr, prop)](#mergeobjarrobjarr-prop)
  - [mapObj(source, mappings)](#mapobjsource-mappings)
  - [mapObjArr(source, mappings)](#mapobjarrsource-mappings)
- [Running Tests](#running-tests)
- [Changelog](#changelog)
- [Issue Reporting](#issue-reporting)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
- Node.js v18 or higher

## Installation
You can install mappingutils directly from npm:
- `npm install mappingutils`

Ensure that you are using Node.js version 18 or higher. You can check your Node version with the following command:
- `node -v`

## Quick start
**Node.js**

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
  ["$.code"]: "$.event.data.id",
  ["$.private.agency"]: "$.event.agency",
  ["$.private.agent"]: [
      "$.event.data.name",
      "$.event.data.lname",
      (a, b) => `${a} ${b}`.toUpperCase(),
  ],
};

let output = mapObj(source, mapping);
console.log(output);
```

It will print out
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

## Basic Usage
It uses [JSONPath](https://www.npmjs.com/package/jsonpath#jsonpath-syntax) syntax for selecting the values from the input and a similar syntax for the output.

After installing the library, you can import the functions and start using them in your JavaScript or TypeScript projects:

```javascript
import { mapObj } from "mappingutils";

// Your source object
let source = {
  store: {
    book: [
      {
        category: "fiction",
        author: "J.R.R. Tolkien",
        title: "The Hobbit",
      },
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
      },
    ],
  },
};

// Your mapping
let mapping = {
  ["$.category"]: "$.store.book[*].category",
  ["$.book.title"]: "$.store.book[*].title",
};

// Apply the transformation
let output = mapObj(source, mapping);
console.log(output);
```

Prints out
```javascript
[
  { category: 'fiction', book: { title: 'The Hobbit' } },
  { category: 'reference', book: { title: 'Sayings of the Century' } }
]
```

## Use Cases
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
Prints out

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
  { id: 1, items: ["apple", "banana"] },
  { id: 2, items: ["orange"] },
  { id: 3, items: ["grape", "pear"] },
];

let prop = "$.items[]";

let mergedObj = mergeObjArr(objArr, prop);
console.log(mergedObj);
```
Prints out

```javascript
{
  id: 1,
  items: ["apple", "banana", "orange", "grape", "pear"]
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
import { mapObj } from "mappingutils";

let source = {
    event: {
        agency: "MI6",
        data: {
            name: "James",
            lastName: "Bond",
            id: "007",
        },
        location: {
            country: "UK",
            city: "London",
        },
    },
    attendees: [
        { name: "M", role: "Director" },
        { name: "Q", role: "Tech Expert" },
    ],
};

let mapping = {
    ["$.agency"]: "$.event.agency",
    ["$.agent"]: [
        "$.event.data.name",
        "$.event.data.lastName",
        (name, lastName) => `${name} ${lastName}`,
    ],
    ["$.city"]: ["$.event.location.city", (city) => `${city}`.toUpperCase()],
    ["$.director"]: "$.attendees[?(@.role == 'Director')].name",
};

let output = mapObj(source, mapping);
console.log(output);
```
Prints out

```javascript
[
  { director: 'M', agency: 'MI6', agent: 'James Bond', city: 'LONDON' }
]
```

#### mapObjArr(source, mappings)

Transforms each object in the `source` array based on the provided `mapping` transformation.
The mapping object should follow the same conventions as in the `mapObj` function.

- Example: 
```javascript
import { mapObjArr } from "mappingutils";

let source = [
  { id: 1, name: "Alice", score: 90 },
  { id: 2, name: "Bob", score: 80 },
];

let mapping = {
  ["$.fname"]: "$.name",
  ["$.grade"]: ["$.score", (score) => (score >= 85 ? "A" : "B")],
};

let outputArr = mapObjArr(source, mapping);
console.log(JSON.stringify(outputArr, null, 2));
```
Prints out

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

## Running Tests
To ensure that your changes are working as expected, you can run the test suite:
- npm run test
Make sure all tests pass before submitting a pull request.

## Changelog

### [0.1.0] - 2024-09-30
- Initial release of mappingutils.
- Added functions: addProp, mergeObjArr, mapObj, mapObjArr.
- Included examples for each function in the README.
- License added.

### [0.2.0] - 2024-10-01
- Improved the functions in the index.
- Added configuration for Babel.
- Updated the README.

### [0.3.0] - 2024-10-02
- Fixed a bug that occurred when node groups were not consecutive.
- Added the ability to apply a function to the value.
- Updated JSDoc documentation.
- Added test cases for the apply function feature.
- Updated the README and tests.

### [0.3.1] - [0.3.5] - 2024-10-06
- Added explicit comparison to undefined.
- Fixed handling of empty arrays in the source.
- Removed unnecessary addition of $.
- Adjusted value index to be the minimum between i and v.length - 1.
- Fixed an issue where the function modified the input object.
- Adjusted value index to be the minimum between i and v.length.
- Updated the README.

### [0.3.6] - [0.3.8] - 2024-10-11
- Fixed handling of missing properties in array elements.
- Used a for...of loop for iteration.
- Reduced package size.
- Updated the README.

### [0.3.8] - [0.4.0] - 2024-10-20
- Add feature, mapping with array of `from` values.
- Update the README.

_Note: Future updates will follow semantic versioning._

## Issue Reporting

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
