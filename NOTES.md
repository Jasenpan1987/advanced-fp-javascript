# 1. The Silence

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

## 1.4 melt function with compose

functions can be "melt" togather aka compose

example of "glue" names:

```js
on_error(function(error) {
  log(error.message);
});
```

To compose the logging and message extraction, we created a function and a "glue" name called error.

an simplified version of compose

```js
function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}

var transformStr = compose(
  reverse,
  toLowercase
);
trasformStr("HellO"); // olleh
```

The sequence of the function arguments is from right to left. The left to right one is called pipe.

## 1.5 point-free

Point-free means arguments free, it's like when you creates a function, you don't have to explicitly say `function(x, y, z)`, the function will figure it out.

This is NOT a point-free function

```js
on_error(function(error) {
  log(error.message);
});
```

and this is the point-free version of the same function

```js
on_error(
  compose(
    log,
    get("message")
  )
);
```

Here, you don't have to explicityly say the callback function takes an argument called error.

# 2. The Voyage

## 2.1 Category theory

When you have `add(1, 1)` you get a 2, and the function `add` has the following properties:

```js
// associative
add(1, add(2, 3)) === add(add(1, 2), 3);

// commutative
add(4, 1) === add(1, 4);

// identity
add(n, 0) === n;

// distributive
multiply(2, add(3, 4)) === add(multiply(2, 3), multiply(3, 4));
```

And also you can make `add` more polymophic to cove the following:

```js
add("foo", "bar"); // "foobar"

add(2.3, 1.1); // 3.4

add([1, 2, 3], [4, 5]); // [1,2,3,4,5]
```

When we see the above functions, we always assume that the "super add" function covers the above laws.
