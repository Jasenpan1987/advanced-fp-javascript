var _ = require("ramda");

var get = _.curry(function(x, obj) {
  return obj[x];
});

var length = _.compose(
  _.map(_.size),
  _.split(" ")
);

console.log(length("once uppon the time"));

// exercises
var articles = [
  {
    title: "Everything sucks",
    url: "everythingsucks.com",
    author: {
      name: "Foo Bar",
      email: "foo@bar.com"
    }
  },
  {
    title: "Hello world",
    url: "helloworld.com",
    author: {
      name: "Baz Baz",
      email: "baz@baz.com"
    }
  }
];

// challenge 1
// return all the author names in a list in articles
// only use get, _.compose and _.map

// var names = _.compose(_.map(_.get("name")),_.map(_.get("author"))) // bad
var names = _.compose(
  _.map(
    _.compose(
      get("name"),
      get("author")
    )
  )
); // good

console.log(names(articles));

// challenge 2
// make a boolean function that says whether a given
// person wrotes any articles, use the name function
// you created from last challenge and _.contains and
// _.compose
var isAuthor = function(name, articles) {
  return _.compose(
    _.contains(name),
    names
  )(articles);
};
console.log(isAuthor("random guy", articles));
console.log(isAuthor("Baz Baz", articles));

// challenge 3
// there is more point-free programming than compose
// let's build ourselves another function that combines
// functions to let us write code without "glue" variables
var fork = _.curry(function(lastly, f, g, x) {
  return lastly(f(x), g(x));
});

// as you can see the fork function is like a pipeline
// like compose, except it duplicated its value, sends
// it to two functions f and g, and the send the result
// to a combine function lastly

// you task is implements a function to compute the average
// value in a list using only fork, _.divide, _.sum and
// _.size

var average = _.compose(fork(_.divide, _.sum, _.size));
console.log(average([1, 2, 3, 4, 5]));
