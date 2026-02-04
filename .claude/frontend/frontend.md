# Frontend Coding Guidelines

フロントエンド開発のコーディングガイドライン。

## 基本原則

### 使用禁止ライブラリ

**【MUST】Amplify UI (`@aws-amplify/ui-react`) は使用しない。**

UI コンポーネントは独自実装または他の UI ライブラリを使用する。
**【MUST】Sassを使用する**

### 関数スタイル

アロー関数を使用する。

```tsx
// Good
const PostCard = ({ post }: PostCardProps) => {
  return <article>{post.title}</article>;
};

const usePost = (id: string) => {
  // ...
};

// Bad
function PostCard({ post }: PostCardProps) {
  return <article>{post.title}</article>;
}
```

### 型定義

TypeScript の `type` を使用して厳密に定義する。`interface` より `type` を優先。

```typescript
// types/index.ts
export type Post = {
  id: string;
  title: string;
  content: string;
  imageKey?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
};

// コンポーネントの Props
export type PostCardProps = {
  post: Post;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};
```

### 文字列定数

UI テキストやエラーメッセージは定数化する。

```typescript
// constants/messages.ts
export const UI_TEXT = {
  LOADING: "読み込み中...",
  ERROR: "エラーが発生しました",
  NO_POSTS: "投稿がありません",
  CONFIRM_DELETE: "本当に削除しますか？",
  SAVE: "保存",
  CANCEL: "キャンセル",
  EDIT: "編集",
  DELETE: "削除",
} as const;

export const VALIDATION_MESSAGES = {
  TITLE_REQUIRED: "タイトルは必須です",
  TITLE_TOO_LONG: "タイトルは200文字以内で入力してください",
  CONTENT_REQUIRED: "本文は必須です",
} as const;

export const API_ENDPOINTS = {
  POSTS: "/posts",
  POST_BY_ID: (id: string) => `/posts/${id}`,
  COMMENTS: (postId: string) => `/posts/${postId}/comments`,
} as const;
```

## コンポーネント設計

### 関数コンポーネント

```tsx
import type { Post } from "@/types";

type PostCardProps = {
  post: Post;
  isEditable?: boolean;
  onEdit?: (id: string) => void;
};

export const PostCard = ({
  post,
  isEditable = false,
  onEdit,
}: PostCardProps) => {
  const handleEdit = () => {
    onEdit?.(post.id);
  };

  return (
    <article className="post-card">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      {isEditable && (
        <button type="button" onClick={handleEdit}>
          編集
        </button>
      )}
    </article>
  );
};
```

### コンパウンドコンポーネント

複雑なコンポーネントは合成パターンを使用する。

```tsx
import { createContext, use, type ReactNode } from "react";

// Context
type DialogContextValue = {
  isOpen: boolean;
  close: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const context = use(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within Dialog.Root");
  }
  return context;
};

// Components
type DialogRootProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const DialogRoot = ({ isOpen, onClose, children }: DialogRootProps) => {
  if (!isOpen) return null;

  return (
    <DialogContext value={{ isOpen, close: onClose }}>
      <div className="dialog-overlay">{children}</div>
    </DialogContext>
  );
};

const DialogContent = ({ children }: { children: ReactNode }) => {
  return <div className="dialog-content">{children}</div>;
};

const DialogClose = ({ children }: { children: ReactNode }) => {
  const { close } = useDialogContext();
  return (
    <button type="button" onClick={close}>
      {children}
    </button>
  );
};

// Export
export const Dialog = {
  Root: DialogRoot,
  Content: DialogContent,
  Close: DialogClose,
};

// Usage
// <Dialog.Root isOpen={isOpen} onClose={handleClose}>
//   <Dialog.Content>
//     <p>内容</p>
//     <Dialog.Close>閉じる</Dialog.Close>
//   </Dialog.Content>
// </Dialog.Root>
```

### 明示的なバリアント

ブールプロップの乱立を避け、明示的なバリアントコンポーネントを作成する。

```tsx
// Bad: ブールプロップが多すぎる
<Button isPrimary isLarge isDisabled isLoading />

// Good: 明示的なバリアント
<Button variant="primary" size="large" disabled loading />

// Better: 用途別コンポーネント
<PrimaryButton size="large" loading />
<SubmitButton loading />
<DeleteButton />
```

### Props 型の明示的定義

**【MUST】以下のルールを遵守する。**

- `React.FC` は使用しない
- 型定義のコメントはプロパティの横に `//` 形式で同じ行に記載
- パフォーマンス最適化が必要な場合のみ `React.memo` で囲う
- 不要なメモ化は避ける（過度な最適化はNG）

```tsx
// Good: React.FC を使わず、コメントはプロパティの横
type PostCardProps = {
  post: Post; // 表示する記事データ
  isEditable?: boolean; // 編集可能かどうか（デフォルト: false）
  onEdit?: (id: string) => void; // 編集ボタンクリック時のコールバック
  onDelete?: (id: string) => void; // 削除ボタンクリック時のコールバック
};

export const PostCard = ({
  post,
  isEditable = false,
  onEdit,
}: PostCardProps) => {
  return <article>{post.title}</article>;
};

// Bad: React.FC を使用
const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return <article>{post.title}</article>;
};

// Bad: コメントが別行
type PostCardProps = {
  // 表示する記事データ
  post: Post;
};
```

### React.memo の使用

パフォーマンス最適化が**明確に必要な場合のみ**使用する。

```tsx
// Good: 再レンダリングが頻繁で最適化が必要な場合
export const ExpensiveList = memo(({ items }: ExpensiveListProps) => {
  return (
    <ul>
      {items.map((item) => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  );
});

// Bad: 不要なメモ化（シンプルなコンポーネント）
export const SimpleText = memo(({ text }: { text: string }) => {
  return <span>{text}</span>;
});
```

### ComponentPropsWithoutRef の活用

ネイティブ HTML 要素を拡張する場合に使用し、型安全性を保ちながら props を継承する。

```tsx
import type { ComponentPropsWithoutRef } from "react";

// ネイティブ button を拡張
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger"; // ボタンのスタイルバリアント
  size?: "small" | "medium" | "large"; // ボタンのサイズ
  loading?: boolean; // ローディング状態
};

export const Button = ({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "読み込み中..." : children}
    </button>
  );
};

// ネイティブ input を拡張
type InputProps = ComponentPropsWithoutRef<"input"> & {
  label?: string; // ラベルテキスト
  error?: string; // エラーメッセージ
};

export const Input = ({ label, error, id, ...props }: InputProps) => {
  return (
    <div className="input-wrapper">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

## 状態管理

### useState

単純な状態管理に使用。

```tsx
import { useState } from "react";

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue((prev) => !prev);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return { value, toggle, setTrue, setFalse };
};
```

### useReducer

複雑な状態遷移に使用。

```tsx
import { useReducer } from "react";

type FormState = {
  title: string;
  content: string;
  isSubmitting: boolean;
  error: string | null;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "RESET" };

const initialState: FormState = {
  title: "",
  content: "",
  isSubmitting: false,
  error: null,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, error: null };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, error: null };
    case "SUBMIT_SUCCESS":
      return initialState;
    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false, error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const usePostForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = (field: keyof FormState, value: string) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const submit = async () => {
    dispatch({ type: "SUBMIT_START" });
    try {
      // API call
      dispatch({ type: "SUBMIT_SUCCESS" });
    } catch (error) {
      dispatch({ type: "SUBMIT_ERROR", error: "エラーが発生しました" });
    }
  };

  return { state, setField, submit };
};
```

### Context API

グローバルな状態共有に使用。Provider と UI を分離する。

```tsx
import { createContext, use, useState, type ReactNode } from "react";
import type { User } from "@/types";

// Context 型定義
type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
};

// Context 作成
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
};

// カスタムフック
export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

## カスタムフック

### 命名規則

**【MUST】`use{HookName}` 形式を使用する。**

```tsx
// Good: use{HookName} 形式
const useAuth = () => {};
const useFormValidation = () => {};
const usePosts = () => {};
const useCorporations = () => {};
const useLocalStorage = () => {};

// Bad: use プレフィックスがない
const auth = () => {};
const getFormValidation = () => {};
```

### データフェッチ

```tsx
import { useState, useEffect } from "react";
import type { Post } from "@/types";
import { API_ENDPOINTS } from "@/constants/messages";

type UsePostsResult = {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const usePosts = (): UsePostsResult => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.POSTS);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, isLoading, error, refetch: fetchPosts };
};
```

### フォームバリデーション

```tsx
import { useState, useCallback } from "react";
import { VALIDATION_MESSAGES } from "@/constants/messages";

type ValidationErrors = Record<string, string>;

type UseFormValidationResult<T> = {
  errors: ValidationErrors;
  validate: (data: T) => boolean;
  clearErrors: () => void;
};

export const usePostFormValidation = (): UseFormValidationResult<{
  title: string;
  content: string;
}> => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback((data: { title: string; content: string }) => {
    const newErrors: ValidationErrors = {};

    if (!data.title.trim()) {
      newErrors.title = VALIDATION_MESSAGES.TITLE_REQUIRED;
    } else if (data.title.length > 200) {
      newErrors.title = VALIDATION_MESSAGES.TITLE_TOO_LONG;
    }

    if (!data.content.trim()) {
      newErrors.content = VALIDATION_MESSAGES.CONTENT_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, clearErrors };
};
```

## イベントハンドラ

### 命名規則

**【MUST】`handle{Action}` 形式を使用する。**

```tsx
// コンポーネント内部のハンドラ: handle{Action} 形式
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = () => {};
const handleUserSelect = () => {};
const handleFormReset = () => {};

// Props として渡すハンドラ: on{Action} 形式
type Props = {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
  onChange: (value: string) => void;
  onUserSelect: (userId: string) => void;
};
```

### 型定義

```tsx
import type { ChangeEvent, FormEvent, MouseEvent } from "react";

const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // submit logic
};

const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
  // click logic
};
```

## エラーハンドリング

### Error Boundary

```tsx
import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### API エラー

```tsx
// errors/api.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// utils/api.ts
export const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
};
```

## ファイル構成

```
/src
├── main.tsx                    # エントリーポイント
├── App.tsx                     # ルートコンポーネント
├── components/
│   ├── ui/                     # 汎用UIコンポーネント
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   └── Button.module.css
│   │   ├── Dialog/
│   │   └── Input/
│   ├── features/               # 機能別コンポーネント
│   │   ├── posts/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   └── PostForm.tsx
│   │   └── comments/
│   └── layouts/                # レイアウトコンポーネント
│       ├── Header.tsx
│       └── MainLayout.tsx
├── pages/                      # ページコンポーネント
│   ├── HomePage.tsx
│   ├── PostDetailPage.tsx
│   └── CreatePostPage.tsx
├── hooks/                      # カスタムフック
│   ├── usePosts.ts
│   ├── useAuth.ts
│   └── useForm.ts
├── contexts/                   # Context Provider
│   └── AuthContext.tsx
├── types/                      # 型定義
│   └── index.ts
├── constants/                  # 定数
│   └── messages.ts
├── utils/                      # ユーティリティ関数
│   ├── api.ts
│   └── format.ts
├── errors/                     # エラークラス
│   └── api.ts
└── styles/                     # スタイルの定義
     ├── foundation/
     │   ├── _base.scss          # html, body の基本設定
     │   ├── _reset.scss         # リセットCSS
     │   └── _variable.scss      # 変数定義（色、フォント、スペーシング）
     ├── utilities/
     │   ├── functions/
     │   │   └── index.scss      # 計算・変換関数
     │   └── mixins/
     │       └── index.scss      # 再利用可能なスタイルパターン
     ├── components/
     │   ├── _button.scss        # ボタンコンポーネント
     │   ├── _card.scss          # カードコンポーネント
     │   └── _form.scss          # フォームコンポーネント
     ├── layouts/
     │   ├── _header.scss        # ヘッダー
     │   ├── _footer.scss        # フッター
     │   └── _sidebar.scss       # サイドバー
     └── app.scss                # メインエントリーポイント
```

## 命名規則

| 対象                   | 規則                  | 例                      |
| ---------------------- | --------------------- | ----------------------- |
| コンポーネントファイル | PascalCase            | `PostCard.tsx`          |
| コンポーネント         | PascalCase            | `PostCard`              |
| フックファイル         | camelCase + use       | `usePosts.ts`           |
| フック                 | camelCase + use       | `usePosts`              |
| ユーティリティファイル | camelCase             | `format.ts`             |
| 関数                   | camelCase             | `formatDate`            |
| 定数                   | UPPER_SNAKE_CASE      | `API_ENDPOINTS`         |
| 型                     | PascalCase            | `Post`, `PostCardProps` |
| CSS モジュール         | PascalCase.module.css | `Button.module.css`     |

## インポート順序

```tsx
// 1. React
import { useState, useEffect } from "react";

// 2. 外部ライブラリ
import { useNavigate } from "react-router-dom";

// 3. 内部モジュール（エイリアス使用）
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils/format";
import type { Post } from "@/types";
import { UI_TEXT } from "@/constants/messages";

// 4. 相対パス（同階層・近い階層のみ）
import { PostCard } from "./PostCard";
```

## React 19 対応

### ref を通常の props として受け取る

```tsx
// forwardRef は不要
type InputProps = {
  ref?: React.Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
};

export const Input = ({ ref, value, onChange }: InputProps) => {
  return (
    <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)} />
  );
};
```

### use() を使用

```tsx
import { use } from "react";

// useContext の代わりに use を使用
const auth = use(AuthContext);

// 条件付きで呼び出し可能
const data = condition ? use(SomeContext) : defaultValue;
```

## ディレクトリ構成

### 全体構成

```
/src
├── main.tsx                      # エントリーポイント
├── App.tsx                       # ルートコンポーネント（ルーティング設定）
├── components/                   # コンポーネント
│   ├── ui/                       # 汎用UIコンポーネント（再利用可能）
│   ├── features/                 # 機能別コンポーネント
│   └── layouts/                  # レイアウトコンポーネント
├── pages/                        # ページコンポーネント
├── hooks/                        # カスタムフック
├── contexts/                     # Context Provider
├── types/                        # 型定義
├── constants/                    # 定数
├── utils/                        # ユーティリティ関数
├── errors/                       # エラークラス
├── services/                     # API 通信層
├── stores/                       # 状態管理（Zustand など）
├── assets/                       # 静的ファイル（画像、フォントなど）
└── styles/                       # グローバルスタイル
```

### components/ui/ - 汎用 UI コンポーネント

**【MUST】再利用可能な UI コンポーネントを配置。機能に依存しない。**

```
components/ui/
├── Button/
│   ├── index.tsx                 # コンポーネント本体
│   ├── Button.module.scss        # スタイル
│   └── Button.test.tsx           # テスト（任意）
├── Input/
│   ├── index.tsx
│   └── Input.module.scss
├── Dialog/
│   ├── index.tsx
│   └── Dialog.module.scss
├── Card/
│   ├── index.tsx
│   └── Card.module.scss
├── Table/
│   ├── index.tsx
│   └── Table.module.scss
├── Spinner/
│   ├── index.tsx
│   └── Spinner.module.scss
└── index.ts                      # バレルエクスポート
```

```tsx
// components/ui/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Dialog } from "./Dialog";
export { Card } from "./Card";
export { Table } from "./Table";
export { Spinner } from "./Spinner";
```

### components/features/ - 機能別コンポーネント

**【MUST】特定の機能に紐づくコンポーネントを配置。**

```
components/features/
├── posts/                        # 記事機能
│   ├── PostCard/
│   │   ├── index.tsx
│   │   └── PostCard.module.scss
│   ├── PostList/
│   │   ├── index.tsx
│   │   └── PostList.module.scss
│   ├── PostForm/
│   │   ├── index.tsx
│   │   └── PostForm.module.scss
│   └── index.ts
├── comments/                     # コメント機能
│   ├── CommentCard/
│   ├── CommentList/
│   ├── CommentForm/
│   └── index.ts
├── auth/                         # 認証機能
│   ├── LoginForm/
│   ├── SignupForm/
│   ├── UserMenu/
│   └── index.ts
└── index.ts
```

### components/layouts/ - レイアウトコンポーネント

```
components/layouts/
├── MainLayout/
│   ├── index.tsx                 # ヘッダー + メイン + フッター
│   └── MainLayout.module.scss
├── Header/
│   ├── index.tsx
│   └── Header.module.scss
├── Footer/
│   ├── index.tsx
│   └── Footer.module.scss
├── Sidebar/
│   ├── index.tsx
│   └── Sidebar.module.scss
└── index.ts
```

### pages/ - ページコンポーネント

**【MUST】ルーティングに対応するページ単位のコンポーネント。**

```
pages/
├── HomePage/
│   └── index.tsx
├── PostListPage/
│   └── index.tsx
├── PostDetailPage/
│   └── index.tsx
├── CreatePostPage/
│   └── index.tsx
├── EditPostPage/
│   └── index.tsx
├── LoginPage/
│   └── index.tsx
├── SignupPage/
│   └── index.tsx
├── NotFoundPage/
│   └── index.tsx
└── index.ts
```

### hooks/ - カスタムフック

```
hooks/
├── useAuth.ts                    # 認証関連
├── usePosts.ts                   # 記事データフェッチ
├── useComments.ts                # コメントデータフェッチ
├── useForm.ts                    # フォーム状態管理
├── useLocalStorage.ts            # ローカルストレージ
├── useMediaQuery.ts              # レスポンシブ対応
├── useDebounce.ts                # デバウンス
└── index.ts
```

### contexts/ - Context Provider

```
contexts/
├── AuthContext.tsx               # 認証コンテキスト
├── ThemeContext.tsx              # テーマコンテキスト
└── index.ts
```

### types/ - 型定義

```
types/
├── index.ts                      # 共通型のエクスポート
├── post.ts                       # 記事関連の型
├── comment.ts                    # コメント関連の型
├── user.ts                       # ユーザー関連の型
└── api.ts                        # API レスポンス型
```

```tsx
// types/post.ts
export type Post = {
  id: string;
  title: string;
  content: string;
  imageKey?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = Omit<
  Post,
  "id" | "authorId" | "createdAt" | "updatedAt"
>;
export type UpdatePostInput = Partial<CreatePostInput>;
```

### constants/ - 定数

```
constants/
├── index.ts                      # 定数のエクスポート
├── messages.ts                   # UI テキスト、エラーメッセージ
├── routes.ts                     # ルートパス定義
└── api.ts                        # API エンドポイント
```

```tsx
// constants/routes.ts
export const ROUTES = {
  HOME: "/",
  POSTS: "/posts",
  POST_DETAIL: (id: string) => `/posts/${id}`,
  POST_CREATE: "/posts/new",
  POST_EDIT: (id: string) => `/posts/${id}/edit`,
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;
```

### utils/ - ユーティリティ関数

```
utils/
├── index.ts
├── format.ts                     # フォーマット関数（日付、数値など）
├── validation.ts                 # バリデーション関数
├── storage.ts                    # ローカルストレージ操作
└── cn.ts                         # クラス名結合（clsx ラッパー）
```

```tsx
// utils/format.ts
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return formatDate(dateString);
};
```

### services/ - API 通信層

```
services/
├── index.ts
├── api.ts                        # API クライアント基盤
├── postService.ts                # 記事 API
├── commentService.ts             # コメント API
└── authService.ts                # 認証 API
```

```tsx
// services/postService.ts
import { fetchApi } from "./api";
import type { Post, CreatePostInput, UpdatePostInput } from "@/types";
import { API_ENDPOINTS } from "@/constants/api";

export const postService = {
  getAll: () => fetchApi<Post[]>(API_ENDPOINTS.POSTS),

  getById: (id: string) => fetchApi<Post>(API_ENDPOINTS.POST_BY_ID(id)),

  create: (data: CreatePostInput) =>
    fetchApi<Post>(API_ENDPOINTS.POSTS, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePostInput) =>
    fetchApi<Post>(API_ENDPOINTS.POST_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(API_ENDPOINTS.POST_BY_ID(id), {
      method: "DELETE",
    }),
};
```

### styles/ - グローバルスタイル

```
styles/
├── app.scss                      # メインエントリーポイント
├── foundation/
│   ├── _base.scss                # html, body の基本設定
│   ├── _reset.scss               # リセット CSS
│   └── _variable.scss            # 変数定義
├── utilities/
│   ├── functions/
│   │   └── index.scss            # 関数
│   └── mixins/
│       └── index.scss            # Mixin
└── vendor/                       # 外部ライブラリのスタイル上書き
    └── _override.scss
```

### assets/ - 静的ファイル

```
assets/
├── images/
│   ├── logo.svg
│   └── placeholder.png
├── fonts/
│   └── NotoSansJP/
└── icons/
    └── sprite.svg
```

### ファイル配置ルール

| 種類                     | 配置場所                 | 例                       |
| ------------------------ | ------------------------ | ------------------------ |
| 再利用可能な UI          | `components/ui/`         | Button, Input, Dialog    |
| 機能固有のコンポーネント | `components/features/`   | PostCard, LoginForm      |
| ページ全体のレイアウト   | `components/layouts/`    | MainLayout, Header       |
| ルート対応のページ       | `pages/`                 | HomePage, PostDetailPage |
| データ取得・状態ロジック | `hooks/`                 | usePosts, useAuth        |
| グローバル状態           | `contexts/` or `stores/` | AuthContext              |
| 型定義                   | `types/`                 | Post, User               |
| 定数                     | `constants/`             | ROUTES, API_ENDPOINTS    |
| ユーティリティ           | `utils/`                 | formatDate, cn           |
| API 通信                 | `services/`              | postService              |

### バレルエクスポート

**【MUST】各ディレクトリに `index.ts` を配置し、エクスポートを集約する。**

```tsx
// components/ui/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Dialog } from "./Dialog";

// 使用側
import { Button, Input, Dialog } from "@/components/ui";
```
