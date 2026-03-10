# Phase 15: 削除時バックアップ選択

## 概要
サービス削除時にバックアップ（`.plist.bak`）を作成するかどうかをユーザーが選択できるようにする。削除確認ダイアログにチェックボックスを追加し、デフォルトはON（バックアップ作成）とする。

## 前提
- Phase 14 完了

## タスク

### Rust Backend — `delete_service` コマンド修正
- [x] `src-tauri/src/commands/plist.rs` を修正
  - [x] `delete_service` に `create_backup: bool` 引数を追加
  - [x] `create_backup` が `true` の場合のみ `.plist.bak` を作成
  - [x] `false` の場合はバックアップをスキップして直接削除

### Frontend — コマンドラッパー修正
- [x] `src/lib/commands.ts` を修正
  - [x] `deleteService(label, plistPath, createBackup)` に引数追加

### Frontend — 翻訳キー追加
- [x] `src/lib/i18n.ts` に翻訳キーを追加（en/ja）
  - [x] `delete.backupOption` — チェックボックスラベル（例:「削除前にバックアップを作成する」）

### Frontend — 削除確認ダイアログ修正
- [x] `src/components/service-detail/ServiceActions.tsx` を修正
  - [x] 削除確認ダイアログ内にチェックボックスを追加
    - [x] デフォルト: チェックON（バックアップ作成）
    - [x] ラベル: 翻訳キー `delete.backupOption` を使用
  - [x] チェック状態を `deleteService` 呼出時に `createBackup` として渡す

### ConfirmDialog の拡張（必要な場合）
- [x] `src/components/ui/ConfirmDialog.tsx` を修正
  - [x] オプションで children（追加コンテンツ）を受け取れるようにする
  - [x] または削除専用の状態管理を ServiceActions 内で完結させる

## 完了条件
- 削除確認ダイアログにバックアップ作成のチェックボックスが表示される
- チェックONで削除すると `.plist.bak` が作成される
- チェックOFFで削除するとバックアップなしで直接削除される
- デフォルトはチェックON
- 既存の削除フロー（unload、ログストリーム停止等）は変更なし

## 検証
- [x] `cargo check` — Rust コンパイル確認
- [x] `bun run biome check .` — フロントエンドリント
- [x] 手動テスト
  - [x] チェックONで削除 → `.plist.bak` が作成される
  - [x] チェックOFFで削除 → `.plist.bak` が作成されない
  - [x] ダイアログを開くたびにデフォルトがONにリセットされる
