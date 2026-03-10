# Phase 2: サービス一覧 + ステータス表示

## 概要
`~/Library/LaunchAgents/` 配下のサービスを一覧表示し、リアルタイムのステータスを表示する。

## 前提
- Phase 1 完了（プロジェクトが起動する状態）

## タスク

### Rust: モデル定義
- [x] `src-tauri/src/models/service.rs` を作成
  - [x] `ServiceStatus` enum: `Running`, `Stopped`, `Error`, `NotLoaded`
  - [x] `Service` struct: `label`, `status`, `pid`, `program`, `plist_path`, `run_at_load`
  - [x] `serde::Serialize` を derive

### Rust: エラー型
- [x] `src-tauri/src/error.rs` を作成
  - [x] `AppError` enum: `PlistParseError`, `LaunchctlError`, `IoError`, `NotFound`
  - [x] `thiserror` で定義
  - [x] `Into<tauri::InvokeError>` を実装

### Rust: サービス一覧コマンド
- [x] `src-tauri/src/commands/services.rs` を作成
- [x] `list_services()` コマンド
  - [x] `~/Library/LaunchAgents/` から .plist ファイルを列挙
  - [x] 各 plist を `plist` クレートでパース
  - [x] `Label`, `Program`/`ProgramArguments`, `RunAtLoad` を抽出
- [x] `launchctl list` の出力パース
  - [x] `std::process::Command` で実行
  - [x] タブ区切りの出力をパース (PID, Status, Label)
- [x] ステータス判定ロジック
  - [x] plist の Label と launchctl list の出力をマッチング
  - [x] PID あり → Running, 非ゼロ Status → Error, それ以外 → Stopped
  - [x] launchctl に存在しない → NotLoaded
- [x] Tauri コマンドとして登録 (`lib.rs`)

### フロントエンド: 型定義
- [x] `src/lib/types.ts` に `Service`, `ServiceStatus` 型を追加
- [x] `src/lib/commands.ts` に `listServices()` ラッパーを追加

### フロントエンド: 状態管理
- [x] `src/store/appState.ts` を作成
  - [x] `services: Service[]`
  - [x] `selectedServiceLabel: string | null`
  - [x] `filter: string`
  - [x] `setServices`, `selectService`, `setFilter` アクション

### フロントエンド: hooks
- [x] `src/hooks/useServices.ts` を作成
  - [x] `listServices()` を invoke で呼び出し
  - [x] 5秒間隔のポーリング (`setInterval`)
  - [x] `services-changed` イベントのリスナーで即時リフレッシュ
  - [x] エラーハンドリング

### フロントエンド: コンポーネント
- [x] `src/components/service-list/StatusBadge.tsx`
  - [x] Running: 緑丸
  - [x] Stopped: グレー丸
  - [x] Error: 赤丸
  - [x] NotLoaded: 黄丸
- [x] `src/components/service-list/ServiceRow.tsx`
  - [x] Label, Status, Program を表示
  - [x] クリックでサービス選択
- [x] `src/components/service-list/ServiceTable.tsx`
  - [x] ServiceRow のリスト表示
  - [x] フィルターによる絞り込み
- [x] `src/components/layout/Sidebar.tsx` を更新
  - [x] 検索入力フィールド
  - [x] ServiceTable を配置

### フロントエンド: 詳細パネル（基本）
- [x] `src/components/service-detail/ServiceInfo.tsx`
  - [x] 選択中のサービスの詳細情報を表示
  - [x] Label, Program, Status, PID, plist パス
- [x] `src/components/service-detail/DetailPanel.tsx`
  - [x] タブ UI: Info / Editor / Logs
  - [x] 現時点では Info タブのみ実装

## 完了条件
- アプリ起動時に `~/Library/LaunchAgents/` のサービスが一覧表示される
- 各サービスのステータス (Running/Stopped/Error/NotLoaded) が正しく表示される
- 検索でサービスを絞り込める
- サービスをクリックすると詳細パネルに情報が表示される
- 5秒ごとにステータスが自動更新される
