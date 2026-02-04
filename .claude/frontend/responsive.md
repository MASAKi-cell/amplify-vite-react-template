# Responsive Design Guidelines

レスポンシブデザインのコーディングガイドライン。

## 基本方針

**【MUST】デスクトップファースト** で設計する。`max-width` でブレークポイントを定義。

**【MUST】コンポーネントは `@container`（コンテナクエリ）をベース** にレスポンシブ対応する。

### @media と @container の使い分け

| 用途 | 使用するクエリ |
|------|---------------|
| ページレイアウト（Container幅、Header、Sidebarの表示切替） | `@media` |
| コンポーネント内部（カード内のレイアウト、ボタンサイズなど） | `@container` |

## ブレークポイント

| 変数名 | max-width | 対象 |
|--------|-----------|------|
| `$bp-xl` | 1280px | 大型デスクトップ |
| `$bp-lg` | 1024px | デスクトップ / 小型ノート |
| `$bp-md` | 768px | タブレット |
| `$bp-sm` | 640px | スマートフォン |

## Container

- `max-width: 1280px`
- `margin: 0 auto` で中央揃え
- 左右 padding: デスクトップ 24px / モバイル（sm以下）16px

## Mixin / Function

`styles/utilities/` フォルダに定義する。

### ブレークポイント変数

```scss
// styles/utilities/_variables.scss

$bp-xl: 1280px;
$bp-lg: 1024px;
$bp-md: 768px;
$bp-sm: 640px;
```

### メディアクエリ Mixin

```scss
// styles/utilities/mixins/_media.scss

@mixin media-xl {
  @media (max-width: $bp-xl) {
    @content;
  }
}

@mixin media-lg {
  @media (max-width: $bp-lg) {
    @content;
  }
}

@mixin media-md {
  @media (max-width: $bp-md) {
    @content;
  }
}

@mixin media-sm {
  @media (max-width: $bp-sm) {
    @content;
  }
}
```

### コンテナクエリ Mixin

```scss
// styles/utilities/mixins/_container.scss

@mixin container-xl {
  @container (max-width: #{$bp-xl}) {
    @content;
  }
}

@mixin container-lg {
  @container (max-width: #{$bp-lg}) {
    @content;
  }
}

@mixin container-md {
  @container (max-width: #{$bp-md}) {
    @content;
  }
}

@mixin container-sm {
  @container (max-width: #{$bp-sm}) {
    @content;
  }
}

// 名前付きコンテナ用
@mixin container-xl-named($name) {
  @container #{$name} (max-width: #{$bp-xl}) {
    @content;
  }
}
```

## コード例

### ページレイアウト（@media 使用）

```scss
// components/layouts/MainLayout/MainLayout.module.scss

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;

  @include media-sm {
    padding: 0 16px;
  }
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;

  @include media-lg {
    grid-template-columns: 200px 1fr;
    gap: 16px;
  }

  @include media-md {
    grid-template-columns: 1fr;
  }
}

.sidebar {
  @include media-md {
    display: none;
  }
}
```

### コンポーネント（@container 使用）

```scss
// components/features/posts/PostCard/PostCard.module.scss

.wrapper {
  container-type: inline-size;
}

.card {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  padding: 24px;

  @include container-md {
    grid-template-columns: 150px 1fr;
    gap: 12px;
    padding: 16px;
  }

  @include container-sm {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
}

.image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  width: 100%;
}

.title {
  font-size: 1.25rem;

  @include container-sm {
    font-size: 1rem;
  }
}
```

```tsx
// components/features/posts/PostCard/index.tsx

import styles from "./PostCard.module.scss";

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className={styles.wrapper}>
      <article className={styles.card}>
        <img className={styles.image} src={post.imageUrl} alt="" />
        <div className={styles.content}>
          <h2 className={styles.title}>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      </article>
    </div>
  );
};
```

## フォントサイズ

`clamp()` を使用して滑らかにスケーリングする。

```scss
// styles/utilities/functions/_typography.scss

@function fluid-font($min, $max, $min-vw: 640px, $max-vw: 1280px) {
  @return clamp(
    #{$min},
    calc(#{$min} + (#{strip-unit($max)} - #{strip-unit($min)}) * ((100vw - #{$min-vw}) / (#{strip-unit($max-vw)} - #{strip-unit($min-vw)}))),
    #{$max}
  );
}

@function strip-unit($value) {
  @return $value / ($value * 0 + 1);
}
```

```scss
// 使用例
.heading {
  font-size: fluid-font(1.5rem, 2.5rem);
}

// または clamp() を直接使用
.title {
  font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem);
}
```

## グリッドシステム

### 使い分け

| 用途 | 推奨 |
|------|------|
| 2次元レイアウト（行と列の制御） | CSS Grid |
| 1次元レイアウト（横並び、縦並び） | Flexbox |
| 要素の中央揃え | Flexbox または Grid |

### CSS Grid（ページレイアウト、カードグリッド）

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @include media-lg {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @include media-sm {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

// auto-fill で自動調整
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
```

### Flexbox（コンポーネント内部）

```scss
.flex-row {
  display: flex;
  align-items: center;
  gap: 12px;

  @include container-sm {
    flex-direction: column;
    align-items: flex-start;
  }
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## 画像のレスポンシブ対応

```scss
.responsive-image {
  max-width: 100%;
  height: auto;
}

.aspect-image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  width: 100%;
}
```

## ファイル構成

```
styles/
├── utilities/
│   ├── _variables.scss       # ブレークポイント変数
│   ├── mixins/
│   │   ├── _media.scss       # @media mixin
│   │   ├── _container.scss   # @container mixin
│   │   └── index.scss        # mixin エクスポート
│   └── functions/
│       ├── _typography.scss  # fluid-font 関数
│       └── index.scss        # function エクスポート
└── ...
```
