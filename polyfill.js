// The following is all currently specced behavior in ES2015 (ES6).
// It is all either directly referred to in the proposal, or is contextually
// relevant to the proposal in order to produce meaningful examples.

// 7.4.8
function CreateIterResultObject(value, done) {
  return { value: value, done: done };
}

// 19.4.1
var Symbol = function(k){return k};

// 19.4.2.5
Symbol.iterator = Symbol('@@iterator');

// 25.1.2
var IteratorPrototype = {};

// 25.1.2.1.1
IteratorPrototype[Symbol.iterator] = function () {
  return this;
};

// 22.1.3.4
Array.prototype.entries = function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayIterator(O, "key+value").
  return CreateArrayIterator(O, 'key+value');
};

// 22.1.3.13
Array.prototype.keys = function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayIterator(O, "key").
  return CreateArrayIterator(O, 'key');
};

// 22.1.3.29
Array.prototype.values = function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayIterator(O, "value").
  return CreateArrayIterator(O, 'value');
};

// 22.1.5.1
function CreateArrayIterator(array, kind) {
  var iterator = Object.create(ArrayIteratorPrototype);
  iterator['[[IteratedObject]]'] = array;
  iterator['[[ArrayIteratorNextIndex]]'] = 0;
  iterator['[[ArrayIterationKind]]'] = kind;
  return iterator;
}

// 22.1.5.2
var ArrayIteratorPrototype = Object.create(IteratorPrototype);

// 22.1.5.2.1
ArrayIteratorPrototype.next = function() {
  // 1. Let O be the this value.
  var O = this;

  // 2. If Type(O) is not Object, throw a TypeError exception.
  if (typeof O !== 'object') {
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

  // 6. Let index be the value of the [[ArrayIteratorNextIndex]] internal slot of O.
  var index = O['[[ArrayIteratorNextIndex]]'];

  // 7. Let itemKind be the value of the [[ArrayIterationKind]] internal slot of O.
  var itemKind = O['[[ArrayIterationKind]]'];

  // 8. Let lenValue be Get(a, "length").
  // 9. Let len be ToLength(lenValue).
  // 10. ReturnIfAbrupt(len).
  var len = a.length;

  // 11. If index ≥ len, then
  if (index >= len) {
    // a. Set the value of the [[IteratedObject]] internal slot of O to undefined.
    O['[[IteratedObject]]'] = undefined;
    // b. Return CreateIterResultObject(undefined, true).
    return CreateIterResultObject(undefined, true);
  }

  // 12. Set the value of the [[ArrayIteratorNextIndex]] internal slot of O to index+1.
  O['[[ArrayIteratorNextIndex]]'] = index + 1;

  var result;

  // 13. If itemKind is "key", then let result be index.
  if (itemKind === 'key') {
    result = index;
  }

  // 14. Else,
  else {

    // a. Let elementKey be ToString(index).
    // b. Let elementValue be Get(a, elementKey).
    // c. ReturnIfAbrupt(elementValue).
    var elementValue = a[index];

    // 15. If itemKind is "value", then let result be elementValue.
    if (itemKind === 'value') {
      result = elementValue;

    // 16. Else,
    } else {

      // a. Assert itemKind is "key+value",.

      // b. Let result be ArrayCreate(2).
      // c. Assert: result is a new, well-formed Array object so the following operations will never fail.
      // d. Call CreateDataProperty(result, "0", index).
      // e. Call CreateDataProperty(result, "1", elementValue).
      result = [index, elementValue];
    }
  }

  // 17. Return CreateIterResultObject(result, false).
  return CreateIterResultObject(result, false);
};



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// -- The following are proposed additions to a future ECMA spec.


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


// -- This property is new, added after 19.4.2.5


// # Symbol.reverseIterator
Symbol.reverseIterator = Symbol('@@reverseIterator');


// -- This property is new, added after 22.1.3.30


// # Array.prototype.reversed ( )
Array.prototype.reversed = function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayReverseIterator(O, "value").
  return CreateArrayReverseIterator(O, 'value');
};


// # Array.prototype [ @@reverseIterator ] ( )
Array.prototype[Symbol.reverseIterator] = Array.prototype.reversed;


// -- These two properties are added to ArrayIteratorPrototype, 22.1.5.2


// # ArrayIteratorPrototype.reversed ( )
ArrayIteratorPrototype.reversed = function () {
  // Let *O* be the **this** value.
  var O = this;

  // 2. If Type(O) is not Object, throw a TypeError exception.
  if (typeof O !== 'object') {
    throw new TypeError();
  }

  // 3. If O does not have all of the internal slots of an Array Iterator Instance (22.1.5.3), throw a
  // TypeError exception.

  // Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  var a = O['[[IteratedObject]]'];
  // Let *index* be the value of the [[ArrayIteratorNextIndex]] internal slot of *O*.
  var index = O['[[ArrayIteratorNextIndex]]'];
  // If *index* !== 0, then throw a **TypeError** exception.
  if (index !== 0) {
    throw new TypeError('Cannot reverse once iteration has begun.');
  }
  // Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  var itemKind = O['[[ArrayIterationKind]]'];
  // Return CreateArrayReverseIterator(*a*, *itemKind*).
  return CreateArrayReverseIterator(a, itemKind);
};


// # ArrayIteratorPrototype [ @@reverseIterator ] ( )
// The initial value of the @@reverseIterator property is the same function as
// the initial value of the **ArrayIteratorPrototype.reversed** property.
ArrayIteratorPrototype[Symbol.reverseIterator] = ArrayIteratorPrototype.reversed;


// -- This section is new, added after 22.1.5


// # Array Reverse Iterator Objects

// An Array Reverse Iterator is an object, that represents a specific reverse
// iteration over some specific Array instance object. There is not a named
// constructor for Array Reverse Iterator objects. Instead, Array Reverse
// Iterator objects are created by calling **reverse** on Array Iterator objects.


// # CreateArrayReverseIterator Abstract Operation
function CreateArrayReverseIterator(array, kind) {
  // Assert: Type(*array*) is Object
  // Let *iterator* be ObjectCreate(%ArrayIteratorPrototype%, ([[IteratedObject]], [[ArrayReverseIteratorNextIndex]], [[ArrayIterationKind]])).
  var iterator = Object.create(ArrayReverseIteratorPrototype);
  // Set *iterator’s* [[IteratedObject]] internal slot to *array*.
  iterator['[[IteratedObject]]'] = array;
  // Let *lenValue* be Get(*array*, "length").
  // Let *len* be ToLength(*lenValue*).
  // ReturnIfAbrupt(*len*).
  var len = array.length;
  // Set *iterator’s* [[ArrayReverseIteratorNextIndex]] internal slot to *len*-1.
  iterator['[[ArrayReverseIteratorNextIndex]]'] = len - 1;
  // Set *iterator’s* [[ArrayIteratorKind]] internal slot to *kind*.
  iterator['[[ArrayIterationKind]]'] = kind;
  // Return *iterator*.
  return iterator;
}


// # The %ArrayReverseIteratorPrototype% Object

// All Array Reverse Iterator Objects inherit properties from the
// %ArrayReverseIteratorPrototype% intrinsic object. The
// %ArrayReverseIteratorPrototype% object is an ordinary object and its
// [[Prototype]] internal slot is the %IteratorPrototype% intrinsic object
// (25.1.2). In addition, %ArrayReverseIteratorPrototype% has the following
//  properties:
var ArrayReverseIteratorPrototype = Object.create(IteratorPrototype);


// # %ArrayReverseIteratorPrototype%.next ( )
ArrayReverseIteratorPrototype.next = function () {

  // 1. Let O be the this value.
  var O = this;

  // 2. If Type(O) is not Object, throw a TypeError exception.
  if (typeof O !== 'object') {
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

  // 10. If itemKind is "key", then let result be index.
  if (itemKind === 'key') {
    result = index;
  }

  // 11. Else,
  else {

    // a. Let elementKey be ToString(index).
    // b. Let elementValue be Get(a, elementKey).
    // c. ReturnIfAbrupt(elementValue).
    var elementValue = a[index];

    // 12. If itemKind is "value", then let result be elementValue.
    if (itemKind === 'value') {
      result = elementValue;

    // 13. Else,
    } else {

      // a. Assert itemKind is "key+value",.

      // b. Let result be ArrayCreate(2).
      // c. Assert: result is a new, well-formed Array object so the following operations will never fail.
      // d. Call CreateDataProperty(result, "0", index).
      // e. Call CreateDataProperty(result, "1", elementValue).
      result = [index, elementValue];
    }
  }

  // 14. Return CreateIterResultObject(result, false).
  return CreateIterResultObject(result, false);
};


// # %ArrayReverseIteratorPrototype%.reversed ( )
ArrayReverseIteratorPrototype.reversed = function () {
  // Let *O* be the **this** value.
  var O = this;

    // 2. If Type(O) is not Object, throw a TypeError exception.
  if (typeof O !== 'object') {
    throw new TypeError();
  }

  // 3. If O does not have all of the internal slots of an Array Iterator Instance (22.1.5.3), throw a
  // TypeError exception.

  // Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  var a = O['[[IteratedObject]]'];

  // Let *index* be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O*.
  var index = O['[[ArrayReverseIteratorNextIndex]]'];

  // Let *lenValue* be Get(a, "length").
  // Let *len* be ToLength(*lenValue*).
  // ReturnIfAbrupt(*len*).
  var len = a.length;

  // If *index* !== *len*-1, then throw a **TypeError** exception.
  if (index !== len - 1) {
    throw new TypeError('Cannot reverse once iteration has begun.');
  }

  // Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  var itemKind = O['[[ArrayIterationKind]]'];

  // Return CreateArrayIterator(*a*, *itemKind*).
  return CreateArrayIterator(a, itemKind);
};


// # ArrayReverseIteratorPrototype [ @@reverseIterator ] ( )
// The initial value of the @@reverseIterator property is the same function as
// the initial value of the **ArrayReverseIteratorPrototype.reversed** property.
ArrayReverseIteratorPrototype[Symbol.reverseIterator] =
  ArrayReverseIteratorPrototype.reversed;


// # CheckReverseIterable ( obj )
function CheckReverseIterable(obj) {
  // 1. If Type(*obj*) is not Object, then return **undefined**.
  if (typeof obj !== 'object') {
    return undefined;
  }
  // 2. Return Get(*obj*, @@reverseIterator).
  return obj[Symbol.reverseIterator];
}






////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////





var array = ['A','B','C'];

var rev = array.reversed();
console.log(rev.next());
console.log(rev.next());
console.log(rev.next());
console.log(rev.next());
console.log(rev.next());

var revEntries = array.entries().reversed();
console.log(revEntries.next());
console.log(revEntries.next());
console.log(revEntries.next());
console.log(revEntries.next());
console.log(revEntries.next());



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Illustrate example of future possible proposal which makes use of CheckReverseIterable

IteratorPrototype.map = function(mapper, context) {
  var O = Object(this);
  return CreateMappedIterator(O, mapper, context);
};

function CreateMappedIterator(originalIterator, mapper, context) {
  var iterator = Object.create(ArrayReverseIteratorPrototype);
  iterator['[[OriginalIterator]]'] = originalIterator;
  iterator['[[MappingFunction]]'] = mapper;
  iterator['[[MappingContext]]'] = context;
  iterator.next = MappedIteratorNext;
  var reverseIterable = CheckReverseIterable(originalIterator);
  if (reverseIterable !== undefined) {
    iterator.reversed = MappedIteratorReversed;
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
  var reverseIterator = iterator[Symbol.reverseIterator](); // GetIterator(iterator, iterator[Symbol.reverseIterator]);
  var mapper = O['[[MappingFunction]]'];
  var context = O['[[MappingContext]]'];
  return CreateMappedIterator(reverseIterator, mapper, context);
}


var array = ['A','B','C'];

var rev = array.reversed().map(function (l) { return l + l; }).reversed().reversed();
console.log(rev);
console.log(rev.next());
console.log(rev.next());
console.log(rev.next());
console.log(rev.next());
console.log(rev.next());
console.log(rev);
