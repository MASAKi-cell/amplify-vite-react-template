# SCSS Coding Guidelines

SCSS/CSS 開発のコーディングガイドライン。

## 基本原則

### フォントサイズの基準設定

**【MUST】`1rem = 10px` となるよう設定し、font-size は必ず `rem` 単位を使用する。**

```scss
// foundation/_base.scss
html {
  font-size: 62.5%; // 16px * 62.5% = 10px = 1rem
}

body {
  font-size: 1.6rem; // 16px
  line-height: 1.5;
}

// Good: rem を使用
.title {
  font-size: 2.4rem; // 24px
}

.caption {
  font-size: 1.2rem; // 12px
}

// Bad: px を使用
.title {
  font-size: 24px;
}
```

### 小数点の処理

**【MUST】border など小数点でピクセルズレを起こす可能性のある値は繰り下げる。**

```scss
// Good: 整数値または繰り下げ
.card {
  border: 1px solid $borderColor;
  border-radius: 4px;
}

// Bad: 小数点でズレが発生する可能性
.card {
  border: 0.5px solid $borderColor;
  border-radius: 3.5px;
}
```

### 余白の倍数ルール

**【MUST】margin・padding は 4 の倍数で指定する。**

```scss
// foundation/_variable.scss
$spacingBase: 4px;
$spacing4: 4px;
$spacing8: 8px;
$spacing12: 12px;
$spacing16: 16px;
$spacing20: 20px;
$spacing24: 24px;
$spacing32: 32px;
$spacing40: 40px;
$spacing48: 48px;

// Good: 4の倍数
.card {
  padding: $spacing16; // 16px
  margin-bottom: $spacing24; // 24px
}

// Bad: 4の倍数でない
.card {
  padding: 15px;
  margin-bottom: 25px;
}
```

### !important の使用禁止

**【MUST】`!important` の濫用は禁止。使用する場合はコメントで理由を明記。**

```scss
// Bad: 不必要な !important
.button {
  color: red !important;
}

// 許容: 外部ライブラリの上書きなど、やむを得ない場合のみ
.externalLibraryOverride {
  // 外部ライブラリのスタイルを上書きするため !important が必要
  display: flex !important;
}
```

## ファイル構成

```
styles/
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

### Partial ファイルの使用

**【MUST】`_` で始まるファイルを作成し、`app.scss` でインポートする。**

```scss
// app.scss
// Foundation
@use "foundation/variable" as *;
@use "foundation/reset";
@use "foundation/base";

// Utilities
@use "utilities/functions";
@use "utilities/mixins" as *;

// Components
@use "components/button";
@use "components/card";
@use "components/form";

// Layouts
@use "layouts/header";
@use "layouts/footer";
@use "layouts/sidebar";
```

## 変数管理

### 変数定義

**【MUST】`_variable.scss` で色、フォント、スペーシングなどを一元管理し、マジックナンバーを避ける。**

**【MUST】変数名は camelCase で命名する。**

```scss
// foundation/_variable.scss

// ===================
// Colors
// ===================
$colorPrimary: #3b82f6;
$colorPrimaryHover: #2563eb;
$colorPrimaryActive: #1d4ed8;

$colorSecondary: #64748b;
$colorSecondaryHover: #475569;

$colorSuccess: #22c55e;
$colorWarning: #f59e0b;
$colorError: #ef4444;

$colorTextPrimary: #1e293b;
$colorTextSecondary: #64748b;
$colorTextDisabled: #94a3b8;

$colorBackground: #ffffff;
$colorBackgroundSecondary: #f8fafc;
$colorBackgroundHover: #f1f5f9;

$colorBorder: #e2e8f0;
$colorBorderFocus: #3b82f6;

// ===================
// Typography
// ===================
$fontFamilyBase: "Noto Sans JP", "Hiragino Sans", sans-serif;
$fontFamilyMono: "Fira Code", "Consolas", monospace;

$fontSizeXs: 1.0rem;   // 10px
$fontSizeSm: 1.2rem;   // 12px
$fontSizeBase: 1.4rem; // 14px
$fontSizeMd: 1.6rem;   // 16px
$fontSizeLg: 1.8rem;   // 18px
$fontSizeXl: 2.0rem;   // 20px
$fontSize2xl: 2.4rem;  // 24px
$fontSize3xl: 3.0rem;  // 30px

$fontWeightNormal: 400;
$fontWeightMedium: 500;
$fontWeightBold: 700;

$lineHeightTight: 1.25;
$lineHeightBase: 1.5;
$lineHeightRelaxed: 1.75;

// ===================
// Spacing (4の倍数)
// ===================
$spacing0: 0;
$spacing4: 4px;
$spacing8: 8px;
$spacing12: 12px;
$spacing16: 16px;
$spacing20: 20px;
$spacing24: 24px;
$spacing32: 32px;
$spacing40: 40px;
$spacing48: 48px;
$spacing56: 56px;
$spacing64: 64px;

// ===================
// Border Radius
// ===================
$borderRadiusSm: 2px;
$borderRadiusBase: 4px;
$borderRadiusMd: 6px;
$borderRadiusLg: 8px;
$borderRadiusXl: 12px;
$borderRadiusFull: 9999px;

// ===================
// Shadows
// ===================
$shadowSm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadowBase: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
$shadowMd: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
$shadowLg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

// ===================
// Breakpoints
// ===================
$breakpointSm: 640px;
$breakpointMd: 768px;
$breakpointLg: 1024px;
$breakpointXl: 1280px;
$breakpoint2xl: 1536px;

// ===================
// Z-Index
// ===================
$zIndexDropdown: 100;
$zIndexSticky: 200;
$zIndexFixed: 300;
$zIndexModalBackdrop: 400;
$zIndexModal: 500;
$zIndexPopover: 600;
$zIndexTooltip: 700;

// ===================
// Transitions
// ===================
$transitionDurationFast: 150ms;
$transitionDurationBase: 200ms;
$transitionDurationSlow: 300ms;
$transitionEasing: cubic-bezier(0.4, 0, 0.2, 1);
```

## Mixin

### 繰り返し使うスタイルパターンの Mixin 化

```scss
// utilities/mixins/index.scss

// ===================
// レスポンシブ
// ===================
@mixin mediaUp($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin mediaDown($breakpoint) {
  @media (max-width: $breakpoint - 1px) {
    @content;
  }
}

// 使用例
.container {
  padding: $spacing16;

  @include mediaUp($breakpointMd) {
    padding: $spacing24;
  }

  @include mediaUp($breakpointLg) {
    padding: $spacing32;
  }
}

// ===================
// Flexbox
// ===================
@mixin flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flexBetween {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flexColumn {
  display: flex;
  flex-direction: column;
}

// ===================
// Typography
// ===================
@mixin textEllipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin textClamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ===================
// Visual
// ===================
@mixin visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// ===================
// Transitions
// ===================
@mixin transition($properties: all) {
  transition-property: $properties;
  transition-duration: $transitionDurationBase;
  transition-timing-function: $transitionEasing;
}

// ===================
// Focus Ring
// ===================
@mixin focusRing {
  outline: 2px solid $colorBorderFocus;
  outline-offset: 2px;
}

@mixin focusRingInset {
  outline: 2px solid $colorBorderFocus;
  outline-offset: -2px;
}
```

## Function

### 計算処理や値の変換の Function 化

```scss
// utilities/functions/index.scss

// ===================
// px to rem 変換
// ===================
@function toRem($px) {
  @return calc($px / 10) * 1rem;
}

// 使用例
.element {
  font-size: toRem(18); // 1.8rem
  padding: toRem(16);   // 1.6rem
}

// ===================
// 色の透明度調整
// ===================
@function alpha($color, $opacity) {
  @return rgba($color, $opacity);
}

// 使用例
.overlay {
  background-color: alpha($colorTextPrimary, 0.5);
}

// ===================
// スペーシング計算
// ===================
@function spacing($multiplier) {
  @return $spacing4 * $multiplier;
}

// 使用例
.element {
  padding: spacing(4);  // 16px
  margin: spacing(6);   // 24px
}

// ===================
// z-index 取得
// ===================
$zIndexMap: (
  "dropdown": 100,
  "sticky": 200,
  "fixed": 300,
  "modalBackdrop": 400,
  "modal": 500,
  "popover": 600,
  "tooltip": 700,
);

@function zIndex($key) {
  @return map-get($zIndexMap, $key);
}

// 使用例
.modal {
  z-index: zIndex("modal"); // 500
}
```

## BEM 記法

### Block Element Modifier で命名

**【MUST】BEM 記法に従ってクラス名を命名する。**

```scss
// Block: 独立したコンポーネント
// Element: Block の一部（__で接続）
// Modifier: 状態やバリエーション（--で接続）

// Good: BEM 記法
.card {
  background-color: $colorBackground;
  border-radius: $borderRadiusLg;
  box-shadow: $shadowBase;

  // Element
  &__header {
    padding: $spacing16;
    border-bottom: 1px solid $colorBorder;
  }

  &__title {
    font-size: $fontSizeLg;
    font-weight: $fontWeightBold;
  }

  &__body {
    padding: $spacing16;
  }

  &__footer {
    padding: $spacing16;
    border-top: 1px solid $colorBorder;
  }

  // Modifier
  &--highlighted {
    border: 2px solid $colorPrimary;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// Bad: BEM に従っていない
.card {
  .header {
    // ...
  }
}

.card-header {
  // ...
}

.cardHeader {
  // ...
}
```

### BEM + State クラス

状態を表すクラスは `is-` または `has-` プレフィックスを使用。

```scss
.button {
  @include transition(background-color, color);

  &.is-loading {
    pointer-events: none;
    opacity: 0.7;
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.has-icon {
    @include flexCenter;
    gap: $spacing8;
  }
}
```

## CSS Modules

### React コンポーネントでの使用

```scss
// Button.module.scss
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing8 $spacing16;
  font-size: $fontSizeBase;
  font-weight: $fontWeightMedium;
  border: none;
  border-radius: $borderRadiusBase;
  cursor: pointer;
  @include transition(background-color, color, box-shadow);

  &:focus-visible {
    @include focusRing;
  }
}

.primary {
  background-color: $colorPrimary;
  color: $colorBackground;

  &:hover {
    background-color: $colorPrimaryHover;
  }

  &:active {
    background-color: $colorPrimaryActive;
  }
}

.secondary {
  background-color: $colorBackgroundSecondary;
  color: $colorTextPrimary;

  &:hover {
    background-color: $colorBackgroundHover;
  }
}

.small {
  padding: $spacing4 $spacing8;
  font-size: $fontSizeSm;
}

.large {
  padding: $spacing12 $spacing24;
  font-size: $fontSizeMd;
}

.loading {
  pointer-events: none;
  opacity: 0.7;
}
```

```tsx
// Button.tsx
import styles from "./Button.module.scss";
import clsx from "clsx";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  loading?: boolean;
};

export const Button = ({
  variant = "primary",
  size = "medium",
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size !== "medium" && styles[size],
        loading && styles.loading,
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "読み込み中..." : children}
    </button>
  );
};
```

## ネスティングルール

### ネストの深さ制限

**【MUST】ネストは最大 3 階層までに制限する。**

```scss
// Good: 3階層以内
.card {
  &__header {
    &--highlighted {
      // OK: 3階層目
    }
  }
}

// Bad: 4階層以上
.card {
  &__header {
    &__title {
      &--large {
        // NG: 4階層目
      }
    }
  }
}
```

### セレクタの詳細度

詳細度は低く保ち、ID セレクタは使用しない。

```scss
// Good: クラスセレクタのみ
.button {
  // ...
}

// Bad: ID セレクタ
#submitButton {
  // ...
}

// Bad: 高詳細度
div.container > ul.list > li.item {
  // ...
}
```

## コメント規則

```scss
// ===================
// セクション見出し
// ===================

// ---------------------
// サブセクション見出し
// ---------------------

// 単行コメント
.element {
  color: $colorPrimary; // インラインコメント
}

/*
 * 複数行コメント
 * 長い説明が必要な場合に使用
 */
```

## アニメーション

### トランジション

```scss
// 標準のトランジション設定を使用
.element {
  @include transition(opacity, transform);

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }
}
```

### キーフレームアニメーション

```scss
// アニメーション名は camelCase
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal {
  animation: fadeIn $transitionDurationBase $transitionEasing;
}
```

## レスポンシブデザイン

### モバイルファーストアプローチ

```scss
// モバイルをベースに、大きな画面向けにスタイルを追加
.container {
  padding: $spacing16;

  @include mediaUp($breakpointMd) {
    padding: $spacing24;
  }

  @include mediaUp($breakpointLg) {
    padding: $spacing32;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### ブレークポイントの使用

```scss
// Good: 変数を使用
@include mediaUp($breakpointMd) {
  // ...
}

// Bad: マジックナンバー
@media (min-width: 768px) {
  // ...
}
```

## 命名規則まとめ

| 対象 | 規則 | 例 |
|------|------|-----|
| 変数 | camelCase | `$colorPrimary`, `$spacing16` |
| Mixin | camelCase | `@mixin flexCenter` |
| Function | camelCase | `@function toRem` |
| クラス（BEM Block） | camelCase | `.postCard` |
| クラス（BEM Element） | __camelCase | `.postCard__title` |
| クラス（BEM Modifier） | --camelCase | `.postCard--highlighted` |
| 状態クラス | is-/has- + camelCase | `.is-loading`, `.has-error` |
| キーフレーム | camelCase | `@keyframes fadeIn` |
| ファイル名 | _camelCase.scss | `_variable.scss`, `_button.scss` |
| CSS Modules | PascalCase.module.scss | `Button.module.scss` |
