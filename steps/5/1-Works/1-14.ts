// 1-14.ts
type First<T extends any[]> = T extends [infer P, ...any[]] ? P : never;

// 测试用例
type arr1 = ["a", "b", "c"];
type arr2 = [3, 2, 1];

type head1 = First<arr1>; // 'a'
type head2 = First<arr2>; // 3
type head3 = First<[]>; // never
