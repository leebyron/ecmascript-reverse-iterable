# The *ReverseIterable* Interface

**Stage:** 0, Strawman

**Author:** Lee Byron

Iterating through collections in reverse is a pretty common operation in
application logic. In imperative code, we see these two patterns all the time:

```js
// Forward iteration
for (var i = 0; i < a.length; i++) {
  var v = a[i];
  doSomething(v, i);
}

// Reverse iteration
for (var i = a.length - 1; i >= 0; i--) {
  var v = a[i];
  doSomething(v, i);
}
```

Iterators in ES2015 are a valuable higher order abstraction which helps capture
forward iteration. The `for of` loop can simplify the imperative forward
iteration to become:

```js
for (let [i, v] of a.entries()) {
  doSomething(v, i);
}
```

We're missing an equivalent abstraction to capture the reverse iteration. In
this proposal, it's suggested that this can be written as:

```js
for (let [i, v] of a.entries().reverse()) {
  doSomething(v, i);
}
```

A default reverse iterator can also be retrieved similarly to a default iterator:

```js
for (let v of a[Symbol.reverseIterator]()) {
  doSomething(v);
}
```


This syntax has the benefit of not introducing new syntactical concepts but
instead just adds a few function properties to iterator prototypes.

In addition to the `reverse()` method, this proposal also suggests the
addition of a *ReverseIterable* interface which any object can implement by
adding a function to the `Symbol.reverseIterator` property. Capturing this in an
interface allows arbitrary code to detect that a particular object is reverse
iterable and use that to it's advantage.


## FAQ

##### What happens if `reverse()` is called on something not easily reversed, like a Generator function?

This proposal suggests one-way iterables remain one-way. Objects which implement
*Iterable* do not also have to implement *ReverseIterable*. There is no buffering
in the native implementation of `%IteratorPrototype%.reverse()` when called on an
object which is not *ReverseIterable*, instead a TypeError exception is thrown.

Buffering can result in difficult to understand performance and memory pressure
in some cases and infinite buffers in the worst case.

Specifically, Generator objects *do not* implement the *ReverseIterable* interface.

For example, this code will throw a TypeError exception with a useful message:

```js
function* fib () {
  var n1 = 0, n2 = 1;
  yield n1;
  [n1, n2] = [n2, n1 + n2];
}

try {
  let fibs = fib();
  for (let num of fibs.reverse()) {
    console.log(num);
  }
} catch (e) {
  assert(e.message === "Iterator is not reversable.");
}
```

##### What happens if `reverse()` is called after an iterator has already been partially iterated?

This proposal suggests that such a sequence of operations is not allowed. When
`[Symbol.reverseIterator]()` is called on an ArrayIterator or ListIterator, it
will first check that iteration has not already begun otherwise throw a
TypeError with a useful message:

```js
var iterator = array.values();
iterator.next();

try {
  var reverseIterator = iterator.reverse();
} catch (e) {
  assert(e.message === "Cannot reverse once iteration has begun.");
}
```

An alternative to this could be starting the partially completed reversed
iterator at the same position:

```js
var array = ["A", "B", "C"];
var iterator = array.values();
console.log(iterator.next().value); // "A"
console.log(iterator.next().value); // "B"
var reverseIterator = iterator.reverse();
console.log(reverseIterator.next().value); // "A"
console.log(reverseIterator.next().value); // undefined
```

There are some real caveats to this alternative approach:

 * The behavioral differences between reversing fresh iterators and partially
   iterated iterators could be confusing.
 * This requires maintaing a small amount of additional state and providing that
   state to the `[Symbol.reverseIterator]` method in a standardized way.
 * Completed iterators would require maintaining their state in case they are
   reversed which could make memory leaks easier to introduce to a program.

Because of these caveats, this alternative is not being proposed.


# Additions to Spec

## 6.1.5.1  Well-Known Symbols
> One row is added to Table 1.

| Specification Name | [[Description]] | Value and Purpose |
| ------------------ | --------------- | ----------------- |
| @@reverseIterator  | "Symbol.reverseIterator" | A method that returns the default reverse iterator for an object. Called by the **reverse** method of Iterators. |



## 25.1.1  Common Iteration Interfaces

### 25.1.1.X  The *ReverseIterable* Interface
> This interface is new

The *ReverseIterable* interface includes the following property:

| Property | Value | Requirements |
| -------- | ----- | ------------ |
| @@reverseIterator | A function that returns an Iterator object. | The returned object must conform to the *Iterator* interface. It must iterate through values in the reverse order of the object returned from the `@@iterator` method. |

NOTE  An object should implement the *ReverseIterable* interface only when it
also implements the *Iterable* interface.



## 25.1.2  The %IteratorPrototype% Object

#### 25.1.2.1.X  %IteratorPrototype%.reverse ( )
> This property is new

The following steps are taken:

  1. Let *O* be the result of calling ToObject with the **this** value as its argument.
  2. ReturnIfAbrupt(*O*).
  3. Let *usingReverseIterator* be GetMethod(*O*, @@reverseIterator).
  4. If *usingReverseIterator* is **undefined**, throw a **TypeError** exception.
  5. Let *iterator* be GetIterator(*O*, *usingReverseIterator*).
  6. return *iterator*.



## 19.4.2  Properties of the Symbol Constructor

### 19.4.2.X  Symbol.reverseIterator
> This property is new

The initial value of Symbol.reverseIterator is the well known symbol @@reverseIterator (Table 1).

This property has the attributes { [[Writable]]: **false**, [[Enumerable]]: **false**, [[Configurable]]: **false** }



## 22.1.3  Properties of the Array Prototype Object

### 22.1.3.X  Array.prototype \[ @@reverseIterator ] ( )
> This property is new

  1. Let *O* be the result of calling ToObject with the **this** value as its argument.
  2. ReturnIfAbrupt(*O*).
  3. Return CreateArrayReverseIterator(*O*, **"value"**).



## 22.1.5  Array Iterator Objects

### 22.1.5.2  The %ArrayIteratorPrototype% Object

#### 22.1.5.2.X  ArrayIteratorPrototype \[ @@reverseIterator ] ( )
> This property is new

  1. Let *O* be the **this** value.
  2. If Type(*O*) is not Object, throw a **TypeError** exception.
  3. If *O* does not have all of the internal slots of an Array Iterator Instance, throw a **TypeError** exception.
  4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  5. Let *index* be the value of the [[ArrayIteratorNextIndex]] internal slot of *O*.
  6. If *index* !== 0, then throw a **TypeError** exception.
  7. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  8. Return CreateArrayReverseIterator(*a*, *itemKind*).



## 22.1.X  Array Reverse Iterator Objects
> This section is new

An Array Reverse Iterator is an object, that represents a specific reverse
iteration over some specific Array instance object. There is not a named
constructor for Array Reverse Iterator objects. Instead, Array Reverse
Iterator objects are created by calling **reverse** on Array Iterator objects.


### 22.1.X.1  CreateArrayReverseIterator Abstract Operation

  1. Assert: Type(*array*) is Object
  2. Let *iterator* be ObjectCreate(%ArrayIteratorPrototype%, ([[IteratedObject]], [[ArrayReverseIteratorNextIndex]], [[ArrayIterationKind]])).
  3. Set *iterator’s* [[IteratedObject]] internal slot to *array*.
  4. If *array* has a [[TypedArrayName]] internal slot, then
      * a. Let *len* be the value of the [[ArrayLength]] internal slot of *array*.
  5. Else,
      * a. Let *len* be ToLength(Get(*array*, **"length"**)).
      * b. ReturnIfAbrupt(*len*).
  6. Set *iterator’s* [[ArrayReverseIteratorNextIndex]] internal slot to *len*-1.
  7. Set *iterator’s* [[ArrayIteratorKind]] internal slot to *kind*.
  8. Return *iterator*.


### 22.1.X.2  The %ArrayReverseIteratorPrototype% Object

All Array Reverse Iterator Objects inherit properties from the
%ArrayReverseIteratorPrototype% intrinsic object. The
%ArrayReverseIteratorPrototype% object is an ordinary object and its
[[Prototype]] internal slot is the %IteratorPrototype% intrinsic object
(25.1.2). In addition, %ArrayReverseIteratorPrototype% has the following
 properties:


#### 22.1.X.2.1  %ArrayReverseIteratorPrototype%.next ( )

  1. Let *O* be the **this** value.
  2. If Type(*O*) is not Object, throw a **TypeError** exception.
  3. If *O* does not have all of the internal slots of an Array Reverse Iterator Instance, throw a **TypeError** exception.
  4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  5. If *a* is **undefined**, then return CreateIterResult*O*bject(**undefined**, **true**).
  6. Let *index* be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O*.
  7. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  8. If *index* < 0, then
  9. Set the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O* to *index*-1.
  10. If *itemKind* is **"key"**, return CreateIterResultObject(*index*, **false**).
  11. Let *elementKey* be ToString(*index*).
  12. Let *elementValue* be Get(*a*, *elementKey*).
  13. ReturnIfAbrupt(*elementValue*).
  14. If *itemKind* is **"value"**, let *result* be *elementValue*.
  15. Else,
      * a. Assert *itemKind* is **"key+value"**,.
      * b. Let *result* be CreateArrayFromList(*«index, elementValue»*).
  16. Return CreateIterResultObject(*result*, **false**).


#### 22.1.X.2.2  ArrayReverseIteratorPrototype \[ @@reverseIterator ] ( )

  1. Let *O* be the **this** value.
  2. If Type(*O*) is not Object, throw a **TypeError** exception.
  3. If *O* does not have all of the internal slots of an Array Reverse Iterator Instance, throw a **TypeError** exception.
  4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  5. Let *index* be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O*.
  6. If *a* has a [[TypedArrayName]] internal slot, then
      * a. Let *len* be the value of the [[ArrayLength]] internal slot of *a*.
  7. Else,
      * a. Let *len* be ToLength(Get(*a*, **"length"**)).
      * b. ReturnIfAbrupt(*len*).
  8. If *index* !== *len*-1, then throw a **TypeError** exception.
  9. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  10. Return CreateArrayIterator(*a*, *itemKind*).


#### 22.1.X.2.3  %ArrayIteratorPrototype% \[ @@toStringTag ]

The initial value of the @@toStringTag property is the string value
**"Array Reverse Iterator"**.

This property has the attributes { [[Writable]]: **false**, [[Enumerable]]: **false**, [[Configurable]]: **true** }.


### 22.1.X.3  Properties of Array Reverse Iterator

Array Reverse Iterator instances are ordinary objects that inherit properties
from the %ArrayReverseIteratorPrototype% intrinsic object. Array Reverse
Iterator instances are initially created with the internal slots listed in the
following table.

| Internal Slot                     | Description |
| --------------------------------- | ----------- |
| [[IteratedObject]]                | The object whose array elements are being iterated. |
| [[ArrayReverseIteratorNextIndex]] | The integer index of the next array index to be examined by this iteration. |
| [[ArrayIterationKind]]            | A string value that identifies what is to be returned for each element of the iteration. The possible values are: **"key"**, **"value"**, **"key+value"**. |



## 21.1.X  String Reverse Iterator Objects
> This section is new

*TK* changes will mirror Array changes.



## 23.1.X  Map Reverse Iterator Objects
> This section is new

*TK* changes will mirror Array changes.



## 23.2.X  Set Reverse Iterator Objects
> This section is new

*TK* changes will mirror Array changes.



## 7.4  Operations on Iterator Objects

### 7.4.8  CreateListIterator ( list )
> This existing abstract operation has 2 new steps added: 7 and 8.

  1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListIteratorNextIndex]])).
  2. Set *iterator’s* [[IteratedList]] internal slot to *list*.
  3. Set *iterator’s* [[ListIteratorNextIndex]] internal slot to 0.
  4. Let *next* be a new built-in function object as defined in ListIterator **next** (7.4.8.1).
  5. Set *iterator’s* [[IteratorNext]] internal slot to *next*.
  6. Perform CreateMethodProperty(*iterator*, **"next"**, *next*).
  7. <ins>Let *reverse* be the built-in function object ListIterator **reverse**.</ins>
  8. <ins>Perform CreateMethodProperty(*iterator*, @@reverseIterator, *reverse*).</ins>
  9. Return *iterator*.

#### 7.4.8.X  ListIterator reverse ( )
> This method is new

The ListIterator **reverse** method is a standard built-in function object (clause 17)
that performs the following steps:

  1. Let *O* be the **this** value.
  2. If *O* does not have a [[IteratorList]] internal slot, then throw a **TypeError** exception.
  3. Let *list* be the value of the [[IteratorList]] internal slot of *O*.
  4. Return CreateListReverseIterator(*list*).


### 7.4.X  CreateListReverseIterator ( list )
> This abstract operation and section is new

The abstract operation CreateListReverseIterator with argument list creates an
Iterator (25.1.1.2) object whose next method returns the successive elements of
list in descending (reversed) order. It performs the following steps:

  1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListReverseIteratorNextIndex]])).
  2. Set *iterator’s* [[IteratedList]] internal slot to *list*.
  3. Let *len* be the number of elements of *list*.
  4. Set *iterator’s* [[ListReverseIteratorNextIndex]] internal slot to *len*-1.
  5. Let *next* be a new built-in function object as defined in ListReverseIterator **next**.
  6. Set *iterator’s* [[IteratorNext]] internal slot to *next*.
  7. Perform CreateMethodProperty(*iterator*, **"next"**, *next*).
  8. Let *reverse* be the built-in function object ListReverseIterator **reverse**.
  9. Perform CreateMethodProperty(*iterator*, @@reverseIterator, *reverse*).
  10. Return *iterator*.

#### 7.4.X.1  ListReverseIterator next ( )

The ListReverseIterator **next** method is a standard built-in function object (clause 17) that performs the following steps:

  1. Let *O* be the **this** value.
  2. Let *f* be the active function object.
  3. If *O* does not have a [[IteratorNext]] internal slot, then throw a **TypeError** exception.
  4. Let *next* be the value of the [[IteratorNext]] internal slot of *O*.
  5. If SameValue(*f*, *next*) is **false**, then throw a **TypeError** exception.
  6. If *O* does not have a [[IteratedList]] internal slot, then throw a **TypeError** exception.
  7. Let *list* be the value of the [[IteratedList]] internal slot of *O*.
  8. Let *index* be the value of the [[ListReverseIteratorNextIndex]] internal slot of *O*.
  10. If *index* < 0, then
      * a. Return CreateIterResultObject(**undefined**, **true**).
  11. Set the value of the [[ListReverseIteratorNextIndex]] internal slot of *O* to *index*-1.
  12. Return CreateIterResultObject(*list*[*index*], **false**).

NOTE  A ListReverseIterator **next** method will throw an exception if applied to any object other than the one with which it was originally associated.

#### 7.4.X.2  ListReverseIterator reverse ( )

The ListReverseIterator **reverse** method is a standard built-in function object (clause 17)
that performs the following steps:

  1. Let *O* be the **this** value.
  2. If *O* does not have a [[IteratorList]] internal slot, then throw a **TypeError** exception.
  3. Let *list* be the value of the [[IteratorList]] internal slot of *O*.
  4. Return CreateListIterator(*list*).


### 7.4.9  CreateCompoundIterator ( iterator1, iterator2 )
> This existing abstract operation has had 3 new steps added: 8, 9, and 10.

  1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[Iterator1]], [[Iterator2]], [[State]], [[IteratorNext]])).
  2. Set *iterator’s* [[Iterator1]] internal slot to *iterator1*.
  3. Set *iterator’s* [[Iterator2]] internal slot to *iterator2*.
  4. Set *iterator’s* [[State]] internal slot to 1.
  5. Let *next* be a new built-in function object as defined in CompoundIterator **next** (7.4.10.1).
  6. Set *iterator’s* [[IteratorNext]] internal slot to *next*.
  7. Perform CreateMethodProperty(*iterator*, **"next"**, *next*).
  8. <ins>Let *usingReverseIterator1* be GetMethod(*iterator1*, @@reverseIterator).</ins>
  9. <ins>Let *usingReverseIterator2* be GetMethod(*iterator2*, @@reverseIterator).</ins>
  10. <ins>If *usingReverseIterator1* is not **undefined** and *usingReverseIterator2* is not **undefined**.</ins>
      * a. <ins>Let *reverse* be the built-in function object CompoundIterator **reverse**.</ins>
      * b. <ins>Perform CreateMethodProperty(*iterator*, @@reverseIterator, *reverse*).</ins>
  11. Return *iterator*.

#### 7.4.9.X  CompoundIterator reverse ( )
> This method is new

The CompoundIterator **reverse** method is a standard built-in function object (clause 17)
that performs the following steps:

  1. Let *O* be the **this** value.
  2. If *O* does not have [[Iterator1]] and [[Iterator2]] internal slots, then throw a **TypeError** exception.
  3. Let *iterator1* be the value of the [[Iterator1] internal slot of *O*.
  4. Let *iterator2* be the value of the [[Iterator2] internal slot of *O*.
  5. Let *usingReverseIterator1* be GetMethod(*iterator1*, @@reverseIterator).
  6. If *usingReverseIterator1* is **undefined**, throw a **TypeError** exception.
  7. Let *reverseIterator1* be GetIterator(*O*, *usingReverseIterator1*).
  8. Let *usingReverseIterator2* be GetMethod(*iterator2*, @@reverseIterator).
  9. If *usingReverseIterator2* is **undefined**, throw a **TypeError** exception.
  10. Let *reverseIterator2* be GetIterator(*O*, *usingReverseIterator2*).
  11. Return CreateCompoundIterator(reverseIterator2, reverseIterator1).
