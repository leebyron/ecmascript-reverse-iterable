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
for (let [i, v] of a.entries().reversed()) {
  doSomething(v, i);
}
```

A simpler form, iterating through the default reverse iterator (values, in the
case of Array) would be written as:

```js
for (let v of a.reversed()) {
  doSomething(v);
}
```


This syntax has the benefit of not introducing new syntactical concepts but
instead just adds a few function properties to iterator prototypes.

In addition to the pattern of using `reversed()`, this proposal also suggests the
addition of a *ReverseIterable* interface which any object can implement by
adding a function to the `Symbol.reverseIterator` property. Capturing this in an
interface allows arbitrary code to detect that a particular object is reverse
iterable and use that to it's advantage.


## FAQ

**What happens if `reversed()` is called on something not easily reversed, like
a Generator function?**

This proposal suggests one-way iterables remain one-way. Objects which implement
*Iterable* do not also have to implement *ReverseIterable*. There is no buffering
in the native implementation of `%IteratorPrototype%.reverse()` when called on an
object which is not *ReverseIterable*. Buffering can result in difficult to
understand performance and memory pressure in some cases and infinite buffers in
the worst case.

Specifically, Generator objects *do not* implement the *ReverseIterable* interface.

For example, this code should throw a TypeError exception with a useful message:

```js
function* fib () {
  var n1 = 1, n2 = 0;
  [n1, n2] = [n1 + n2, n1];
  yield n1;
}

try {
  let fibs = fib();
  for (let num of fibs.reversed()) {
    console.log(num);
  }
} catch (e) {
  assert(e.message === "This iterator is not reversable.");
}
```


## Alternatives

There are a few other approaches we could take worth discussing.

#### `reverse()` instead of `reversed()`

In this alternative, we rename the method on **%IteratorPrototype%** from
**reversed** to **reverse**. There is already a method called **reverse** on
**Array.prototype**, so we the proposed functionality is not added to
**Array.prototype** at all.

Pros:

  * No potential confusion between **reverse()** and **reversed()** on **Array.prototype**.
  * Good parallel between **Array.prototype.reverse** and **%IteratorPrototype%.reverse**.
    The story is that `reverse` should return a similar type of thing as the `this` context.

Cons:

  * No nice way to get a reverse iterator from an Array directly. Must call
    **Array.prototype[Symbol.reverseIterator]** to get one.


#### `reversed()` marks the interface

In this alternative, we get rid of **Symbol.reverseIterator** and directly use
the existence of **reversed** to mark the *ReverseIterable* interface.

Pros:

  * Fewer pieces to implement for a useful *ReverseIterable* implementation.
  * If **reversed** exists, you can call it without TypeError.

Cons:

  * **reversed** could be too common of a property name in user-land to make this
    distinction in spec.
  * If you call **reversed()** on a non ReverseIterable, you get a less clear
    exception message concerning calling undefined as a function.
  * A user-land object may wish to implement **reversed** such that it uses the
    buffering technique explained as explicitly not proposed in FAQ, however
    this should not cause it to be identified as a *ReverseIterable* as proposed.



# Additions to Spec

## 6.1.5.1  Well-Known Symbols
> One row is added to Table 1.

| Specification Name | [[Description]] | Value and Purpose |
| ------------------ | --------------- | ----------------- |
| @@reverseIterator  | "Symbol.reverseIterator" | A method that returns the default reverse iterator for an object. Called by the **reversed** method of Iterators and Collections. |



## 25.1.1  Common Iteration Interfaces

### 25.1.1.X  The *ReverseIterable* Interface
> This interface is new

The *ReverseIterable* interface includes the following property:

| Property | Value | Requirements |
| -------- | ----- | ------------ |
| @@reverseIterator | A function that returns an Iterator object. | The returned object must conform to the *Iterator* interface. It must iterate through values in the reverse order of the object returned from the `@@iterator` function. |

NOTE  An object should implement the *ReverseIterable* interface only when it
also implements the *Iterable* interface.



## 25.1.2  The %IteratorPrototype% Object

#### 25.1.2.1.X  %IteratorPrototype%.reversed ( )
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

### 22.1.3.X  Array.prototype.reversed ( )
> This property is new

  1. Let *O* be the result of calling ToObject with the **this** value as its argument.
  2. ReturnIfAbrupt(*O*).
  3. Return CreateArrayReverseIterator(*O*, **"value"**).

### 22.1.3.X  Array.prototype \[ @@reverseIterator ] ( )
> This property is new

The initial value of the @@reverseIterator property is the same function object
as the initial value of the **Array.prototype.reversed** property.



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
Iterator objects are created by calling **reversed** on Array objects or Array
Iterator objects.


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
> This existing abstract operation has 2 new steps added: 6 and 7.

  1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListIteratorNextIndex]])).
  2. Set *iterator’s* [[IteratedList]] internal slot to *list*.
  3. Set *iterator’s* [[ListIteratorNextIndex]] internal slot to 0.
  4. Let *next* be a new built-in function object as defined in ListIterator **next** (7.4.9.1).
  5. Set *iterator’s* [[IteratorNext]] internal slot to *next*.
  6. Let *reversed* be a new built-in function object as defined in ListIterator **reversed**.
  7. Perform DefinePropertyOrThrow(*iterator*, @@reverseIterator, PropertyDescriptor {[[Value]]: *reversed*, [[Writable]]: **true**, [[Enumerable]]: **false**, [[Configurable]]: **true**}).
  8. Let *status* be CreateDataProperty(iterator, **"next"**, *next*).
  9. Return *iterator*.

#### 7.4.8.X  ListIterator reversed ( )
> This method is new

The ListIterator **reversed** method is a standard built-in function object (clause 17)
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
  7. Let *reversed* be a new built-in function object as defined in ListReverseIterator **reversed**.
  8. Perform DefinePropertyOrThrow(*iterator*, @@reverseIterator, PropertyDescriptor {[[Value]]: *reversed*, [[Writable]]: **true**, [[Enumerable]]: **false**, [[Configurable]]: **true**}).
  9. Let *status* be CreateDataProperty(*iterator*, **"next"**, *next*).
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

#### 7.4.X.2  ListReverseIterator reversed ( )

The ListReverseIterator **reversed** method is a standard built-in function object (clause 17)
that performs the following steps:

  1. Let *O* be the **this** value.
  2. If *O* does not have a [[IteratorList]] internal slot, then throw a **TypeError** exception.
  3. Let *list* be the value of the [[IteratorList]] internal slot of *O*.
  4. Return CreateListIterator(*list*).


### 7.4.9  CreateCompoundIterator ( iterator1, iterator2 )
> This existing abstract operation has had 3 new steps added: 7, 8, and 9.

  1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[Iterator1]], [[Iterator2]], [[State]], [[IteratorNext]])).
  2. Set *iterator’s* [[Iterator1]] internal slot to *iterator1*.
  3. Set *iterator’s* [[Iterator2]] internal slot to *iterator2*.
  4. Set *iterator’s* [[State]] internal slot to 1.
  5. Let *next* be a new built-in function object as defined in CompoundIterator **next** (7.4.10.1).
  6. Set *iterator’s* [[IteratorNext]] internal slot to *next*.
  7. Let *usingReverseIterator1* be GetMethod(*iterator1*, @@reverseIterator).
  8. Let *usingReverseIterator2* be GetMethod(*iterator2*, @@reverseIterator).
  9. If *usingReverseIterator1* is not **undefined** and *usingReverseIterator2* is not **undefined**.
      * a. Let *reversed* be a new built-in function object as defined in CompoundIterator **reversed**.
      * b. Perform DefinePropertyOrThrow(*iterator*, @@reverseIterator, PropertyDescriptor {[[Value]]: *reversed*, [[Writable]]: **true**, [[Enumerable]]: **false**, [[Configurable]]: **true**}).
  10. Let *status* be CreateDataProperty(iterator, **"next"**, *next*).
  11. Return *iterator*.

#### 7.4.9.X  CompoundIterator reversed ( )
> This method is new

The CompoundIterator **reversed** method is a standard built-in function object (clause 17)
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
