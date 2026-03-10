# Phase 5: ログビューア

## 概要
選択中のサービスの stdout/stderr ログをリアルタイムで表示するビューアを実装する。

## 前提
- Phase 4 完了（Plist エディタが動作する状態）

## タスク

### Rust: ログストリーミング
- [x] `src-tauri/src/commands/logs.rs` を作成
- [x] `start_log_stream(label: String, plist_path: String, on_event: Channel<LogLine>)` コマンド
  - [x] plist から `StandardOutPath` / `StandardErrorPath` を読み取り
  - [x] ログファイルの末尾から読み取り開始（既存内容は直近 N 行のみ）
  - [x] `notify` クレートでファイル変更を監視
  - [x] 変更検知時に差分を読み取り、Channel 経由で送信
  - [x] stdout / stderr を区別して送信
- [x] `stop_log_stream(label: String)` コマンド
  - [x] バックグラウンドタスクのキャンセル
  - [x] `tokio::sync::oneshot` or `CancellationToken` で制御
- [x] ログパスが未設定の場合のフォールバック
  - [x] `log stream --predicate 'process == "{process_name}"'` を使用
  - [x] プロセス名は plist の `Program` or `ProgramArguments[0]` から取得
- [x] `LogLine` struct
  - [x] `content: String` - ログ行の内容
  - [x] `source: LogSource` - stdout / stderr / system
  - [x] `timestamp: Option<String>` - タイムスタンプ（可能な場合）
- [x] 全コマンドを Tauri コマンドとして登録

### Rust: ストリーム管理
- [x] アクティブなログストリームの管理
  - [x] `HashMap<String, CancellationToken>` で管理
  - [x] Tauri の `State` として保持
- [x] サービス切替時に前のストリームを自動停止

### フロントエンド: コマンドラッパー
- [x] `src/lib/commands.ts` に以下を追加
  - [x] `startLogStream(label, plistPath, onEvent)` - Channel ベース
  - [x] `stopLogStream(label)`
- [x] `src/lib/types.ts` に `LogLine`, `LogSource` 型を追加

### フロントエンド: hooks
- [x] `src/hooks/useLogStream.ts` を作成
  - [x] ログ行の配列を管理
  - [x] Channel イベントリスナーでログ行を追加
  - [x] 最大行数制限（メモリ保護、例: 10,000行）
  - [x] クリア機能
  - [x] 一時停止/再開機能（バッファリング）
  - [x] コンポーネント unmount 時に自動停止

### フロントエンド: コンポーネント
- [x] `src/components/log-viewer/LogLine.tsx`
  - [x] ログ行の表示
  - [x] stdout: 通常色
  - [x] stderr: 赤系色
  - [x] system: グレー
  - [x] タイムスタンプ表示（あれば）
- [x] `src/components/log-viewer/LogViewer.tsx`
  - [x] `@tanstack/react-virtual` による仮想スクロール
  - [x] 自動スクロール（最新行が常に表示）
  - [x] 手動スクロール時は自動スクロールを一時停止
  - [x] ツールバー
    - [x] 一時停止/再開トグル
    - [x] クリアボタン
    - [x] 自動スクロール on/off
    - [x] フィルター: stdout のみ / stderr のみ / 全て
  - [x] ログが空の場合のプレースホルダー表示
  - [x] ログパスが未設定の場合の案内メッセージ

### フロントエンド: DetailPanel 更新
- [x] `DetailPanel.tsx` の Logs タブに LogViewer を配置
- [x] タブ切替時にストリームを開始/停止
- [x] サービス切替時に前のストリームを停止し新しいストリームを開始

## 完了条件
- サービス選択 → Logs タブでリアルタイムログが表示される
- stdout と stderr が色分けされている
- 自動スクロールで最新ログが追従する
- 一時停止でスクロールを止めてログを確認できる
- クリアで表示をリセットできる
- ログパス未設定のサービスでも適切なメッセージが表示される
- サービス切替時にストリームが正しく切り替わる
