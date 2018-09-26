# 1. The issues

- Custom names
- Looping patterns
- Glue code
- Side effect

## 1.1 Omit Needless names

- with separations
- with recognitions

### 1.1.1 Separate the input from enviornment

```js
// code 1
function daysThisMonth() {
  var date = new Date(),
    y = date.getFullYear(),
    m = date.getMonth(),
    start = new Date(y, m, 1),
    end = new Date(y, m + 1, 1);

  return (end - start) / (1000 * 60 * 60 * 24);
}

// code 2
function getDaysInMonth(y, m) {
  var start = new Date(y, m, 1),
    end = new Date(y, m + 1, 1);
  return (end - start) / (1000 * 60 * 60 * 24);
}
```

Which one is better? The second one, why?
because the first one has a hidden input `new Date()`, it makes the function less predictable and testable. If you want to test some functions with secret input, you have to mock them up.

When we create functions, we need to separate the input, and use functions that if you give certain input, it will always give the same output, so in here, we separate the input from the enviornment.
(http://jsbin.com/cifiposuso/1/edit?js,console)

### 1.1.2 Separate the mutation from calculation

```js
// code 1
function teaser(size, elt) {
  setText(elt, slice(0, size, text(elt)));
}

map(teaser(50), all("p"));

// code 2
var teaser = slice(0);
map(
  compose(
    setText,
    teaser,
    text
  ),
  all("p")
);
```

Which one is better? The second one, why?
The first code mutates the DOM (creates an side effect) in the function, and later when we test it, it is very hard to do so, we need to create a fake DOM...

The second code, the mutation only happens outside the function.

## 1.2 Pure function

Pure functions are more

- testable
- memoizable
- portable
- parallelizable

Because if you give the same input, the pure function will always give you the same output without side effects.

## 1.3 Separate arity from functions

```js
function get(property, object) {
  return object[property];
}

var people = [
  { name: "foo", age: 13 },
  { name: "bar", age: 15 },
  { name: "baz", age: 20 }
];

// args up front
function getPersonName(person) {
  return get("name", person);
}

var names = people.map(getPersonName);

// more args later
// some magic function
var names = people.map(get("name"));
```

The magic function is currying, this is one implementation of currying

```js
function curry(fn) {
  return function() {
    if (fn.length > arguments.length) {
      var slice = Array.prototype.slice;
      var args = slice.apply(arguments);

      return function() {
        return fn.apply(null, args.concat(slice.apply(arguments)));
      };
    }

    return fn.apply(null, arguments);
  };
}
```

```js
// use
var curryedGet = curry(get);

var names = people.map(curryedGet("name"));
```

Exercise: (http://jsbin.com/diwomicuha/edit?js,console)

creating map with reduce

```js
function map(fn, list) {
  return list.reduce((prev, next) => {
    return [...prev, fn(next)];
  }, []);
}
```
