# Phase 8: 設定画面

## 概要
Cmd+, で開く設定ダイアログを新設し、テーマ・フォントサイズ・言語を管理できるようにする。

## 前提
- Phase 6 完了（テーマ・キーボードショートカット基盤が存在する状態）

## タスク

### 設定基盤
- [x] `src/lib/settings.ts` を作成
  - [x] `FontSize` 型 (`"small"` / `"medium"` / `"large"`)
  - [x] `applyFontSize()` — `html` の `font-size` を変更（14px / 16px / 18px）
  - [x] `loadFontSize()` / `loadLocale()` — localStorage から読み込み
- [x] `src/store/appState.ts` に設定系 state を追加
  - [x] `themePreference: "light" | "dark" | "system"`
  - [x] `fontSize: FontSize`
  - [x] `locale: Locale`
  - [x] `isSettingsOpen: boolean`
  - [x] 各 setter

### i18n（国際化）
- [x] `src/lib/i18n.ts` を作成
  - [x] `Locale` 型 (`"en"` / `"ja"`)
  - [x] 翻訳マップ（`en` / `ja` のキーバリュー）
  - [x] `useTranslation()` フック — Zustand の `locale` を読み `t(key)` 関数を返す
- [x] 既存コンポーネントに `t()` を適用
  - [x] `Sidebar.tsx` — "Services", 検索プレースホルダー
  - [x] `DetailPanel.tsx` — タブラベル ("Info", "Editor", "Logs")
  - [x] `StatusBadge.tsx` — ステータステキスト
  - [x] `CreateServiceDialog.tsx` — ダイアログタイトル、ラベル、ボタン
  - [x] `ServiceActions.tsx` — ボタンテキスト
  - [x] `ServiceInfo.tsx` — ラベルテキスト

### テーマ連携リファクタ
- [x] `src/hooks/useTheme.ts` をリファクタ
  - [x] ローカル `useState` → Zustand の `themePreference` に移行
  - [x] `setTheme` は Zustand の setter + localStorage 保存

### キーボードショートカット
- [x] `src/hooks/useKeyboardShortcuts.ts` に `Cmd+,` を追加
  - [x] `app:settings` カスタムイベントを dispatch

### 設定ダイアログ
- [x] `src/components/settings/SettingsDialog.tsx` を作成
  - [x] `CreateServiceDialog` と同じモーダルパターン（overlay + 中央配置）
  - [x] backdrop クリック / Escape で閉じる
  - [x] テーマ: 3ボタントグル (Light / Dark / System)
  - [x] フォントサイズ: 3ボタントグル (Small / Medium / Large)
  - [x] 言語: 2ボタントグル (English / 日本語)
  - [x] 全設定は即時反映（保存ボタン不要）

### App.tsx 統合
- [x] `app:settings` イベントリスナーで `isSettingsOpen` を `true` に
- [x] `SettingsDialog` を条件付きレンダリング
- [x] マウント時に `applyFontSize(loadFontSize())` を実行

## 注意点
- CodeMirror のフォントサイズは `html` の `font-size` 変更では反映されない可能性あり。テスト時に確認し、必要なら CodeMirror 設定で別途対応
- `@tanstack/react-virtual` の `estimateSize` が固定値の場合、フォントサイズ変更時に再計算が必要になる可能性あり

## 完了条件
- `Cmd+,` で設定ダイアログが開閉する
- テーマ (Light/Dark/System) が即時反映される
- フォントサイズ変更で全体のテキストサイズが変わる
- 言語切替で UI テキストが英語/日本語に切り替わる
- 全設定がリロード後も保持される（localStorage）
- `bun run biome check .` でリントエラーがない
