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

A simplest form, iterating through the default reverse iterator (values, in the
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



# Alternatives

There are a few other approaches we could take worth discussing.

#### `reverse()` instead of `reversed()`

In this alternative, we rename the method on **%IteratorPrototype%** from
`reversed` to `reverse`. There is already a method called `reverse` on
**Array.prototype**, so we the proposed functionality is not added to
**Array.prototype** at all.

Pros:

  * No potential confusion between `reverse()` and `reversed()` on **Array.prototype**.
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
  * If **reversed** exists, you can call it.

Cons:

  * `reversed` could be too common of a property name in user-land to make this
    distinction in spec.
  * If you call `reversed()` on a non ReverseIterable, you get a less clear
    exception message concerning calling undefined as a function.



# Additions to Spec


## The *ReverseIterable* Interface
> This interface is new.

The *ReverseIterable* interface includes the following property:

| Property | Value | Requirements |
| -------- | ----- | ------------ |
| `@@reverseIterator` | A zero arguments function that returns an object. | The function returns an object that conforms to the *Iterator* interface. It must iterate through values in the reverse order of `@@iterator` |

NOTE  An object should implement the *ReverseIterable* interface only when it
also implements the *Iterable* interface.



## 19.4.2  Properties of the Symbol Constructor

### Symbol.reverseIterator
> This property is new, added in 19.4.2

The initial value of Symbol.reverseIterator is the well known symbol @@reverseIterator (Table 1).

This property has the attributes { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }



## 22.1.3  Properties of the Array Prototype Object

### Array.prototype.reversed ( )
> This property is new, added in 22.1.3

  1. Let *O* be the result of calling ToObject with the this value as its argument.
  2. ReturnIfAbrupt(*O*).
  3. Return CreateArrayReverseIterator(*O*, **"value"**).

### Array.prototype \[ @@reverseIterator ] ( )
> This property is new, added in 22.1.3

The initial value of the @@reverseIterator property is the same function object
as the initial value of the **Array.prototype.reversed** property.



## 22.1.5  Array Iterator Objects

### 22.1.5.2  The %ArrayIteratorPrototype% Object

#### ArrayIteratorPrototype.reversed ( )
> This property is new, added in 22.1.5.2

  1. Let *O* be the **this** value.
  2. If Type(*O*) is not Object, throw a **TypeError** exception.
  3. If *O* does not have all of the internal slots of an Array Iterator Instance, throw a **TypeError** exception.
  4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  5. Let *index* be the value of the [[ArrayIteratorNextIndex]] internal slot of *O*.
  6. If *index* !== 0, then throw a **TypeError** exception.
  7. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  8. Return CreateArrayReverseIterator(*a*, *itemKind*).


#### ArrayIteratorPrototype \[ @@reverseIterator ] ( )
> This property is new, added in 22.1.5.2

The initial value of the @@reverseIterator property is the same function as
the initial value of the **ArrayIteratorPrototype.reversed** property.



## Array Reverse Iterator Objects
> This section is new, added after 22.1.5

An Array Reverse Iterator is an object, that represents a specific reverse
iteration over some specific Array instance object. There is not a named
constructor for Array Reverse Iterator objects. Instead, Array Reverse
Iterator objects are created by calling **reversed** on Array objects or Array
Iterator objects.


### CreateArrayReverseIterator Abstract Operation

  1. Assert: Type(*array*) is Object
  2. Let *iterator* be ObjectCreate(%ArrayIteratorPrototype%, ([[IteratedObject]], [[ArrayReverseIteratorNextIndex]], [[ArrayIterationKind]])).
  3. Set *iterator’s* [[IteratedObject]] internal slot to *array*.
  4. Let *lenValue* be Get(*array*, **"length"**).
  5. Let *len* be ToLength(*lenValue*).
  6. ReturnIfAbrupt(*len*).
  7. Set *iterator’s* [[ArrayReverseIteratorNextIndex]] internal slot to *len*-1.
  8. Set *iterator’s* [[ArrayIteratorKind]] internal slot to *kind*.
  9. Return *iterator*.


### The %ArrayReverseIteratorPrototype% Object

All Array Reverse Iterator Objects inherit properties from the
%ArrayReverseIteratorPrototype% intrinsic object. The
%ArrayReverseIteratorPrototype% object is an ordinary object and its
[[Prototype]] internal slot is the %IteratorPrototype% intrinsic object
(25.1.2). In addition, %ArrayReverseIteratorPrototype% has the following
 properties:


#### %ArrayReverseIteratorPrototype%.next ( )

  1. Let *O* be the this value.
  2. If Type(*O*) is not Object, throw a **TypeError** exception.
  3. If *O* does not have all of the internal slots of an Array Reverse Iterator Instance, throw a **TypeError** exception.
  4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  5. If *a* is **undefined**, then return CreateIterResult*O*bject(**undefined**, **true**).
  6. Let *index* be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O*.
  7. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  8. If *index* < 0, then
  9. Set the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O* to *index*-1.
  10. If *itemKind* is **"key"**, then let *result* be *index*.
  11. Else,
    a. Let *elementKey* be ToString(*index*).
    b. Let *elementValue* be Get(*a*, *elementKey*).
    c. ReturnIfAbrupt(*elementValue*).
  12. If *itemKind* is **"value"**, then let *result* be *elementValue*.
  13. Else,
      a. Assert *itemKind* is **"key+value"**,.
      b. Let *result* be ArrayCreate(2).
      c. Assert: *result* is a new, well-formed Array object so the following operations will never fail.
      d. Call CreateDataProperty(*result*, **"0"**, *index*).
      e. Call CreateDataProperty(*result*, **"1"**, *elementValue*).
  14. Return CreateIterResultObject(*result*, **false**).


#### %ArrayReverseIteratorPrototype%.reversed ( )

  1. Let *O* be the **this** value.
  2. If Type(*O*) is not Object, throw a **TypeError** exception.
  3. If *O* does not have all of the internal slots of an Array Reverse Iterator Instance, throw a **TypeError** exception.
  4. Let *a* be the value of the [[IteratedObject]] internal slot of *O*.
  5. Let *index* be the value of the [[ArrayReverseIteratorNextIndex]] internal slot of *O*.
  6. Let *lenValue* be Get(*a*, **"length"**).
  7. Let *len* be ToLength(*lenValue*).
  8. ReturnIfAbrupt(*len*).
  9. If *index* !== *len*-1, then throw a **TypeError** exception.
  10. Let *itemKind* be the value of the [[ArrayIterationKind]] internal slot of *O*.
  11. Return CreateArrayIterator(*a*, *itemKind*).


#### ArrayReverseIteratorPrototype \[ @@reverseIterator ] ( )

The initial value of the @@reverseIterator property is the same function as the
initial value of the **ArrayReverseIteratorPrototype.reversed** property.


#### %ArrayIteratorPrototype% \[ @@toStringTag ]

The initial value of the @@toStringTag property is the string value
**"Array Reverse Iterator"**.

This property has the attributes { [[Writable]]: **false**, [[Enumerable]]: **false**, [[Configurable]]: **true** }.


### Properties of Array Reverse Iterator

Array Reverse Iterator instances are ordinary objects that inherit properties
from the %ArrayReverseIteratorPrototype% intrinsic object. Array Reverse
Iterator instances are initially created with the internal slots listed in the
following table.

| Internal Slot                     | Description |
| --------------------------------- | ----------- |
| [[IteratedObject]]                | The object whose array elements are being iterated. |
| [[ArrayReverseIteratorNextIndex]] | The integer index of the next array index to be examined by this iteration. |
| [[ArrayIterationKind]]            | A string value that identifies what is to be returned for each element of the iteration. The possible values are: **"key"**, **"value"**, **"key+value"**. |



## String Reverse Iterator Objects
> This section is new

*TK* changes will mirror Array changes.


## Map Reverse Iterator Objects
> This section is new

*TK* changes will mirror Array changes.


## Set Reverse Iterator Objects
> This section is new

*TK* changes will mirror Array changes.







Works in Progress...


### CheckReverseIterable ( obj )

The abstract operation CheckReverseIterable with argument *obj* performs the
following steps:

  1. If Type(*obj*) is not Object, then return **undefined**.
  2. Return Get(*obj*, @@reverseIterator).




### 7.4.9 CreateListIterator ( list )

The abstract operation CreateListIterator with argument list creates an Iterator (25.1.1.2) object whose next method returns the successive elements of list. It performs the following steps:

1. Let iterator be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListIteratorNextIndex]])).
2. Set iterator’s [[IteratedList]] internal slot to list.
3. Set iterator’s [[ListIteratorNextIndex]] internal slot to 0.
4. Let next be a new built-in function object as defined in ListIterator next (7.4.9.1).
5. Set iterator’s [[IteratorNext]] internal slot to next.
6. Let status be the result of CreateDataProperty(iterator, "next", next).
7. Return iterator.

#### 7.4.9.1 ListIterator next( )

The ListIterator next method is a standard built-in function object (clause 17) that performs the following steps:

1. Let O be the this value.
2. Let f be the active function object.
3. If O does not have a [[IteratorNext]] internal slot, then throw a TypeError exception.
4. Let next be the value of the [[IteratorNext]] internal slot of O.
5. If SameValue(f, next) is false, then throw a TypeError exception.
6. If O does not have a [[IteratedList]] internal slot, then throw a TypeError exception.
7. Let list be the value of the [[IteratedList]] internal slot of O.
8. Let index be the value of the [[ListIteratorNextIndex]] internal slot of O.
9. Let len be the number of elements of list.
10. If index ≥ len, then
  a. Return CreateIterResultObject(undefined, true).
11. Set the value of the [[ListIteratorNextIndex]] internal slot of O to index+1.
12. Return CreateIterResultObject(list[index], false).

NOTE  A ListIterator next method will throw an exception if applied to any object other than the one with which it was originally associated.






### 7.4.11 CreateListReverseIterator ( list )

The abstract operation CreateListReverseIterator with argument list creates an Iterator (25.1.1.2) object whose next method returns the successive elements of list in ascending (reverse) order. It performs the following steps:

1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListReverseIteratorNextIndex]])).
2. Set iterator’s [[IteratedList]] internal slot to list.
3. Set iterator’s [[ListReverseIteratorNextIndex]] internal slot to 0.
4. Let next be a new built-in function object as defined in ListIterator next (7.4.9.1).
5. Set iterator’s [[IteratorNext]] internal slot to next.
6. Let status be the result of CreateDataProperty(iterator, "next", next).
7. Return iterator.

#### 7.4.11.1 ListIterator next( )

The ListIterator next method is a standard built-in function object (clause 17) that performs the following steps:

1. Let O be the this value.
2. Let f be the active function object.
3. If O does not have a [[IteratorNext]] internal slot, then throw a TypeError exception.
4. Let next be the value of the [[IteratorNext]] internal slot of O.
5. If SameValue(f, next) is false, then throw a TypeError exception.
6. If O does not have a [[IteratedList]] internal slot, then throw a TypeError exception.
7. Let list be the value of the [[IteratedList]] internal slot of O.
8. Let index be the value of the [[ListIteratorNextIndex]] internal slot of O.
9. Let len be the number of elements of list.
10. If index ≥ len, then
  a. Return CreateIterResultObject(undefined, true).
11. Set the value of the [[ListIteratorNextIndex]] internal slot of O to index+1.
12. Return CreateIterResultObject(list[index], false).

NOTE  A ListIterator next method will throw an exception if applied to any object other than the one with which it was originally associated.

