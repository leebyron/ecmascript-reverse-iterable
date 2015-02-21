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
  // Illustrate example of future possible proposal which makes use
  // of GetMethod(O, @@reverseIterable) to determine if it itself should
  // implement ReverseIterable.

  var IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.reverseIterator]()));
  IteratorPrototype.map = function(mapper, context) {
    var O = Object(this);
    return CreateMappedIterator(O, mapper, context);
  };

  function CreateMappedIterator(originalIterator, mapper, context) {
    var iterator = ObjectCreate(
      IteratorPrototype,
      ['[[OriginalIterator]]', '[[MappingFunction]]', '[[MappingContext]]']
    );
    iterator['[[OriginalIterator]]'] = originalIterator;
    iterator['[[MappingFunction]]'] = mapper;
    iterator['[[MappingContext]]'] = context;
    iterator.next = MappedIteratorNext;
    var reverseIterable = originalIterator[Symbol.reverseIterator];
    if (reverseIterable !== undefined) {
      iterator[Symbol.reverseIterator] = MappedIteratorReversed;
    }
    return iterator;
  }

  function MappedIteratorNext() {
    var O = Object(this);
    var iterator = O['[[OriginalIterator]]'];
    if (iterator === undefined) {
      return CreateIterResultObject(undefined, true);
    }
    var nextFn = iterator.next;
    var result = nextFn.apply(iterator, arguments);
    if (result.done) {
      O['[[OriginalIterator]]'] = undefined;
      O['[[MappingFunction]]'] = undefined;
      O['[[MappingContext]]'] = undefined;
      return result;
    }
    var mapper = O['[[MappingFunction]]'];
    var context = O['[[MappingContext]]'];
    var originalValue = result.value;
    var value = mapper.call(context, originalValue);
    return CreateIterResultObject(value, false);
  }

  function MappedIteratorReversed() {
    var O = Object(this);
    var iterator = O['[[OriginalIterator]]'];
    var reverseIteratorMethod = iterator[Symbol.reverseIterator];
    var reverseIterator = GetIterator(iterator, reverseIteratorMethod);
    var mapper = O['[[MappingFunction]]'];
    var context = O['[[MappingContext]]'];
    return CreateMappedIterator(reverseIterator, mapper, context);
  }


  var array = ['A','B','C'];

  // Illustrate that a reverse-iterator can be mapped, and the result of that
  // can be reversed itself. A reverse-iterator can be reversed yet again.
  // This simply sets up the iterator, no buffering occurs.
  var rev = array.values().reverse().map(function (l) { return l + l; }).reverse().reverse();
  console.log(rev.next()); // "CC"
  console.log(rev.next()); // "BB"
  console.log(rev.next()); // "AA"
  console.log(rev.next()); // undefined
  console.log(rev.next()); // undefined
})();
