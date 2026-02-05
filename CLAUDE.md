# Amplify Learning Repository

## 概要

AWS Amplify Gen 2 の学習を目的としたリポジトリ。

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: AWS Amplify Gen 2
- **Hosting**: Amplify Hosting（S3 + CloudFront）
- **Authentication**: Amazon Cognito（認証・未認証ユーザー対応）
- **API**: AWS AppSync (GraphQL) + AWS Lambda
- **Database**: Amazon Aurora Serverless v2
- **Storage**: Amazon S3
- **Secrets**: AWS Secrets Manager（DB認証情報）

## ユースケース: 汎用マスタ管理画面

商品・カテゴリ・ユーザーなどのマスタデータを管理する管理画面アプリケーション。

### 機能要件

1. **ユーザー認証**
   - 管理者ログイン（Cognito）
   - ロールベースアクセス制御（admin / manager / operator）

2. **商品マスタ管理**
   - 商品の一覧表示・検索・ソート・ページネーション
   - 商品の登録・編集・削除
   - 商品画像のアップロード（S3）
   - Excel エクスポート/インポート

3. **カテゴリマスタ管理**
   - カテゴリの一覧表示・検索
   - カテゴリの登録・編集・削除
   - 階層構造のサポート（parentId）

4. **ユーザー管理**
   - 管理者ユーザーの一覧表示
   - ユーザーの登録・編集・削除（admin のみ）

5. **一括操作**
   - Excel/CSV ファイルからの一括登録
   - 選択行の一括削除

### GraphQL API

```graphql
# Queries
listProducts(filter: ProductFilter, limit: Int, nextToken: String): ProductConnection
getProduct(id: ID!): Product
listCategories(filter: CategoryFilter, limit: Int, nextToken: String): CategoryConnection
getCategory(id: ID!): Category
listUsers(filter: UserFilter, limit: Int, nextToken: String): UserConnection
getUser(id: ID!): AdminUser

# Mutations
createProduct(input: CreateProductInput!): Product
updateProduct(input: UpdateProductInput!): Product
deleteProduct(id: ID!): Product
batchCreateProducts(input: [CreateProductInput!]!): [Product]
batchDeleteProducts(ids: [ID!]!): [Product]
createCategory(input: CreateCategoryInput!): Category
updateCategory(input: UpdateCategoryInput!): Category
deleteCategory(id: ID!): Category
createUser(input: CreateUserInput!): AdminUser
updateUser(input: UpdateUserInput!): AdminUser
deleteUser(id: ID!): AdminUser
```

### データモデル

```
Product（商品マスタ）
├── id: string (UUID)
├── code: string (商品コード、必須、ユニーク)
├── name: string (商品名、必須)
├── description: string (説明、任意)
├── price: number (価格、必須)
├── categoryId: string (カテゴリID、必須)
├── imageKey: string (S3キー、任意)
├── status: "active" | "inactive" | "discontinued"
├── createdAt: string (ISO 8601)
└── updatedAt: string (ISO 8601)

Category（カテゴリマスタ）
├── id: string (UUID)
├── code: string (カテゴリコード、必須、ユニーク)
├── name: string (カテゴリ名、必須)
├── description: string (説明、任意)
├── parentId: string (親カテゴリID、任意)
├── sortOrder: number (表示順)
├── status: "active" | "inactive"
├── createdAt: string (ISO 8601)
└── updatedAt: string (ISO 8601)

AdminUser（管理者ユーザー）
├── id: string (UUID)
├── email: string (メールアドレス、必須、ユニーク)
├── name: string (氏名、必須)
├── role: "admin" | "manager" | "operator"
├── status: "active" | "inactive" | "pending"
├── lastLoginAt: string (最終ログイン日時、任意)
├── createdAt: string (ISO 8601)
└── updatedAt: string (ISO 8601)
```

### 認可ルール

| 操作   | Product       | Category      | AdminUser |
| ------ | ------------- | ------------- | --------- |
| Create | admin/manager | admin/manager | admin     |
| Read   | 全ロール      | 全ロール      | 全ロール  |
| Update | admin/manager | admin/manager | admin     |
| Delete | admin         | admin         | admin     |

### ポイント

- **Auth**: Cognito によるユーザー認証 + ロールベースアクセス制御
- **API**: AppSync (GraphQL) + Lambda によるAPI構築
- **Data**: Aurora Serverless v2 によるリレーショナルDB設計、SQL操作
- **Storage**: S3 への画像アップロード
- **Authorization**: Lambda 内でのロールベースのアクセス制御
- **Hosting**: Amplify Hosting による静的サイト配信（S3 + CloudFront）
- **Secrets**: Secrets Manager によるDB認証情報の安全な管理
- **Excel連携**: xlsx ライブラリによるエクスポート/インポート機能

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Amplify Hosting                          │
│                  (S3 + CloudFront)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AppSync                                │
│                     (GraphQL)                               │
│              [認証: Cognito User Pools]                     │
└─────────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌──────────────────┐                 ┌──────────────────┐
│     Lambda       │                 │       S3         │
│   (Resolver)     │                 │    (Storage)     │
│ [VPC・Private    │                 │   画像保存       │
│   Subnet]        │                 └──────────────────┘
└──────────────────┘
          │
          ▼
┌──────────────────┐
│    RDS Proxy     │
│ [コネクション    │
│   プーリング]    │
└──────────────────┘
          │
          ▼
┌──────────────────┐      ┌──────────────────┐
│ Aurora Serverless│◄─────│ Secrets Manager  │
│       v2         │      │  (DB認証情報)    │
│ [Private Subnet] │      └──────────────────┘
└──────────────────┘
```

### VPC構成

- **Lambda**: プライベートサブネットに配置、RDS Proxyエンドポイント経由でDB接続
- **Aurora**: プライベートサブネットに配置、インターネットアクセス不可
- **RDS Proxy**: Lambdaからのコネクションをプーリング、高トラフィック時のDB負荷軽減
- **NATゲートウェイ**: 不要（Lambda から外部API呼び出しなし）

## ディレクトリ構成

```
/src
├── main.tsx                 # エントリーポイント
├── App.tsx                  # ルートコンポーネント（ルーティング設定）
├── components/
│   ├── ui/                  # 汎用UIコンポーネント（Button, Input, Table等）
│   ├── features/            # 機能別コンポーネント（products, categories, users等）
│   └── layouts/             # レイアウト（MainLayout, Header, Sidebar等）
├── pages/                   # ページコンポーネント
├── hooks/                   # カスタムフック
├── contexts/                # Context Provider
├── types/                   # 型定義
├── constants/               # 定数
├── utils/                   # ユーティリティ関数
├── services/                # API通信層
└── styles/                  # グローバルスタイル（SCSS）

/amplify
├── auth/            # Cognito 認証設定
├── data/            # AppSync + Aurora 設定
├── storage/         # S3 設定
├── functions/
│   └── api/         # GraphQL Resolver Lambda 関数
└── backend.ts       # バックエンド定義

/docs
└── frontend-design.md  # フロントエンド設計書
```

## AI エージェントスキル

`.agents/skills/` 配下に React 開発のベストプラクティスを定義したスキルが追加されています。

| スキル名                      | 説明                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| `vercel-composition-patterns` | コンパウンドコンポーネント、ステート管理、コンポジションパターン |
| `vercel-react-best-practices` | React のベストプラクティス全般                                   |
| `vercel-react-native-skills`  | React Native 向けのスキル                                        |

これらのスキルは Claude Code などの AI エージェントがコードを生成・リファクタリングする際に参照されます。

## コーディングガイドライン

`.claude/` 配下にコーディングガイドラインを定義しています。

| ファイル                              | 説明                                                     |
| ------------------------------------- | -------------------------------------------------------- |
| `.claude/backend/backend.md`          | バックエンド（Lambda、Aurora、認証）のコーディング規約 |
| `.claude/frontend/frontend.md`        | フロントエンド（React、TypeScript）のコーディング規約    |
| `.claude/frontend/scss_guidelines.md` | SCSS/CSS のコーディング規約                              |

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# Amplify サンドボックス起動
npx ampx sandbox

# ビルド
npm run build
```
