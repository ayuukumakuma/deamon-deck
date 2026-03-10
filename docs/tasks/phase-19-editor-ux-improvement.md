# Phase 19: エディタUX改善 — 全プロパティ常時表示 & デザイン改善

## 概要

PlistEditorの構造化モードにおいて、全既知プロパティを最初から表示し、プロパティの追加操作を不要にする。あわせてフィールドの視認性・カテゴリの区切りなどデザイン面の改善を行う。

## 前提

- Phase 18 完了

## 背景

- 現状はplistに存在するプロパティのみ表示され、新規プロパティはPropertyKeyCombobox（ドロップダウン）から追加する必要がある
- どのプロパティが設定可能か一覧できず、発見性が低い
- フィールド間の `border-b` + `py-2` による密なレイアウトが視認性を下げている
- CategorySectionの `border-b` ヘッダーだけでは視覚的なグループ感が弱い

## タスク

### 1. 全既知プロパティの常時表示 + トグル方式

- [ ] `src/components/plist-editor/PlistEditor.tsx` を修正
  - [ ] カテゴリ描画ロジックの変更: `cat.keys` の全キーを常にイテレートし、`document.entries` に存在するかどうかを `isSet` フラグで管理
  - [ ] `entries.length === 0` で `return null` するガードを削除（全カテゴリを常に表示）
  - [ ] `toggleProperty(key)` ハンドラを追加: `existingKeys.has(key)` なら `removeEntry(key)`、なければ `addEntry(key, meta.defaultValue)`
  - [ ] `PlistField` に `isSet` と `onToggle` props を渡す
  - [ ] 必須フィールド（Label）には `onToggle` を渡さない（常に有効）

### 2. PlistField — トグルUI追加 & 無効状態の表示

- [ ] `src/components/plist-editor/PlistField.tsx` を修正
  - [ ] `PlistFieldProps` に `isSet?: boolean` と `onToggle?: () => void` を追加
  - [ ] ラベル左にトグル（チェックボックスまたはスイッチ）を追加
    - [ ] `onToggle` が未定義の場合はトグル非表示（必須フィールド・その他カテゴリ）
    - [ ] `isSet === true` でオン状態、`isSet === false` でオフ状態
  - [ ] `isSet === false` のとき入力エリアを `opacity-40` + `pointer-events-none` で無効化表示
  - [ ] ラベル・ヘルプテキストは `isSet` に関わらず常に読める状態を維持

### 3. PropertyKeyCombobox の簡素化

- [ ] `src/components/plist-editor/PlistEditor.tsx` を修正
  - [ ] PropertyKeyCombobox から既知プロパティのグループ表示（`availableKeys`, `grouped` memo）を削除
  - [ ] カスタムプロパティ名のフリーテキスト入力のみに簡素化
  - [ ] コンポーネントをフォーム最下部から「その他」カテゴリセクション内に移動
  - [ ] `existingKeys` に全既知キーも含めて重複防止

### 4. CategorySection のデザイン改善

- [ ] `src/components/plist-editor/PlistEditor.tsx` の `CategorySection` を修正
  - [ ] カード風スタイルに変更: `rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/30 p-4`
  - [ ] カテゴリヘッダーに設定済みプロパティ数を表示（例: `2/4`）
  - [ ] カテゴリ間のスペーシングを `mt-3` から `gap-4` に変更
  - [ ] デフォルトで全セクション展開状態を維持

### 5. PlistField のデザイン改善

- [ ] `src/components/plist-editor/PlistField.tsx` を修正
  - [ ] `border-b border-[var(--color-border)]` を削除し、親コンテナの `gap` ベースのスペーシングに変更
  - [ ] padding を `py-2` から `py-3` に増加
  - [ ] トグル + ラベル + ヘルプテキストの水平レイアウトを整理

### 6. i18n — 翻訳キー追加

- [ ] `src/lib/i18n.ts` に以下のキーを追加（en / ja）
  - [ ] `plist.configured` — `"{count}/{total} configured"` / `"{count}/{total} 設定済み"`
  - [ ] `plist.addCustomProperty` — `"Add custom property..."` / `"カスタムプロパティを追加..."`

## 完了条件

- 構造化モードで全14既知プロパティが常に表示されている
- 未設定プロパティはトグルで有効化でき、有効化するとデフォルト値で編集可能になる
- トグルをオフにするとプロパティがplistから除去される
- 必須フィールド（Label）はトグルなしで常に有効
- カテゴリがカード風デザインで視覚的に区切られている
- カテゴリヘッダーに設定済み数が表示される
- フィールド間のスペーシングが改善され視認性が向上している
- カスタムプロパティの追加が引き続き可能
- Raw XMLモードとの切替が正常に動作する
- ダークモード/ライトモードで表示が適切

## 検証

- [ ] `bun run biome check .` — フロントエンドリント
- [ ] 手動テスト
  - [ ] エディタを開くと全既知プロパティが表示される
  - [ ] 未設定プロパティのトグルをオンにすると編集可能になる
  - [ ] トグルをオフにするとプロパティが除去され、Unsaved changes が表示される
  - [ ] Label フィールドにはトグルが表示されない
  - [ ] カテゴリがカード風に表示され、設定済み数が見える
  - [ ] カスタムプロパティを「その他」セクションから追加できる
  - [ ] Save / Save & Reload が正常に動作する
  - [ ] Raw XMLモードに切り替えてトグル操作の結果が反映されている
  - [ ] ダークモード/ライトモードで見た目が適切
