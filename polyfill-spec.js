"use strict";

require('./es6');

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
//     -- The following are proposed additions to a future ECMA spec. --    //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////


// -- This interface definition is new, added within 25.1


// # The *ReverseIterable* Interface
//
// The *ReverseIterable* interface includes the following property:
//
// | Property | Value | Requirements |
// | `@@reverseIterator` | A zero arguments function that returns an object. | The function returns an object that conforms to the *Iterator* interface. It must iterate through values in the reverse order of `@@iterator` |
//
// NOTE  An object should implement the *ReverseIterable* interface only when it
// also implements the *Iterable* interface.


// -- This property is new, added after 25.1.2.1.1
CreateMethodProperty(IteratorPrototype, 'reverse', function() {
  // 1. Let *O* be the result of calling ToObject with the **this** value as its argument.
  // 2. ReturnIfAbrupt(*O*).
  var O = Object(this);

  // 3. Let *usingReverseIterator* be GetMethod(*O*, @@reverseIterator).
  var usingReverseIterator = GetMethod(O, Symbol.reverseIterator);

  // 4. If *usingReverseIterator* is **undefined**, throw a **TypeError** exception.
  if (usingReverseIterator === undefined) {
    throw new TypeError('Iterator is not reversable.');
  }

  // 5. Let *iterator* be GetIterator(*O*, *usingReverseIterator*).
  var iterator = GetIterator(O, usingReverseIterator);

  // 6. return *iterator*.
  return iterator;
});


// -- This property is new, added after 19.4.2.5
// # Symbol.reverseIterator
Symbol.reverseIterator = Symbol('@@reverseIterator');


// -- This property is new, added after 22.1.3.30
// # Array.prototype [ @@reverseIterator ] ( )
CreateMethodProperty(Array.prototype, Symbol.reverseIterator, function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayReverseIterator(O, "value").
  return CreateArrayReverseIterator(O, 'value');
});


// -- These two properties are added to ArrayIteratorPrototype, 22.1.5.2
// # ArrayIteratorPrototype [ @@reverseIterator ] ( )
CreateMethodProperty(ArrayIteratorPrototype, Symbol.reverseIterator, function () {
  // 1. Let *O* be the **this** value.
  var O = this;

  // 2. If Type(*O*) is not Object, throw a **TypeError** exception.
  if (Object(O) !== O) {
    throw new TypeError('must be called on object');
  }

  // 3. If *O* does not have all of the internal slots of an Array Iterator Instance, throw a **TypeError** exception.

  // 4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  var a = O['[[IteratedObject]]'];

  // 5. Let *index* be the value of the [[ArrayIteratorNextIndex]] internal slot of *O*.
  var index = O['[[ArrayIteratorNextIndex]]'];

  // 6. If *index* !== 0, then throw a **TypeError** exception.
  if (index !== 0) {
    throw new TypeError('Cannot reverse once iteration has begun.');
  }

  // 7. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  var itemKind = O['[[ArrayIterationKind]]'];

  // 8. Return CreateArrayReverseIterator(*a*, *itemKind*).
  return CreateArrayReverseIterator(a, itemKind);
});



// -- This section is new, added after 22.1.5

// # Array Reverse Iterator Objects

// An Array Reverse Iterator is an object, that represents a specific reverse
// iteration over some specific Array instance object. There is not a named
// constructor for Array Reverse Iterator objects. Instead, Array Reverse
// Iterator objects are created by calling **reverse** on Array Iterator objects.


// # CreateArrayReverseIterator Abstract Operation
global.CreateArrayReverseIterator = function CreateArrayReverseIterator(array, kind) {
  // 1. Assert: Type(*array*) is Object
  if (Object(array) !== array) {
    throw new TypeError('array must be Object');
  }

  // 2. Let *iterator* be ObjectCreate(%ArrayIteratorPrototype%, ([[IteratedObject]], [[ArrayReverseIteratorNextIndex]], [[ArrayIterationKind]])).
  var iterator = ObjectCreate(
    ArrayReverseIteratorPrototype,
    ['[[IteratedObject]]', '[[ArrayReverseIteratorNextIndex]]', '[[ArrayIterationKind]]']
  );

  // 3. Set *iterator’s* [[IteratedObject]] internal slot to *array*.
  iterator['[[IteratedObject]]'] = array;

  // 4. If *array* has a [[TypedArrayName]] internal slot, then
  //     * a. Let *len* be the value of the [[ArrayLength]] internal slot of *array*.
  // 5. Else,
  //     * a. Let *len* be ToLength(Get(*array*, **"length"**)).
  //     * b. ReturnIfAbrupt(*len*).
  var len = array.length;

  // 6. Set *iterator’s* [[ArrayReverseIteratorNextIndex]] internal slot to *len*-1.
  iterator['[[ArrayReverseIteratorNextIndex]]'] = len - 1;

  // 7. Set *iterator’s* [[ArrayIteratorKind]] internal slot to *kind*.
  iterator['[[ArrayIterationKind]]'] = kind;

  // 8. Return *iterator*.
  return iterator;
}


// # The %ArrayReverseIteratorPrototype% Object

// All Array Reverse Iterator Objects inherit properties from the
// %ArrayReverseIteratorPrototype% intrinsic object. The
// %ArrayReverseIteratorPrototype% object is an ordinary object and its
// [[Prototype]] internal slot is the %IteratorPrototype% intrinsic object
// (25.1.2). In addition, %ArrayReverseIteratorPrototype% has the following
//  properties:
global.ArrayReverseIteratorPrototype = ObjectCreate(IteratorPrototype);


// # %ArrayReverseIteratorPrototype%.next ( )
CreateMethodProperty(ArrayReverseIteratorPrototype, 'next', function () {

  // 1. Let O be the this value.
  var O = this;

  // 2. If Type(O) is not Object, throw a TypeError exception.
  if (Object(O) !== O) {
    throw new TypeError();
  }

  // 3. If O does not have all of the internal slots of an Array Iterator Instance (22.1.5.3), throw a
  // TypeError exception.

  // 4. Let a be the value of the [[IteratedObject]] internal slot of O.
  var a = O['[[IteratedObject]]'];

  // 5. If a is undefined, then return CreateIterResultObject(undefined, true).
  if (a === undefined) {
    return CreateIterResultObject(undefined, true);
  }

  // 6. Let index be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of O.
  var index = O['[[ArrayReverseIteratorNextIndex]]'];

  // 7. Let itemKind be the value of the [[ArrayIterationKind]] internal slot of O.
  var itemKind = O['[[ArrayIterationKind]]'];

  // 8. If index < 0, then
  if (index < 0) {
    // a. Set the value of the [[IteratedObject]] internal slot of O to undefined.
    O['[[IteratedObject]]'] = undefined;
    // b. Return CreateIterResultObject(undefined, true).
    return CreateIterResultObject(undefined, true);
  }

  // 9. Set the value of the [[ArrayReverseIteratorNextIndex]] internal slot of O to index-1.
  O['[[ArrayReverseIteratorNextIndex]]'] = index - 1;

  var result;

  // 10. If itemKind is "key", return CreateIterResultObject(*index*, **false**).
  if (itemKind === 'key') {
    return CreateIterResultObject(index, false);
  }

  // 11. Let elementKey be ToString(index).
  // 12. Let elementValue be Get(a, elementKey).
  // 13. ReturnIfAbrupt(elementValue).
  var elementValue = a[index];

  // 14. If itemKind is "value", then let result be elementValue.
  if (itemKind === 'value') {
    result = elementValue;

  // 15. Else,
  } else {

    // a. Assert *itemKind* is **"key+value"**,.
    // b. Let *result* be CreateArrayFromList(*«index, elementValue»*).
    result = [index, elementValue];
  }

  // 16. Return CreateIterResultObject(result, false).
  return CreateIterResultObject(result, false);
});


// # ArrayReverseIteratorPrototype [ @@reverseIterator ] ( )
CreateMethodProperty(ArrayReverseIteratorPrototype, Symbol.reverseIterator, function () {
  // 1. Let *O* be the **this** value.
  var O = this;

  // 2. If Type(O) is not Object, throw a TypeError exception.
  if (Object(O) !== O) {
    throw new TypeError();
  }

  // 3. If O does not have all of the internal slots of an Array Iterator Instance (22.1.5.3), throw a
  // TypeError exception.

  // 4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  var a = O['[[IteratedObject]]'];

  // 5. Let *index* be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O*.
  var index = O['[[ArrayReverseIteratorNextIndex]]'];

  // 6. If *a* has a [[TypedArrayName]] internal slot, then
  //     * a. Let *len* be the value of the [[ArrayLength]] internal slot of *a*.
  // 7. Else,
  //     * a. Let *len* be ToLength(Get(*a*, **"length"**)).
  //     * b. ReturnIfAbrupt(*len*).
  var len = a.length;

  // 8. If *index* !== *len*-1, then throw a **TypeError** exception.
  if (index !== len - 1) {
    throw new TypeError('Cannot reverse once iteration has begun.');
  }

  // 9. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  var itemKind = O['[[ArrayIterationKind]]'];

  // 10. Return CreateArrayIterator(*a*, *itemKind*).
  return CreateArrayIterator(a, itemKind);
});



// TODO: changes in 7.4
