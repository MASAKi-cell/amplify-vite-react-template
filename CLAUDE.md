# Amplify Learning Repository

## 概要

AWS Amplify Gen 2 の学習を目的としたリポジトリ。

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: AWS Amplify Gen 2
- **Authentication**: Amazon Cognito
- **API**: Amazon API Gateway + AWS Lambda
- **Database**: Amazon Aurora Serverless v2
- **Storage**: Amazon S3
- **Hosting**: Amplify Hosting（S3 + CloudFront）

## ユースケース: ブログプラットフォーム

ユーザーが記事を投稿・閲覧できるシンプルなブログアプリケーション。

### 機能要件

1. **ユーザー認証**
   - ユーザー登録・ログイン
   - 著者のみが記事を投稿可能

2. **記事管理**
   - 記事の作成・編集・削除（著者のみ）
   - 記事の一覧表示・詳細表示（全員）
   - 画像のアップロード

3. **コメント機能**
   - 記事へのコメント投稿（認証ユーザー）
   - コメントの表示（全員）

### API エンドポイント

```
POST   /posts              # 記事作成（認証必須）
GET    /posts              # 記事一覧取得
GET    /posts/{id}         # 記事詳細取得
PUT    /posts/{id}         # 記事更新（所有者のみ）
DELETE /posts/{id}         # 記事削除（所有者のみ）

POST   /posts/{id}/comments    # コメント作成（認証必須）
GET    /posts/{id}/comments    # コメント一覧取得
DELETE /comments/{id}          # コメント削除（所有者のみ）
```

### データモデル

```
Post
├── id: string (UUID)
├── title: string (必須)
├── content: string (必須)
├── imageKey: string (S3キー、任意)
├── authorId: string (必須)
├── createdAt: string (ISO 8601)
└── updatedAt: string (ISO 8601)

Comment
├── id: string (UUID)
├── postId: string (必須)
├── content: string (必須)
├── authorId: string (必須)
└── createdAt: string (ISO 8601)
```

### 認可ルール

| 操作   | Post         | Comment      |
| ------ | ------------ | ------------ |
| Create | 認証ユーザー | 認証ユーザー |
| Read   | 全員         | 全員         |
| Update | 所有者のみ   | -            |
| Delete | 所有者のみ   | 所有者のみ   |

### ポイント

- **Auth**: Cognito によるユーザー認証、JWT トークン検証
- **API**: API Gateway + Lambda による REST API 構築
- **Data**: Aurora Serverless v2 によるリレーショナルDB設計、SQL操作
- **Storage**: S3 への画像アップロード
- **Authorization**: Lambda 内での所有者ベースのアクセス制御
- **Hosting**: Amplify Hosting による静的サイト配信（S3 + CloudFront）

## ディレクトリ構成

```
/src
├── App.tsx          # メインアプリケーション
├── main.tsx         # エントリーポイント
├── components/      # React コンポーネント
└── pages/           # ページコンポーネント

/amplify
├── auth/            # 認証設定
├── data/            # Aurora Serverless v2 設定
├── storage/         # S3 設定
├── functions/
│   └── api/         # API Lambda 関数
└── backend.ts       # バックエンド定義
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

| ファイル | 説明 |
| -------- | ---- |
| `.claude/backend/backend.md` | バックエンド（Lambda、DynamoDB、認証）のコーディング規約 |
| `.claude/frontend/frontend.md` | フロントエンド（React、TypeScript）のコーディング規約 |
| `.claude/frontend/scss_guidelines.md` | SCSS/CSS のコーディング規約 |

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# Amplify サンドボックス起動
npx ampx sandbox

# ビルド
npm run build
```
