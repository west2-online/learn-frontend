type Length<T extends readonly any[]> = T["length"];

// 测试用例
const tesla = ["tesla", "model 3", "model X", "model Y"] as const;
const spaceX = [
  "FALCON 9",
  "FALCON HEAVY",
  "DRAGON",
  "STARSHIP",
  "HUMAN SPACEFLIGHT",
] as const;

type teslaLength = Length<typeof tesla>; // 4
type spaceXLength = Length<typeof spaceX>; // 5
