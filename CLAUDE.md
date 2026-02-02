# Amplify Learning Repository

## 概要

AWS Amplify Gen 2 の学習を目的としたリポジトリです。

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: AWS Amplify Gen 2
- **API**: REST API (API Gateway + Lambda)
- **Database**: DynamoDB
- **Authentication**: Amazon Cognito
- **Storage**: Amazon S3

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

| 操作 | Post | Comment |
|------|------|---------|
| Create | 認証ユーザー | 認証ユーザー |
| Read | 全員 | 全員 |
| Update | 所有者のみ | - |
| Delete | 所有者のみ | 所有者のみ |

### 学習ポイント

- **Auth**: Cognito によるユーザー認証、JWT トークン検証
- **API**: API Gateway + Lambda による REST API 構築
- **Data**: DynamoDB テーブル設計、CRUD 操作
- **Storage**: S3 への画像アップロード
- **Authorization**: Lambda 内での所有者ベースのアクセス制御

## ディレクトリ構成

```
/src
├── App.tsx          # メインアプリケーション
├── main.tsx         # エントリーポイント
├── components/      # React コンポーネント
└── pages/           # ページコンポーネント

/amplify
├── auth/            # 認証設定
├── data/            # DynamoDB テーブル定義
├── storage/         # S3 設定
├── functions/
│   └── api/         # API Lambda 関数
└── backend.ts       # バックエンド定義
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# Amplify サンドボックス起動
npx ampx sandbox

# ビルド
npm run build
```
