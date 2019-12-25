# Basics
This class is used in DataCommunicator class, to get difference between objects before updating data to database.
##### Dependency
- Lodash

##### How to import
	import {Basics} from '@icfm/trust';
or

	const Basics = require('@icfm/trust').Basics;

##GetDiff(obj, obj)

#####Example 1
```javascript
let obj1 = {a:1, b:2, c:3};
let obj2 = {a:1, b:3, c:4};
console.log(Basics.getDiff(obj1, obj2));
```
Result:

	{b:{new:3, old:2}, c:{new:4, old:3}}

#####Example 2
```javascript
let obj1 = {a:[1,2,3]};
let obj2 = {a:[1,4,5]};
console.log(Basics.getDiff(obj1, obj2));
```
Result:

	{a:{added:[4,5], removed:[2,3]}}

#####Example 3
```javascript
let obj1 = {a:{a1:1, a2:2}, b:{b1:2, b2:4}};
let obj2 = {a:{a1:1, a2:2}, b:{b1:3, b2:4}};
console.log(Basics.getDiff(obj1, obj2));
```
Result:

	{b:{b1:{old:2, new:3}}}