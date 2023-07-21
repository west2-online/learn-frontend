# 前端 第六轮考核
## 目的

- 熟悉TypeScript的使用
- 了解Vue中引入TypeScript及其基本写法
- 泛型，字面量类型，联合类型，类型推断
- 掌握简单的类型体操

## 任务

1. 声明一个联合类型 `Shape`，它可以是 `Circle`、`Square` 或`Triangle`中的一种。
  - `Circle`是一个接口，它具有`type`和`radius`两个属性，其中`type`的值是`"circle"`，`radius`的值是`number`类型，代表圆的半径
  - `Square`是一个接口，它具有`type`和`length`两个属性，其中`type`的值是`"square"`，`length`的值是`number`类型，代表正方形的边长
  - `Triangle`是一个接口，它具有`type`，`length1`, `length2`, `length3`三个属性，其中`type`的值是`"triangle"`，`length1`, `length2`, `length3`的值是`number`类型，代表三角形的三个边
  - 声明一个变量`shape`，它的类型是`Shape`，但是它的值是一个`Circle`，`Square`或`Triangle`，例如`{ type: "circle", radius: 10 }`，`{ type: "square", length: 10 }`，`{ type: "triangle", length1: 10, length2: 10, length3: 10 }`。
2. 编写三个函数`isCircle`，`isSquare`，`isTriangle`，它们接收一个`Shape`类型的参数，并返回一个布尔值，表示这个参数是否是`Circle`，`Square`或`Triangle`。请使用`is`类型谓词进行类型守卫，当返回值为`true`时，可以在函数体内放心地将参数断言为`Circle`，`Square`或`Triangle`。
3. 编写一个函数 `getArea`，它接收一个 `Shape` 类型的参数，使用2中编写的三个函数判断参数类型，并根据不同的形状计算并返回对应的面积。例如，当参数是`{ type: "circle", radius: 10 }`时，返回值是`314.159`，当参数是`{ type: "square", length: 10 }`时，返回值是`100`，当参数是`{ type: "triangle", length1: 10, length2: 10, length3: 10 }`时，返回值是`43.301`。
4. 编写一个泛型函数 `filterArray`，它接收两个参数：一个数组和一个过滤函数。该函数应该根据过滤函数的条件，过滤并返回符合条件的数组元素。请使用泛型约束，使得过滤函数的参数类型和数组元素的类型相同，同时返回值类型和数组元素的类型相同。
5. 使用`Vite`构建一个`Vue3`项目，使用`TypeScript`模板，或者修改之前写的代码，为api的请求值和返回值写类型定义，尝试在`ref`，`computed`等函数中引入泛型类型，查看能否正常使用，了解什么时候需要引入。

## Bonus

1. 不使用 Pick<T, K> ，实现 TS 内置的 Pick<T, K> 的功能。从类型 T 中选出符合 K 的属性，构造一个新的类型。例如：
```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
}
```
2. 实现一个泛型 DeepReadonly<T>，它将对象的每个参数及其子对象递归地设为只读。假设在此挑战中我们仅处理对象。不考虑数组、函数、类等。但是，你仍然可以通过覆盖尽可能多的不同案例来挑战自己。例如
```ts
type X = { 
  x: { 
    a: 1
    b: 'hi'
  }
  y: 'hey'
}

type Expected = { 
  readonly x: { 
    readonly a: 1
    readonly b: 'hi'
  }
  readonly y: 'hey' 
}

type Todo = DeepReadonly<X> // 和`Expected`类型相同
```
3. 写一个接受数组的类型，并且返回扁平化的数组类型
```ts
type flatten = Flatten<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, 5]
```