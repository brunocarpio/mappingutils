# mappingutils
Transform input objects with ease.

## Table of Contents
- [mappingutils](#mappingutils)
- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Usage Guide](#usage-guide)
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

## Installation
You can install mappingutils directly from npm:
- npm install mappingutils
Ensure that you are using Node.js version 18 or higher. You can check your Node version with the following command:
- node -v

## Prerequisites
- Node.js v18 or higher: Ensure that your environment has Node.js installed. You can download it from [Node.js official website](https://nodejs.org/).
- npm (Node Package Manager): npm comes bundled with Node.js, so make sure it's available.

## Usage Guide
1) Ensure you are using Node version 18 or higher.

2) Navigate to the directory where you want to clone the repository. Open a terminal (or Git Bash) and run the following command to clone the repository:
- git clone [repository_url](https://github.com/brunocarpio/mappingUtils.git)
Alternatively, you can download the repository as a .zip file and extract it to the desired location.

3) Open the repository in your preferred text editor, such as VSCode.

4) Install the necessary dependencies by running:
- npm install
This will install all the required packages defined in package.json.

5) Create a new file (e.g., test.js) inside the project or use the existing one. Add your mapping code as shown in the examples below.

6) To run your test.js file, use the following command in the terminal:
- node test.js
Ensure that the terminal is pointed to the directory containing the test.js file, or specify the path directly.

## Basic Usage
It uses [JSONPath](https://www.npmjs.com/package/jsonpath#jsonpath-syntax) syntax for selecting the values from the input and a similar syntax for the output.

After installing the library, you can import the functions and start using them in your JavaScript or TypeScript projects:

```javascript
    const { mapObj, mergeObjArr } = require('mappingutils');

    // Your source object
    const source = {
        store: {
            book: [
                {
                    category: "fiction",
                    title: "The Hobbit",
                }
            ]
        }
    };

    // Your mapping
    const transformation = [
        {
            from: "$.store.book[*].category",
            to: "$.category",
        },
        {
            from: "$.store.book[*].title",
            to: "$.book.title",
        }
    ];

    // Apply the transformation
    const output = mapObj(source, transformation);
    console.log(output);
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

let key = "address.city";
let value = "Wonderland";

let updatedObj = addProp(obj, key, value);
console.log(JSON.stringify(updatedObj, null, 2));

response:
{
  "name": "Alice",
  "age": 30,
  "address": {
    "city": "Wonderland"
  }
}
```

#### mergeObjArr(objArr, prop)

Merge the `prop` array values of the object `objArr`. Returns a deep copy of the first object in the array, with the `prop` array values concatenated.

- Example: 
```javascript
import { mergeObjArr } from "mappingutils";

let objArr = [
    { id: 1, items: ["apple", "banana"] },
    { id: 2, items: ["orange"] },
    { id: 3, items: ["grape", "pear"] },
];

let prop = "items";

let mergedObj = mergeObjArr(objArr, prop);
console.log(JSON.stringify(mergedObj, null, 2));

response:
{
  "id": 1,
  "items": ["apple", "banana", "orange", "grape", "pear"]
}
```

#### mapObj(source, mappings)

Transforms an input object `source` given the provided array of mappings `mappings`. Returns an array of objects resulting from transforming the input object.

- Example: 
```javascript
import { mapObj } from "mappingutils";

let source = {
    person: {
        firstName: "John",
        lastName: "Doe",
        age: 25,
    },
};

let transformation = [
    {
        from: "$.person.firstName",
        to: "$.name.first",
    },
    {
        from: "$.person.lastName",
        to: "$.name.last",
    },
    {
        from: "$.person.age",
        to: "$.age",
    },
];

let outputArr = mapObj(source, transformation);
console.log(JSON.stringify(outputArr, null, 2));

response:
{
  "name": {
    "first": "John",
    "last": "Doe"
  },
  "age": 25
}
```

#### mapObjArr(source, mappings)

Transforms an input array of objects `source` given the provided array of mappings `mappings`. Returns an array of objects resulting from transforming the input objects.

- Example: 
```javascript
import { mapObjArr } from "mappingutils";

let source = [
    { id: 1, name: "Alice", score: 90 },
    { id: 2, name: "Bob", score: 80 },
];

let transformation = [
    {
        from: "$.name",
        to: "$.fullName",
    },
    {
        from: "$.score",
        to: "$.grade",
        fn: (score) => (score >= 85 ? "A" : "B"),
    },
];

let outputArr = mapObjArr(source, transformation);
console.log(JSON.stringify(outputArr, null, 2));

response:
[
  {
    "fullName": "Alice",
    "grade": "A"
  },
  {
    "fullName": "Bob",
    "grade": "B"
  }
]
```

## Running Tests
To ensure that your changes are working as expected, you can run the test suite:
- npm test
Make sure all tests pass before submitting a pull request.

## Changelog

### [1.0.0] - 2024-10-01
- Initial release of mappingutils. Example not real
- Added functions: `addProp`, `mergeObjArr`, `mapObj`, `mapObjArr`. Example not real
- Included examples for each function in the README. Example not real

### [1.0.1] - 2024-10-05
- Fixed bugs in `mapObj` handling edge cases. Example not real
- Updated documentation for better clarity. Example not real

### [1.1.0] - 2024-10-08
- continue here....

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