// 1-13.ts
//npm install --save-dev @type-challenges/utils
import type { Equal, Expect } from "@type-challenges/utils";

type HelloWorld = string; // 正确实现

// 测试用例
type TestCase = [
  Expect<Equal<HelloWorld, string>> // 应通过验证
];
