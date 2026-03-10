# Phase 3: サービス制御

## 概要
サービスの start/stop/restart/load/unload 操作を GUI から実行できるようにする。

## 前提
- Phase 2 完了（サービス一覧が表示される状態）

## タスク

### Rust: launchctl コマンド
- [x] `src-tauri/src/commands/launchctl.rs` を作成
- [x] UID 取得ヘルパー
  - [x] `std::process::Command` で `id -u` を実行、または `users` クレートを使用
- [x] `load_service(plist_path: String)` コマンド
  - [x] modern: `launchctl bootstrap gui/{uid} {path}`
  - [x] fallback: `launchctl load {path}`
- [x] `unload_service(label: String, plist_path: String)` コマンド
  - [x] modern: `launchctl bootout gui/{uid}/{label}`
  - [x] fallback: `launchctl unload {path}`
- [x] `start_service(label: String)` コマンド
  - [x] modern: `launchctl kickstart gui/{uid}/{label}`
  - [x] fallback: `launchctl start {label}`
- [x] `stop_service(label: String)` コマンド
  - [x] modern: `launchctl kill SIGTERM gui/{uid}/{label}`
  - [x] fallback: `launchctl stop {label}`
- [x] `restart_service(label: String)` コマンド
  - [x] stop → start の順序で実行
  - [x] stop 後に短いディレイを挟む
- [x] `enable_service(label: String)` コマンド
  - [x] `launchctl enable gui/{uid}/{label}`
- [x] `disable_service(label: String)` コマンド
  - [x] `launchctl disable gui/{uid}/{label}`
- [x] 全コマンドを Tauri コマンドとして登録

### Rust: エラーハンドリング
- [x] launchctl の stderr 出力をエラーメッセージとして返す
- [x] 権限エラー、存在しないサービス等のケースをハンドリング

### フロントエンド: コマンドラッパー
- [x] `src/lib/commands.ts` に以下を追加
  - [x] `loadService(plistPath)`
  - [x] `unloadService(label, plistPath)`
  - [x] `startService(label)`
  - [x] `stopService(label)`
  - [x] `restartService(label)`
  - [x] `enableService(label)`
  - [x] `disableService(label)`

### フロントエンド: ServiceActions コンポーネント
- [x] `src/components/service-detail/ServiceActions.tsx` を作成
- [x] ボタン配置
  - [x] Start ボタン
  - [x] Stop ボタン
  - [x] Restart ボタン
  - [x] Load / Unload ボタン
- [x] ステータスに応じたボタンの有効/無効制御
  - [x] Running → Stop, Restart のみ有効
  - [x] Stopped → Start のみ有効
  - [x] NotLoaded → Load のみ有効
  - [x] Error → Stop, Start, Restart 有効
- [x] 操作中のローディング状態表示
- [x] 操作完了後にサービス一覧を自動リフレッシュ

### フロントエンド: エラー通知
- [x] 操作失敗時のエラー表示コンポーネント
- [x] トースト or インラインエラーメッセージ
- [x] launchctl の stderr メッセージを表示

## 完了条件
- Running サービスを Stop → Start で再起動できる
- Stopped サービスを Start で起動できる
- NotLoaded サービスを Load で読み込める
- 操作後にステータスが即座に更新される
- エラー時に分かりやすいメッセージが表示される
