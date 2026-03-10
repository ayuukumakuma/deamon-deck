# Phase 18: エディタ周りのUX改善

## 概要

エディタ画面（PlistEditor, CreateServiceDialog, RawXmlEditor）のUXを改善する。新規サービス作成時の入力ガイダンス不足、エディタの使いづらさ、i18n未適用箇所を修正する。

## 前提

- Phase 17 完了

## タスク

### 1. i18n — エディタ画面の全ハードコード文字列を翻訳

- [x] `src/lib/i18n.ts` にエディタ関連の翻訳キーを追加
  - [x] PlistEditor用: `plist.mode.structured`, `plist.mode.raw`, `plist.unsavedChanges`, `plist.loading`, `plist.loadError`, `plist.save`, `plist.saving`, `plist.saveAndReload`, `plist.remove`, `plist.addProperty`, `plist.newPropertyKey`, `plist.dismiss`
  - [x] PlistField用: `plist.field.add`, `plist.field.key`, `plist.field.dataBytes`, `plist.field.datePlaceholder`
  - [x] RawXmlEditor用: `plist.loadingXml`
  - [x] KEY_METAラベル用: `plist.key.Label` 〜 `plist.key.StandardErrorPath`（11キー）
- [x] `src/components/plist-editor/PlistEditor.tsx` を修正
  - [x] 全ハードコード文字列を `t()` に置換（"Structured", "Raw XML", "Unsaved changes", "Save", "Save & Reload", "Remove", "Add Property", "Dismiss", "Loading plist...", "New property key..."）
  - [x] KEY_METAの `label` をi18nキーに変更し、表示時に `t()` で解決
  - [x] エラーメッセージprefix "Failed to load plist: " を `t()` に置換
- [x] `src/components/plist-editor/PlistField.tsx` を修正
  - [x] `"+ Add"` を `t("plist.field.add")` に置換
  - [x] `"×"` はそのまま（記号のため翻訳不要）
  - [x] `"Key"` placeholder を `t("plist.field.key")` に置換
  - [x] Data表示テキストを `t("plist.field.dataBytes", { bytes })` に置換
  - [x] Date placeholder を `t("plist.field.datePlaceholder")` に置換
- [x] `src/components/plist-editor/RawXmlEditor.tsx` を修正
  - [x] `"Loading XML..."` を `t("plist.loadingXml")` に置換

### 2. CreateServiceDialog — 入力ガイダンス強化

- [x] `src/lib/i18n.ts` に翻訳キーを追加
  - [x] `create.labelHelp` — ラベルのヘルプテキスト（en: "Unique identifier in reverse-domain format", ja: "逆ドメイン形式の一意な識別子"）
  - [x] `create.labelSuggestion` — ラベル自動提案テキスト（en: "Suggestion: {suggestion}", ja: "候補: {suggestion}"）
  - [x] `create.programExample` — 具体例テキスト（en: "e.g. /usr/local/bin/node server.js", ja: "例: /usr/local/bin/node server.js"）
- [x] `src/components/plist-editor/CreateServiceDialog.tsx` を修正
  - [x] ラベル入力欄の下にヘルプテキスト `t("create.labelHelp")` を追加
  - [x] プログラム欄の説明文に具体例 `t("create.programExample")` を追加
  - [x] プログラムパス入力時にラベル候補を自動提案（`com.user.{basename}` 形式）
    - [x] ラベルが空の場合のみ提案を表示
    - [x] 提案をクリックするとラベル欄に自動入力

### 3. PlistField — インライン説明文の常時表示

- [x] `src/components/plist-editor/PlistField.tsx` を修正
  - [x] InfoTooltip（ホバーツールチップ）を削除
  - [x] `getPlistKeyHelp()` の結果をフィールド下に常時表示（`text-xs text-[var(--color-text-secondary)]`）
  - [x] ヘルプテキストがないフィールドは説明文なしのまま

### 4. RawXmlEditor — 使い勝手改善

- [x] `src/components/plist-editor/RawXmlEditor.tsx` を修正
  - [x] CodeMirrorの高さを固定値から可変に変更: `height="400px"` → `minHeight="200px"`, `maxHeight="70vh"` 相当
  - [x] 行折り返しトグルボタンを追加（`EditorView.lineWrapping` の切替）
  - [x] エラー表示位置をエディタ上部から下部に移動
- [x] `src/lib/i18n.ts` に翻訳キーを追加
  - [x] `plist.wrapLines` — 行折り返しトグルラベル

### 5. プロパティ追加 — ドロップダウン化

- [x] `src/components/plist-editor/PlistEditor.tsx` を修正
  - [x] フリーテキスト入力をドロップダウン（コンボボックス）に変更
  - [x] 既知のplistキー一覧をカテゴリ別にグループ化して表示
  - [x] 既にドキュメントに存在するキーはリストから除外
  - [x] "カスタムキー..." オプションでフリーテキスト入力も可能
  - [x] キー選択時にデフォルト値（型に応じた空値）を自動設定
- [x] `src/lib/i18n.ts` に翻訳キーを追加
  - [x] `plist.selectProperty` — ドロップダウンplaceholder
  - [x] `plist.customKey` — カスタムキーオプション

## 完了条件

- PlistEditor / PlistField / RawXmlEditor の全UI文字列がi18n対応されている
- 日本語/英語切替時にエディタ画面の全テキストが正しく切り替わる
- CreateServiceDialog でラベル・プログラムの入力ガイダンスが表示される
- プログラムパス入力後にラベル候補が提案される
- プロパティ追加がドロップダウンから選択できる
- RawXmlEditor の高さがコンテンツに応じて可変する
- 行折り返しトグルが動作する
- フィールドのヘルプテキストが常時表示される

## 検証

- [x] `bun run biome check .` — フロントエンドリント
- [x] 手動テスト
  - [x] 言語を日本語/英語に切替 → エディタ画面の全テキストが切り替わる
  - [x] 新規サービス作成モーダルでラベル・プログラムのガイダンスが表示される
  - [x] プログラムパス入力後にラベル提案が表示される
  - [x] 提案クリックでラベル欄に自動入力される
  - [x] エディタの構造化モードでフィールド下にヘルプが表示される
  - [x] プロパティ追加でドロップダウンから既知キーを選択できる
  - [x] カスタムキーの入力も動作する
  - [x] Raw XMLモードでエディタ高さがコンテンツに応じて変わる
  - [x] 行折り返しトグルが正常に動作する
  - [x] ダークモード/ライトモードで見た目が適切
