# Backend Coding Guidelines

AWS Amplify Gen 2 バックエンド開発のコーディングガイドライン。

## 基本原則

### 関数スタイル

アロー関数を使用する。

```typescript
// Good
const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // ...
};

const getPostById = async (id: string): Promise<POST | null> => {
  // ...
};

// Bad
async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // ...
}
```

### 型定義

TypeScript の `type` を使用して厳密に定義する。

```typescript
// 型定義ファイル: types.ts
export type POST = {
  id: string;
  title: string;
  content: string;
  imageKey?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type COMMENT = {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
};

export type API_RESPONSE<T> = {
  statusCode: number;
  body: T | { error: string };
};
```

### 文字列定数

エラーメッセージや固定文字列は定数化する。

```typescript
// constants.ts
export const ERROR_MESSAGES = {
  NO_TOKEN_PROVIDED: 'No token provided',
  INVALID_TOKEN: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized',
  NO_PERMISSION: 'You do not have permission to modify this resource',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_INPUT: 'Invalid input',
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_LONG: 'Title must be 200 characters or less',
  CONTENT_REQUIRED: 'Content is required',
  NOT_FOUND: (resource: string) => `${resource} not found`,
  ENV_NOT_SET: (name: string) => `${name} environment variable is not set`,
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
} as const;

export const HTTP_HEADER_VALUES = {
  APPLICATION_JSON: 'application/json',
  ALLOW_ALL_ORIGINS: '*',
  ALLOWED_HEADERS: 'Content-Type,Authorization',
  ALLOWED_METHODS: 'GET,POST,PUT,DELETE,OPTIONS',
} as const;
```

## Lambda 関数

### ハンドラー構造

```typescript
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const result = await processRequest(event);
    return createResponse(200, result);
  } catch (error) {
    return handleError(error);
  }
};
```

### レスポンスヘルパー

共通のレスポンス生成関数を使用する。

```typescript
import { ERROR_MESSAGES, HTTP_HEADERS, HTTP_HEADER_VALUES } from './constants';

const createResponse = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADER_VALUES.APPLICATION_JSON,
    [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN]: HTTP_HEADER_VALUES.ALLOW_ALL_ORIGINS,
    [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS]: HTTP_HEADER_VALUES.ALLOWED_HEADERS,
    [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_METHODS]: HTTP_HEADER_VALUES.ALLOWED_METHODS,
  },
  body: JSON.stringify(body),
});

const handleError = (error: unknown): APIGatewayProxyResult => {
  console.error('Error:', error);

  if (error instanceof ValidationError) {
    return createResponse(400, { error: error.message });
  }
  if (error instanceof NotFoundError) {
    return createResponse(404, { error: error.message });
  }
  if (error instanceof UnauthorizedError) {
    return createResponse(403, { error: error.message });
  }

  return createResponse(500, { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
};
```

### カスタムエラークラス

```typescript
import { ERROR_MESSAGES } from './constants';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(ERROR_MESSAGES.NOT_FOUND(resource));
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

## DynamoDB 操作

### クライアント初期化

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
```

### CRUD 操作

```typescript
import type { POST } from './types';

const TABLE_NAME = process.env.POSTS_TABLE_NAME!;

// Create
const createPost = async (post: Omit<POST, 'id' | 'createdAt' | 'updatedAt'>): Promise<POST> => {
  const now = new Date().toISOString();
  const newPost: POST = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: newPost,
  }));

  return newPost;
};

// Read
const getPostById = async (id: string): Promise<POST | null> => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id },
  }));

  return (result.Item as POST) ?? null;
};

// Query with GSI
const getPostsByAuthor = async (authorId: string): Promise<POST[]> => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'byAuthor',
    KeyConditionExpression: 'authorId = :authorId',
    ExpressionAttributeValues: {
      ':authorId': authorId,
    },
  }));

  return (result.Items as POST[]) ?? [];
};

// Delete
const deletePost = async (id: string): Promise<void> => {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  }));
};
```

### テーブル設計

```typescript
// amplify/data/resource.ts
import { defineData } from '@aws-amplify/backend';

export const data = defineData({
  // DynamoDB テーブル定義
});
```

**パーティションキー設計**:
- POST: `id` (UUID)
- COMMENT: `id` (UUID)、GSI で `postId` を使用

## 認証・認可

### Cognito トークン検証

```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ERROR_MESSAGES } from './constants';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

const extractUserId = async (event: APIGatewayProxyEvent): Promise<string> => {
  const token = event.headers.Authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN_PROVIDED);
  }

  try {
    const payload = await verifier.verify(token);
    return payload.sub;
  } catch {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
  }
};
```

### 所有者チェック

```typescript
import { ERROR_MESSAGES } from './constants';

const verifyOwnership = async (resourceAuthorId: string, requesterId: string): Promise<void> => {
  if (resourceAuthorId !== requesterId) {
    throw new UnauthorizedError(ERROR_MESSAGES.NO_PERMISSION);
  }
};
```

## バリデーション

### 入力検証

```typescript
import type { POST } from './types';
import { ERROR_MESSAGES } from './constants';

const validatePostInput = (input: unknown): Omit<POST, 'id' | 'authorId' | 'createdAt' | 'updatedAt'> => {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT);
  }

  const { title, content, imageKey } = input as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError(ERROR_MESSAGES.TITLE_REQUIRED);
  }

  if (title.length > 200) {
    throw new ValidationError(ERROR_MESSAGES.TITLE_TOO_LONG);
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError(ERROR_MESSAGES.CONTENT_REQUIRED);
  }

  return {
    title: title.trim(),
    content: content.trim(),
    imageKey: typeof imageKey === 'string' ? imageKey : undefined,
  };
};
```

## 環境変数

### 定義

```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { api } from './functions/api/resource';

const backend = defineBackend({
  api,
});

// Lambda に環境変数を渡す
backend.api.resources.lambda.addEnvironment('POSTS_TABLE_NAME', postsTable.tableName);
```

### 使用

```typescript
import { ERROR_MESSAGES } from './constants';

const TABLE_NAME = process.env.POSTS_TABLE_NAME;

if (!TABLE_NAME) {
  throw new Error(ERROR_MESSAGES.ENV_NOT_SET('POSTS_TABLE_NAME'));
}
```

## ログ出力

### 構造化ログ

```typescript
const LOG_LEVELS = {
  INFO: 'INFO',
  ERROR: 'ERROR',
} as const;

const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: LOG_LEVELS.INFO, message, ...data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: LOG_LEVELS.ERROR,
      message,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
      ...data,
      timestamp: new Date().toISOString()
    }));
  },
};

// Usage
logger.info('Post created', { postId: post.id, authorId: post.authorId });
logger.error('Failed to create post', error, { input });
```

## ファイル構成

```
/amplify
├── auth/
│   └── resource.ts          # Cognito 設定
├── data/
│   └── resource.ts          # DynamoDB テーブル定義
├── storage/
│   └── resource.ts          # S3 バケット設定
├── functions/
│   └── api/
│       ├── resource.ts      # Lambda 関数定義
│       ├── handler.ts       # メインハンドラー
│       ├── routes/
│       │   ├── posts.ts     # POST エンドポイント
│       │   └── comments.ts  # COMMENT エンドポイント
│       ├── services/
│       │   ├── postService.ts
│       │   └── commentService.ts
│       ├── utils/
│       │   ├── response.ts
│       │   ├── auth.ts
│       │   └── validation.ts
│       ├── constants/
│       │   └── index.ts     # 定数定義
│       ├── errors/
│       │   └── index.ts
│       └── types/
│           └── index.ts
└── backend.ts               # バックエンド定義
```

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル名 | camelCase | `postService.ts` |
| 関数 | camelCase | `getPostById` |
| 定数 | UPPER_SNAKE_CASE | `TABLE_NAME` |
| 型 | UPPER_SNAKE_CASE | `POST`, `API_RESPONSE` |
| 環境変数 | UPPER_SNAKE_CASE | `POSTS_TABLE_NAME` |
