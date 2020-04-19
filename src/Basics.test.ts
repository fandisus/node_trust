import { Basics } from './Basics';

describe("Basics getDiff(obj, obj)", ()=> {
  test("It should show updated properties", () => {
    let obj1 = {a:1, b:2, c:3};
    let obj2 = {a:1, b:3, c:4};
    let output = {b:{new:3, old:2}, c:{new:4, old:3}};
    expect(Basics.getDiff(obj1, obj2)).toEqual(output);
  });

  test("It should show added elements of array properties", ()=>{
    let obj1 = {a:[1,2,3]};
    let obj2 = {a:[1,4,5]};
    let output = {a:{added:[4,5], removed:[2,3]}};
    expect(Basics.getDiff(obj1, obj2)).toEqual(output);
  });

  test("It should show difference of nested objects", ()=>{
    let obj1 = {a:{a1:1, a2:2}, b:{b1:2, b2:4}};
    let obj2 = {a:{a1:1, a2:2}, b:{b1:3, b2:4}};
    let output = {b:{b1:{old:2, new:3}}};
    expect(Basics.getDiff(obj1, obj2)).toEqual(output);
  });
});