import { defineFunction } from "@aws-amplify/backend";

// Lambda関数の定義
export const api = defineFunction({
  name: "api",
  entry: "./handler.ts", // 実際の処理を書くファイル
  timeoutSeconds: 30, // タイムアウト（最大900秒）
  memoryMB: 256,
  resourceGroupName: "api", // ApiStackに配置して循環参照を回避
});
