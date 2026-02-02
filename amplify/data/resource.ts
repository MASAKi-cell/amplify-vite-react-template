import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// データ構造（AppSync + DynamoDB）
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]), // 閲覧は全員
      allow.authenticated().to(["create"]), // 作成は認証ユーザー
      allow.owner(), // 更新・削除は所有者のみ
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey", // APIキーにによるアクセス
    apiKeyAuthorizationMode: {
      expiresInDays: 30, // 期限
    },
  },
});
