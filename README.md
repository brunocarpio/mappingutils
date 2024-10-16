# mappingutils
Transform input objects with ease.
![screencast](https://github.com/brunocarpio/mappingUtils/blob/addGif/loop.gif)

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
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

## Prerequisites
- Node.js v18 or higher: Ensure that your environment has Node.js installed. You can download it from [Node.js official website](https://nodejs.org/).
- npm (Node Package Manager): npm comes bundled with Node.js, so make sure it's available.

## Installation
You can install mappingutils directly from npm:
- `npm install mappingutils`

Ensure that you are using Node.js version 18 or higher. You can check your Node version with the following command:
- `node -v`

## Usage Guide
### Using as a Library 
1) Ensure you are using Node version 18 or higher. You can check your Node version with the following command:
    - `node -v`

2) Install the library using npm:
    - `npm install mappingutils`

3) Create a new file (e.g., test.js) in your project directory and add your mapping code. For example:
```javascript
import { mapObj } from "mappingutils";

const source = {
  event: {
    agency: "MI6",
    data: {
      name: "James Bond",
      id: "007",
    },
  },
};

const transformation = [
  {
    from: "$.event.data.name",
    to: "$.agent",
    fn: (name) => name.toUpperCase(),
  },
  {
    from: "$.event.data.id",
    to: "$.code",
  },
];

const output = mapObj(source, transformation);
console.log(output);
```
4) Run your file using Node.js:
    * `node test.js`
    
It will print out
```javascript
[
  {
    agent: "JAMES BOND",
    code: "007",
  }
]
```
Ensure that the terminal is pointed to the directory containing the test.js file, or specify the path directly.

### Downloading and Contributing to the Repository
1) Ensure you are using Node version 18 or higher. You can check your Node version with the following command:
    - `node -v`

2) Navigate to the directory where you want to clone the repository. Open a terminal (or Git Bash) and run the following command to clone the repository:
    - `git clone [repository_url](https://github.com/brunocarpio/mappingUtils.git)`

Alternatively, you can download the repository as a .zip file and extract it to the desired location.

3) Open the repository in your preferred text editor, such as VSCode.

4) Install the necessary dependencies by running:
    - `npm install`

This will install all the required packages defined in package.json.

5) Create a new file (e.g., test.js) inside the project or use the existing one. Add your mapping code as shown in the examples below.

6) To run your test.js file, use the following command in the terminal:
    - `node test.js`
    
Ensure that the terminal is pointed to the directory containing the test.js file, or specify the path directly.

## Basic Usage
It uses [JSONPath](https://www.npmjs.com/package/jsonpath#jsonpath-syntax) syntax for selecting the values from the input and a similar syntax for the output.

After installing the library, you can import the functions and start using them in your JavaScript or TypeScript projects:

```javascript
import { mapObj } from "mappingutils";

// Your source object
const source = {
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
const transformation = [
  {
    from: "$.store.book[*].category",
    to: "$.category",
  },
  {
    from: "$.store.book[*].title",
    to: "$.book.title",
  },
];

// Apply the transformation
const output = mapObj(source, transformation);
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

Merge the `prop` array values of the object `objArr`. Returns a deep copy of the first object in the array, with the `prop` array values concatenated.

- Example: 
```javascript
import { mergeObjArr } from "mappingutils";

let objArr = [
  { id: 1, items: ["apple", "banana"] },
  { id: 2, items: ["orange"] },
  { id: 3, items: ["grape", "pear"] },
];

let prop = "$.items[*]";

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

Transforms an input object `source` given the provided array of mappings `mappings` where a mapping is an object with from, to, and an optional property fn to apply to the from value.
Returns an array of objects resulting from transforming the input object.

- Example: 
```javascript
import { mapObj } from "mappingutils";

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
    to: "$.ageCategory",
    fn: (age) => (age >= 18 ? "Adult" : "Minor"),
  },
  {
    from: "$.person.items[*].item",
    to: "$.items[*].code",
  },
];

let source = {
  person: {
    firstName: "John",
    lastName: "Doe",
    age: 25,
    items: [{ item: 11111 }, { item: 22222 }, { item: 33333 }],
  },
};

let output = mapObj(source, transformation);
console.log(JSON.stringify(output, null, 2));
```
Prints out

```javascript
[
  {
    "items": [
      {
        "code": 11111
      }
    ],
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "ageCategory": "Adult"
  },
  {
    "items": [
      {
        "code": 22222
      }
    ],
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "ageCategory": "Adult"
  },
  {
    "items": [
      {
        "code": 33333
      }
    ],
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "ageCategory": "Adult"
  }
```

#### mapObjArr(source, mappings)

Transforms an input array of objects `source` using the provided array of mappings `mappings`. Returns an array of objects resulting from transforming the input objects.

Each mapping can include an optional parameter `fn`, which allows for additional processing on the value being transformed. The `fn` parameter accepts a function that takes the source value and returns the modified result. This can be a simple transformation function, like converting a score to a grade, or it can even call another function from the same library for more complex transformations.

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
```
Prints out

```javascript
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
