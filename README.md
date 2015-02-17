# 25.1.1.4  The *ReverseIterable* Interface

The *ReverseIterable* interface includes the following property:

| Property | Value | Requirements |
| `@@reverseIterator` | A zero arguments function that returns an object. | The function returns an object that conforms to the *Iterator* interface. It must iterate through values in the reverse order of `@@iterator` |

NOTE  An object should implement the *ReverseIterable* interface only when it
also implements the *Iterable* interface.





# 7.4.9 CreateListIterator ( list )

The abstract operation CreateListIterator with argument list creates an Iterator (25.1.1.2) object whose next method returns the successive elements of list. It performs the following steps:

1. Let iterator be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListIteratorNextIndex]])).
2. Set iterator’s [[IteratedList]] internal slot to list.
3. Set iterator’s [[ListIteratorNextIndex]] internal slot to 0.
4. Let next be a new built-in function object as defined in ListIterator next (7.4.9.1).
5. Set iterator’s [[IteratorNext]] internal slot to next.
6. Let status be the result of CreateDataProperty(iterator, "next", next).
7. Return iterator.

# 7.4.9.1 ListIterator next( )

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






# 7.4.11 CreateListReverseIterator ( list )

The abstract operation CreateListReverseIterator with argument list creates an Iterator (25.1.1.2) object whose next method returns the successive elements of list in ascending (reverse) order. It performs the following steps:

1. Let *iterator* be ObjectCreate(%IteratorPrototype%, ([[IteratorNext]], [[IteratedList]], [[ListReverseIteratorNextIndex]])).
2. Set iterator’s [[IteratedList]] internal slot to list.
3. Set iterator’s [[ListReverseIteratorNextIndex]] internal slot to 0.
4. Let next be a new built-in function object as defined in ListIterator next (7.4.9.1).
5. Set iterator’s [[IteratorNext]] internal slot to next.
6. Let status be the result of CreateDataProperty(iterator, "next", next).
7. Return iterator.

# 7.4.11.1 ListIterator next( )

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

