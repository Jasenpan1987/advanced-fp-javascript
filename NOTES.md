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

### 2.1.1 Category theory

```
compose:: (b -> c) -> (a -> b) -> (a -> c)
identity:: a -> a
```

### 2.1.2 Category laws

```js
// left identity
compose(
  identity,
  f
) === f;

// right identity
compose(
  f,
  identity
) === f;

// associativity
compose(
  compose(
    f,
    g
  ),
  h
) ===
  compose(
    f,
    compose(
      g,
      h
    )
  );
```

## 2.2 Objects

1. Container/Wrappers for values
2. No methods
3. No nouns
4. Probably won't be making your own often

```js
function _Container(val) {
  this.val = val;
}

function Container(x) {
  return new _Container(x);
}

var container = Container(3); // { val: 3 }
```

But, we are having a problem:

```js
capitalize("foo"); // "Foo"

capitalize(Container("foo")); // [object Object]
```

`capitalize` works on strings, not objects, so we need some strategy to make it work.

### 2.2.1 Map over objects

```js
function _Container(val) {
  this.val = val;
}

_Container.prototype.map = function(func) {
  return Container(func(this.val));
};

function Container(x) {
  return new _Container(x);
}

var container = Container(3); // { val: 3 }
```

so now if we `capitalize` the wrapper, we can map over it like this

```js
container.map(function(s) {
  return capitalize(s);
}); // Container("Foo")

// or

container.map(capitalize); // point free
```

The idea is, don't think is as an object, think it like a wrapper or container.

Map is not always like map in arrays, iterate every value inside the array and apply the map function on it, it just the implementation of map on array. Every container can its own map implementation. But the basic idea is, when you map a function, its like go inside the container, and apply the map function on its value or values.

The value of the container should be everything, not just string or number, and also, map is chainable.

```js
Container([1, 2, 3])
  .map(reverse)
  .map(first); // 3

Container("foo")
  .map(length)
  .map(add(1)); // 4
```

This kind of Container which has a map function on it is also called **functor**

And we can also have a curryed map function on its own:

```js
var map = _.curry(function(f, container) {
  return container.map(f);
});

Container(3).map(add(1)); // 4

var mapAdd1 = map(add(1));
mapAdd1(Container(3)); // 4
```

By using this more generic map, we don't have to get the actual container, we can just create a mapper without the container.

## 2.3 Maybe functor

```js
var getElem = document.querySelector;
var getNameParts = compose(
  split(" "),
  get("value"),
  getElem
);

var getFullName = getNameParts("#full_name"); // ["John", "Doe"]
```

But what if it doesn't find the `full_name`? The `getElem` will return `null`, `get("value")` on `null` will throw exceptions, and the entire stuff blows out.

Here is an implementation of the Maybe container

```js
function _Maybe(val) {
  this.val = val;
}

_Maybe.prototype.map = function(func) {
  return this.val ? Maybe(func(this.val)) : Maybe(null);
};

var Maybe = function(val) {
  return new _Maybe(val);
};
```

To use the maybe functor, we just do the exactly the same way as we use teh Container

```js
var firstMatch = compose(
  first,
  match(/cat/g)
);

firstMatch("dogsup"); // this will throw an error says it can't do first on null

var maybeFirstMatch = compose(
  map(first),
  Maybe,
  match(/cat/g)
);

maybeFirstMatch("dogsup"); // Maybe(null)
```

What happened on the `maybeFirstMatch` side is: it trys to find `cat` in string "dogsup", and it failed and returns `null`, then the `null` value will passed into the `Maybe` functor, then the `Maybe` functor is passed to `map(first)` so it calls the `map` on `Maybe`, and returns back a `Maybe(null)`.

In short, if there is a pipeline come from `compose`, and if there might be some function which could produce `null`, put the `Maybe` in front of it, and the `map` can processes natrually.

## 2.4 Either

- It's the functor typically for pure error handling
- Work like Maybe, but with error message embedded
- Has two sub class Left / Right
- Maps the function over Right, ignore the Left

```js
map(x => x + 1, Right(2)); // Right(3)

map(x => x + 1, Left("some errors")); // Left(some errors)
```

Here is another example

```js
var determineAge = function(user) {
  return user.age ? Right(user.age) : Left("cannot get age");
};

var yearOlder = compose(
  map(add(1)),
  determineAge
);

yearOlder({ age: 22 }); // Right(23)

yearOlder({ name: "Foo" }); // Left("cannot get age")
```

So here, `Right` works like normal containers, it has map on it which grabs the value and do some operations and put the result inside the wrapper again. And `Left` work like `Maybe` with a `null` inside, when the map gets called, it doesn't do anything.

## 2.5 IO
