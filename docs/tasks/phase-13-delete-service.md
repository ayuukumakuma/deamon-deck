# Phase 13: サービス削除機能

## 概要
GUIからサービス（.plistファイル）を完全に削除できる機能を追加する。削除前の確認ダイアログ、バックアップ作成、ログストリーム停止、unload処理を含む。

## 前提
- Phase 12 完了

## タスク

### Rust Backend — 可視性変更
- [x] `src-tauri/src/commands/launchctl.rs` を修正
  - [x] `run_with_fallback` を `pub(crate)` に変更
  - [x] `gui_target` を `pub(crate)` に変更
- [x] `src-tauri/src/commands/logs.rs` を修正
  - [x] `LogStreamState::cancel_stream` を `pub(crate) fn` に変更

### Rust Backend — `delete_service` コマンド
- [x] `src-tauri/src/commands/plist.rs` に `delete_service` コマンドを追加
  - [x] `plist_path` の存在チェック → なければ `NotFound` エラー
  - [x] `LogStreamState::cancel_stream(&label)` でログストリーム停止
  - [x] ロード済みサービスなら unload 試行（失敗は無視して続行）
  - [x] `.plist.bak` バックアップ作成（`write_plist` と同じパターン）
  - [x] `std::fs::remove_file` でファイル削除
- [x] `src-tauri/src/lib.rs` の `invoke_handler` に `delete_service` を登録

### Frontend — コマンドラッパー
- [x] `src/lib/commands.ts` に `deleteService(label, plistPath)` を追加

### Frontend — 翻訳キー
- [x] `src/lib/i18n.ts` に削除関連の翻訳キーを追加（en/ja）
  - [x] `action.delete` — 削除ボタンラベル
  - [x] `delete.title` — 確認ダイアログタイトル
  - [x] `delete.message` — 確認メッセージ（ラベル名を含む）
  - [x] `delete.confirm` — 確認ボタンラベル
  - [x] `delete.cancel` — キャンセルボタンラベル
  - [x] `delete.deleting` — 削除中ラベル

### Frontend — ConfirmDialog コンポーネント
- [x] `src/components/ui/ConfirmDialog.tsx` を新規作成
  - [x] Props: `title`, `message`, `confirmLabel`, `cancelLabel`, `variant`, `loading`, `onConfirm`, `onCancel`
  - [x] `variant="danger"` で確認ボタンを赤色スタイル
  - [x] `fixed inset-0 z-50` + `bg-black/40` のオーバーレイ
  - [x] backdrop クリックで閉じる
  - [x] Escape キーで閉じる（既存の `app:escape` イベント利用）
  - [x] `loading` 中はボタン無効化（連打防止）

### Frontend — 削除ボタン統合
- [x] `src/components/service-detail/ServiceActions.tsx` を修正
  - [x] 既存ボタン群の下に `border-t` セパレーターで分離した削除ボタンを配置
  - [x] 赤色アウトラインの危険操作スタイル
  - [x] 全ステータスで有効（Running/Stopped/Error/NotLoaded）
  - [x] クリックで ConfirmDialog 表示
  - [x] 確認後に `deleteService` 呼出
  - [x] 成功時: `selectedServiceLabel` クリア + success トースト + `refreshServices()`
  - [x] 失敗時: error トースト

## エッジケース
- Running 状態: unload 試行 → 失敗しても削除続行
- ファイル既に存在しない: `NotFound` エラー返却
- ログストリーム実行中: Rust 側で `cancel_stream` 先行呼出
- 連打防止: ConfirmDialog の確認ボタンに loading state
- 削除後のリスト更新: `refreshServices()` で即座反映

## 検証
- [x] `cargo check` — Rust コンパイル確認
- [x] `bun run biome check .` — フロントエンドリント
- [ ] 手動テスト
  - [ ] NotLoaded サービスを削除 → ファイル消去、リストから消える
  - [ ] Running サービスを削除 → 先に unload されてからファイル消去
  - [ ] 削除前に確認ダイアログ表示、キャンセルで何も起こらない
  - [ ] 削除後にバックアップ (.bak) が作成されている
  - [ ] 削除後にトースト通知表示
  - [ ] 削除後に選択状態がクリアされ、DetailPanel が空状態になる
