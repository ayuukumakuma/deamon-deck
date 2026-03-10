# Phase 7: 残タスク

## 概要
Phase 0〜6 のチェックリストで未完了だったタスクをまとめたもの。

## タスク

### 開発環境 (Phase 0 由来)
- [x] `flake.nix` に `libiconv` を追加

### macOS ネイティブ UI (Phase 6 由来)
- [x] サイドバーに `vibrancy: "sidebar"` 効果を適用
  - `window-vibrancy` クレートは Cargo.lock に存在するが、サイドバーへの適用コードがない

### パフォーマンス (Phase 6 由来)
- [x] サービス一覧の仮想スクロール（サービス数が多い場合）
  - `@tanstack/react-virtual` は依存に含まれているが、`service-list/` では未使用
- [x] plist 読み込みのキャッシュ（変更時のみ再読み込み）

## 完了条件
- `libiconv` が Nix 開発シェルで利用可能
- サイドバーが macOS ネイティブの vibrancy 効果を持つ
- サービス数が多い場合でもスムーズにスクロールできる
- plist の再読み込みが変更時のみ発生する
