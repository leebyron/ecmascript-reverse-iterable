// The following is all currently specced behavior in ES2015 (ES6).
// It is all either directly referred to in the proposal, or is contextually
// relevant to the proposal in order to produce meaningful examples.

// 7.2.2
global.IsCallable = function IsCallable(argument) {
  return typeof argument === 'function';
};

// 7.3.5
global.CreateMethodProperty = function CreateMethodProperty(O, P, V) {
  return Object.defineProperty(O, P, {
    value: V,
    writable: true,
    enumerable: false,
    configurable: true
  });
};

// 7.3.7
global.GetMethod = function GetMethod(O, P) {
  // 1. Assert: Type(O) is Object.
  if (Object(O) !== O) {
    throw new TypeError();
  }
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Let func be the result of calling the [[Get]] internal method of O passing P and O as the arguments.
  // 4. ReturnIfAbrupt(func).
  var func = O[P];
  // 5. If func is either undefined or null, then return undefined.
  if (func === undefined || func === null) {
    return undefined;
  }
  // 6. If IsCallable(func) is false, then throw a TypeError exception.
  if (IsCallable(func) === false) {
    throw new TypeError();
  }
  // 7. Return func.
  return func;
};

// 7.4.2
global.GetIterator = function GetIterator(obj, method) {
  // 1. ReturnIfAbrupt(obj).
  // 2. If method was not passed, then
  if (arguments.length < 2) {
    // a. Let method be GetMethod(obj, @@iterator).
    // b. ReturnIfAbrupt(method).
    method = GetMethod(obj, Symbol.iterator);
  }
  // 3. If IsCallable(method) is false, then throw a TypeError exception.
  if (IsCallable(method) === false) {
    throw new TypeError('method must be callable');
  }
  // 4. Let iterator be the result of calling the [[Call]] internal method of
  //    method with obj as thisArgument and an empty List as argumentsList.
  var iterator = method.call(obj);
  // 5. ReturnIfAbrupt(iterator).
  // 6. If Type(iterator) is not Object, then throw a TypeError exception.
  if (Object(iterator) !== iterator) {
    throw new TypeError('method must return an iterator');
  }
  // 7. Return iterator.
  return iterator;
};

// 7.4.8
global.CreateIterResultObject = function CreateIterResultObject(value, done) {
  // 1. Assert: Type(done) is Boolean.
  // 2. Let obj be ObjectCreate(%ObjectPrototype%).
  // 3. Perform CreateDataProperty(obj, "value", value).
  // 4. Perform CreateDataProperty(obj, "done", done).
  // 5. Return obj.
  return { value: value, done: done };
};

// 9.1.13
global.ObjectCreate = function ObjectCreate(proto, internalSlotsList) {
  var properties = {};
  if (internalSlotsList) {
    for (var ii = 0; ii < internalSlotsList.length; ii++) {
      var name = internalSlotsList[ii];
      properties[name] = { writable: true, configurable: false, enumerable: false };
    }
  }
  return Object.create(proto, properties);
};

// 19.4.1
global.Symbol = function Symbol(k) {
  return k;
};

// 19.4.2.5
Symbol.iterator = Symbol('@@iterator');

// 25.1.2
global.IteratorPrototype = {};

// 25.1.2.1.1
IteratorPrototype[Symbol.iterator] = function () {
  return this;
};

// 22.1.3.4
CreateMethodProperty(Array.prototype, 'entries', function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayIterator(O, "key+value").
  return CreateArrayIterator(O, 'key+value');
});

// 22.1.3.13
CreateMethodProperty(Array.prototype, 'keys', function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayIterator(O, "key").
  return CreateArrayIterator(O, 'key');
});

// 22.1.3.29
CreateMethodProperty(Array.prototype, 'values', function () {
  // 1. Let O be the result of calling ToObject with the this value as its argument.
  // 2. ReturnIfAbrupt(O).
  var O = Object(this);

  // 3. Return CreateArrayIterator(O, "value").
  return CreateArrayIterator(O, 'value');
});

// 22.1.5.1
global.CreateArrayIterator = function CreateArrayIterator(array, kind) {
  var iterator = ObjectCreate(
    ArrayIteratorPrototype,
    ['[[IteratedObject]]', '[[ArrayIteratorNextIndex]]', '[[ArrayIterationKind]]']
  );
  iterator['[[IteratedObject]]'] = array;
  iterator['[[ArrayIteratorNextIndex]]'] = 0;
  iterator['[[ArrayIterationKind]]'] = kind;
  return iterator;
}

// 22.1.5.2
global.ArrayIteratorPrototype = ObjectCreate(IteratorPrototype);

// 22.1.5.2.1
CreateMethodProperty(ArrayIteratorPrototype, 'next', function() {
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

  // 6. Let index be the value of the [[ArrayIteratorNextIndex]] internal slot of O.
  var index = O['[[ArrayIteratorNextIndex]]'];

  // 7. Let itemKind be the value of the [[ArrayIterationKind]] internal slot of O.
  var itemKind = O['[[ArrayIterationKind]]'];

  // 8. If *array* has a [[TypedArrayName]] internal slot, then
  //     * a. Let *len* be the value of the [[ArrayLength]] internal slot of *array*.
  // 9. Else,
  //     * a. Let *len* be ToLength(Get(*array*, **"length"**)).
  //     * b. ReturnIfAbrupt(*len*).
  var len = a.length;

  // 10. If index ≥ len, then
  if (index >= len) {
    // a. Set the value of the [[IteratedObject]] internal slot of O to undefined.
    O['[[IteratedObject]]'] = undefined;
    // b. Return CreateIterResultObject(undefined, true).
    return CreateIterResultObject(undefined, true);
  }

  // 11. Set the value of the [[ArrayIteratorNextIndex]] internal slot of O to index+1.
  O['[[ArrayIteratorNextIndex]]'] = index + 1;

  var result;

  // 12. If itemKind is "key", then return CreateIterResultObject(index, false);
  if (itemKind === 'key') {
    return CreateIterResultObject(index, false);
  }

  // 13. Let elementKey be ToString(index).
  // 14. Let elementValue be Get(a, elementKey).
  // 15. ReturnIfAbrupt(elementValue).
  var elementValue = a[index];

  // 16. If itemKind is "value", then let result be elementValue.
  if (itemKind === 'value') {
    result = elementValue;

  // 17. Else,
  } else {

    // a. Assert itemKind is "key+value",.
    // b. Let result be CreateArrayFromList(«index, elementValue»).
    result = [index, elementValue];
  }

  // 18. Return CreateIterResultObject(result, false).
  return CreateIterResultObject(result, false);
});
