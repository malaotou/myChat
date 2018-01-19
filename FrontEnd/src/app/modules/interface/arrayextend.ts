/**
** 排序方向。
*/
type Direct = "asc" | "desc";
/**
** 排序属性。
** 
** @interface IPropertyOrder
*/
interface IPropertyOrder {
    [name: string]: Direct;
}
/**
** 简单名/值对象。
** 
** @interface ISimpleObject
*/
interface ISimpleObject {
    [name: string]: string | number | boolean;
}
/**
** 对简单的名/值对象按照指定属性和排序方向进行排序（根据排序属性及排序方向，
** 对两个项依次进行比较，并返回代表排序位置的值）。
** 
** @template T 简单的名/值对象。
** @param {T} item1 排序比较项1。
** @param {T} item2 排序比较项2。
** @param {...IPropertyOrder[]} props 排序属性。
** @returns 若项1大于项2返回1，若项1等于项2返回0，否则返回-1。
*/
function SortByProps<T extends ISimpleObject>
    (item1: T, item2: T, ...props: IPropertyOrder[]) {
    "use strict";
    var cps: Array<number> = []; // 存储排序属性比较结果。
    // 如果未指定排序属性，则按照全属性升序排序。 
    var asc = true;
    if (props.length < 1) {
        for (var p in item1) {
            if (item1[p] > item2[p]) {
                cps.push(1);
                break; // 大于时跳出循环。
            } else if (item1[p] === item2[p]) {
                cps.push(0);
            } else {
                cps.push(-1);
                break; // 小于时跳出循环。
            }
        }
    } else { // 按照指定属性及升降方向进行排序。
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            for (var o in prop) {
                asc = prop[o] === "asc";
                if (item1[o] > item2[o]) {
                    cps.push(asc ? 1 : -1);
                    break; // 大于时跳出循环。
                } else if (item1[o] === item2[o]) {
                    cps.push(0);
                } else {
                    cps.push(asc ? -1 : 1);
                    break; // 小于时跳出循环。
                }
            }
        }
    }
    for (var j = 0; j < cps.length; j++) {
        if (cps[j] === 1 || cps[j] === -1) {
            return cps[j];
        }
    }
    return 0;
}