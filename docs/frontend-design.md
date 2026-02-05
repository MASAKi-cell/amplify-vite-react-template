# 汎用マスタ管理画面 フロントエンド設計書

## 概要

AWS Amplify Gen 2を使った学習用リポジトリのフロントエンド設計書。
ブログプラットフォームから**汎用マスタ管理画面**に変更。

## 技術スタック

- React 18 + TypeScript + Vite
- SCSS + CSS Modules（*.module.scss）
- React Router v6
- AWS Amplify（Cognito認証、AppSync GraphQL、S3）
- xlsx（Excelエクスポート/インポート）

---

## 1. 画面一覧

| 画面ID | 画面名 | パス | 認証 |
|--------|--------|------|------|
| LOGIN | ログイン | `/login` | 不要 |
| DASHBOARD | ダッシュボード | `/` | 必須 |
| PRODUCT_LIST | 商品一覧 | `/products` | 必須 |
| PRODUCT_FORM | 商品登録/編集 | `/products/new`, `/products/:id/edit` | 必須 |
| CATEGORY_LIST | カテゴリ一覧 | `/categories` | 必須 |
| CATEGORY_FORM | カテゴリ登録/編集 | `/categories/new`, `/categories/:id/edit` | 必須 |
| USER_LIST | ユーザー一覧 | `/users` | 必須 |
| USER_FORM | ユーザー登録/編集 | `/users/new`, `/users/:id/edit` | 必須 |
| IMPORT | 一括登録 | `/import` | 必須 |

---

## 2. ディレクトリ構成

```
/src
├── main.tsx
├── App.tsx
├── components/
│   ├── ui/                    # 汎用UIコンポーネント
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Table/             # コンパウンドコンポーネント
│   │   ├── Pagination/
│   │   ├── Modal/
│   │   ├── FileUpload/
│   │   ├── ImageUpload/
│   │   └── SearchInput/
│   ├── features/              # 機能別コンポーネント
│   │   ├── auth/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── users/
│   │   ├── import/
│   │   └── export/
│   └── layouts/               # レイアウト
│       ├── MainLayout/
│       ├── AuthLayout/
│       ├── Header/
│       ├── Sidebar/
│       └── ContentArea/
├── pages/
│   ├── LoginPage/
│   ├── DashboardPage/
│   ├── products/
│   ├── categories/
│   ├── users/
│   └── ImportPage/
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useCategories.ts
│   ├── useUsers.ts
│   ├── useTable.ts
│   ├── useForm.ts
│   ├── useImageUpload.ts
│   ├── useExport.ts
│   ├── useImport.ts
│   └── useMediaQuery.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── types/
│   ├── product.ts
│   ├── category.ts
│   ├── user.ts
│   ├── table.ts
│   └── api.ts
├── constants/
│   ├── routes.ts
│   └── messages.ts
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   └── excel.ts
├── services/
│   ├── graphql/
│   │   ├── client.ts
│   │   ├── queries/
│   │   └── mutations/
│   ├── productService.ts
│   ├── categoryService.ts
│   ├── userService.ts
│   └── storageService.ts
└── styles/
    ├── app.scss
    ├── foundation/
    │   ├── _base.scss
    │   ├── _reset.scss
    │   └── _variable.scss
    └── utilities/
        └── mixins/
```

---

## 3. データモデル（型定義）

### 商品マスタ
```typescript
type Product = {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageKey?: string;
  status: "active" | "inactive" | "discontinued";
  createdAt: string;
  updatedAt: string;
};
```

### カテゴリマスタ
```typescript
type Category = {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
```

### 管理者ユーザー
```typescript
type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "operator";
  status: "active" | "inactive" | "pending";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 4. レスポンシブ設計

### ブレークポイント
| 名前 | 幅 | デバイス |
|------|-----|---------|
| xl | 1280px | デスクトップ大 |
| lg | 1024px | デスクトップ標準 |
| md | 768px | タブレット |
| sm | 640px | モバイル |

### レイアウト対応

| 画面幅 | ナビゲーション | コンテンツ |
|--------|--------------|-----------|
| >= 1024px | 左サイドバー | 2カラム可 |
| 768px - 1023px | 上部（ハンバーガー） | 1カラム |
| < 768px | 上部（ハンバーガー） | 1カラム |

---

## 5. 主要機能

### 5.1 一覧画面の共通機能
- データテーブル表示
- ソート（カラムクリック）
- ページネーション（表示件数選択可）
- キーワード検索（デバウンス）
- フィルター
- 行選択（単一/複数）
- **Excelエクスポート**

### 5.2 登録/編集画面の共通機能
- フォーム入力
- バリデーション
- 画像アップロード（S3連携）
- 保存/キャンセル

### 5.3 一括操作
- CSV/Excelファイルアップロード
- プレビュー表示
- バリデーション結果表示
- 一括登録実行
- 一括削除（選択行）

---

## 6. GraphQL API

### Queries
```graphql
# 商品
listProducts(filter: ProductFilter, limit: Int, nextToken: String): ProductConnection
getProduct(id: ID!): Product

# カテゴリ
listCategories(filter: CategoryFilter, limit: Int, nextToken: String): CategoryConnection
getCategory(id: ID!): Category

# ユーザー
listUsers(filter: UserFilter, limit: Int, nextToken: String): UserConnection
getUser(id: ID!): AdminUser
```

### Mutations
```graphql
# 商品
createProduct(input: CreateProductInput!): Product
updateProduct(input: UpdateProductInput!): Product
deleteProduct(id: ID!): Product
batchCreateProducts(input: [CreateProductInput!]!): [Product]
batchDeleteProducts(ids: [ID!]!): [Product]

# カテゴリ
createCategory(input: CreateCategoryInput!): Category
updateCategory(input: UpdateCategoryInput!): Category
deleteCategory(id: ID!): Category

# ユーザー
createUser(input: CreateUserInput!): AdminUser
updateUser(input: UpdateUserInput!): AdminUser
deleteUser(id: ID!): AdminUser
```

---

## 7. 認可ルール

| 操作 | Product | Category | AdminUser |
|------|---------|----------|-----------|
| Create | admin, manager | admin, manager | admin |
| Read | 全ロール | 全ロール | 全ロール |
| Update | admin, manager | admin, manager | admin |
| Delete | admin | admin | admin |

---

## 8. コンポーネント設計

### 8.1 汎用UIコンポーネント

#### Button
```typescript
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};
```

#### Input
```typescript
type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
};
```

#### Select
```typescript
type SelectProps<T> = {
  options: Array<{ value: T; label: string }>;
  label?: string;
  error?: string;
  placeholder?: string;
};
```

#### Table（コンパウンドコンポーネント）
```typescript
// 使用例
<Table data={products} onSort={handleSort}>
  <Table.Header>
    <Table.Column field="code" sortable>商品コード</Table.Column>
    <Table.Column field="name" sortable>商品名</Table.Column>
    <Table.Column field="price" sortable align="right">価格</Table.Column>
    <Table.Column field="status">ステータス</Table.Column>
    <Table.Column>操作</Table.Column>
  </Table.Header>
  <Table.Body>
    {(row) => (
      <Table.Row key={row.id} selected={selectedIds.includes(row.id)}>
        <Table.Cell>{row.code}</Table.Cell>
        <Table.Cell>{row.name}</Table.Cell>
        <Table.Cell align="right">{formatPrice(row.price)}</Table.Cell>
        <Table.Cell><StatusBadge status={row.status} /></Table.Cell>
        <Table.Cell>
          <ActionButtons onEdit={() => handleEdit(row.id)} onDelete={() => handleDelete(row.id)} />
        </Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
</Table>
```

#### Modal
```typescript
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "small" | "medium" | "large";
};
```

### 8.2 レイアウトコンポーネント

#### MainLayout
- Header（ユーザーメニュー、通知）
- Sidebar（ナビゲーション）
- ContentArea（メインコンテンツ）

#### AuthLayout
- ログイン画面専用のシンプルなレイアウト

---

## 9. カスタムフック

### useTable
```typescript
type UseTableOptions<T> = {
  data: T[];
  initialSort?: { field: keyof T; direction: "asc" | "desc" };
  pageSize?: number;
};

type UseTableReturn<T> = {
  displayData: T[];
  sortConfig: SortConfig<T>;
  pagination: PaginationState;
  selectedIds: string[];
  handleSort: (field: keyof T) => void;
  handlePageChange: (page: number) => void;
  handleSelect: (id: string) => void;
  handleSelectAll: () => void;
};
```

### useForm
```typescript
type UseFormOptions<T> = {
  initialValues: T;
  validate: (values: T) => ValidationErrors;
  onSubmit: (values: T) => Promise<void>;
};

type UseFormReturn<T> = {
  values: T;
  errors: ValidationErrors;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: unknown) => void;
  handleSubmit: (e: FormEvent) => void;
  reset: () => void;
};
```

### useExport
```typescript
type UseExportReturn<T> = {
  exportToExcel: (data: T[], filename: string) => void;
  isExporting: boolean;
};
```

### useImport
```typescript
type UseImportReturn<T> = {
  importFromFile: (file: File) => Promise<T[]>;
  previewData: T[];
  validationErrors: ImportError[];
  isImporting: boolean;
};
```

---

## 10. 実装優先順位

### Phase 1: 基盤構築
1. スタイル基盤（SCSS変数、リセット、Mixin）
2. 型定義
3. 定数ファイル
4. AuthContext
5. 基本UIコンポーネント（Button, Input, Select）

### Phase 2: レイアウト・ナビゲーション
1. MainLayout, AuthLayout
2. Header, Sidebar
3. ルーティング設定
4. 認証ガード

### Phase 3: 一覧画面
1. Table コンポーネント
2. Pagination コンポーネント
3. SearchInput コンポーネント
4. useTable フック
5. 商品一覧ページ

### Phase 4: 登録/編集画面
1. useForm フック
2. ImageUpload コンポーネント
3. Modal コンポーネント
4. 商品登録/編集ページ

### Phase 5: Excel連携
1. useExport フック
2. useImport フック
3. FileUpload コンポーネント
4. 一括登録ページ

### Phase 6: その他マスタ
1. カテゴリ一覧/登録/編集
2. ユーザー一覧/登録/編集
3. ダッシュボード

---

## 11. 検証方法

1. `npm run dev` でローカル開発サーバー起動
2. 各画面の表示確認
3. CRUD操作の動作確認
4. レスポンシブ表示確認（DevTools）
5. Excel エクスポート/インポート動作確認
