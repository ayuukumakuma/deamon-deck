# Phase 10: インタラクション改善

## 概要
サービス操作の発見性とアクセス速度を向上させる。サービス行にインライン操作ボタンとコンテキストメニューを追加し、詳細パネルに移動せずに基本操作を完結できるようにする。

## 前提
- Phase 9 完了（トースト通知が動作する状態）

## 背景
- Docker Desktopではコンテナ行ホバーでPlay/Stop/Restartアイコンが表示され、ワンクリックで操作可能
- 現状は詳細パネルのServiceActionsまで移動しないと操作できず、手数が多い
- 右クリックメニューがなく、操作の発見性が低い

## タスク

### サービス行のインライン操作ボタン
- [x] `src/components/service-list/ServiceRow.tsx` を修正
- [x] ホバー時に行の右端に操作アイコンを表示
  - [x] Running → Stop (■) + Restart (↻) アイコン
  - [x] Stopped → Start (▶) アイコン
  - [x] Error → Start (▶) + Stop (■) アイコン
  - [x] NotLoaded → Load (↓) アイコン
- [x] アイコンスタイル
  - [x] 非ホバー時: 非表示（サービス名・サブテキストが表示）
  - [x] ホバー時: 右端にフェードイン、背景にグラデーションオーバーレイ
  - [x] アイコン自体のホバー: わずかに拡大 + ツールチップ
- [x] クリックでコマンド実行
  - [x] `invoke()` で対応するコマンドを呼び出し
  - [x] 操作中はアイコンをスピナーに置き換え
  - [x] 完了時にトースト通知（Phase 9のToast使用）
  - [x] 行クリック（サービス選択）とアイコンクリックのイベント伝播を分離（`stopPropagation`）

### 右クリックコンテキストメニュー
- [x] `src/components/service-list/ServiceContextMenu.tsx` を新規作成
- [x] メニュー項目
  - [x] Start（Running時disabled）
  - [x] Stop（Stopped/NotLoaded時disabled）
  - [x] Restart（Stopped/NotLoaded時disabled）
  - [x] separator
  - [x] Load（Running/Stopped/Error時disabled）
  - [x] Unload（NotLoaded時disabled）
  - [x] separator
  - [x] Edit Plist（Editor タブを開く）
  - [x] View Logs（Logs タブを開く）
  - [x] separator
  - [x] Show in Finder（plistファイルをFinderで表示）
  - [x] Copy Label（ラベルをクリップボードにコピー）
- [x] メニュー表示ロジック
  - [x] `onContextMenu` イベントハンドラ
  - [x] クリック位置にメニューを表示
  - [x] 画面端での位置補正（メニューが画面外に出ない）
  - [x] メニュー外クリックまたはEscキーで閉じる
- [x] メニュースタイル
  - [x] macOSネイティブに近いデザイン（角丸、ドロップシャドウ、セミトランスルーセント背景）
  - [x] disabled項目はグレーアウト
  - [x] ホバー時のハイライト
  - [x] アイコン + テキスト + ショートカットキー表示

### ServiceContextMenu の統合
- [x] `src/components/service-list/ServiceTable.tsx` を修正
  - [x] ServiceRow に `onContextMenu` ハンドラを接続
  - [x] コンテキストメニューの状態管理（表示/非表示、対象サービス、位置）
- [x] 「Show in Finder」の実装
  - [x] Tauri の shell API (`open` コマンド) でplistファイルの親ディレクトリを開く
  - [x] または `src/lib/commands.ts` に `showInFinder(path)` を追加
- [x] 「Copy Label」の実装
  - [x] `navigator.clipboard.writeText()` でクリップボードにコピー
  - [x] コピー完了をトーストで通知

### ServiceActions のトースト通知対応
- [x] `src/components/service-detail/ServiceActions.tsx` を修正
  - [x] 操作成功時にトースト通知（「サービスを開始しました」等）
  - [x] 操作失敗時にエラートースト通知
  - [x] インラインエラーボックスはトーストに置き換え

## 完了条件
- サービス行ホバーでインライン操作ボタンが表示される
- インラインボタンクリックでサービス操作が実行され、トースト通知が表示される
- サービス行の右クリックでコンテキストメニューが表示される
- コンテキストメニューから全操作（Start/Stop/Restart/Load/Unload/Edit/Logs/Finder/Copy）が実行できる
- ステータスに応じてメニュー項目が適切にdisabled制御されている
- ServiceActions の操作結果もトースト通知で表示される
