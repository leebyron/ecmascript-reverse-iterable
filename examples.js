"use strict";

require('./polyfill-spec');

(function () {
  // Array can produce a default reverse iterator with [Symbol.reverseIterator]();
  var array = ['A','B','C'];
  var rev = array[Symbol.reverseIterator]();
  console.log(rev.next()); // "C"
  console.log(rev.next()); // "B"
  console.log(rev.next()); // "A"
  console.log(rev.next()); // undefined
  console.log(rev.next()); // undefined
})();


(function () {
  // Array iterator can produce a reverse iterator of the same kind with reverse()
  var array = ['A','B','C'];
  var revEntries = array.entries().reverse();
  console.log(revEntries.next()); // [2, "C"]
  console.log(revEntries.next()); // [1, "B"]
  console.log(revEntries.next()); // [0, "A"]
  console.log(revEntries.next()); // undefined
  console.log(revEntries.next()); // undefined
})();


(function () {
  // Illustrate example of a user-land `map` function which checks for
  // @@reverseIterable to determine if it itself should implement ReverseIterable.

  var IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));

  function mapIterator(originalIterator, mapper, context) {
    var iterator = Object.create(IteratorPrototype, {
      originalIterator: { value: originalIterator, writable: true },
      mapper: { value: mapper, writable: true },
      context: { value: context, writable: true },
      next: { value: MapIteratorNext }
    });
    var hasReverseIterable = originalIterator[Symbol.reverseIterator];
    if (hasReverseIterable) {
      iterator[Symbol.reverseIterator] = MapIteratorReversed;
    }
    return iterator;
  }

  function MapIteratorNext() {
    var originalIterator = this.originalIterator;
    if (originalIterator === undefined) {
      return { value: undefined, done: true };
    }
    var result = originalIterator.next();
    if (result.done) {
      this.originalIterator = undefined;
      return result;
    }
    return { value: this.mapper.call(this.context, result.value), done: false };
  }

  function MapIteratorReversed() {
    var originalIterator = this.originalIterator;
    var reverseIterator = originalIterator[Symbol.reverseIterator]();
    return mapIterator(reverseIterator, this.mapper, this.context);
  }


  var array = ['A','B','C'];

  // Illustrate that a reverse-iterator can be mapped, and the result of that
  // can be reversed itself. A reverse-iterator can be reversed yet again.
  // This simply sets up the iterator, no buffering occurs.
  var rev = mapIterator(array.values().reverse(), function (l) { return l + l; }).reverse().reverse();
  console.log(rev.next()); // "CC"
  console.log(rev.next()); // "BB"
  console.log(rev.next()); // "AA"
  console.log(rev.next()); // undefined
  console.log(rev.next()); // undefined
})();
