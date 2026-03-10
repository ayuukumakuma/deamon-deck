# Phase 14: サイドバーリサイズ

## 概要
サイドバーの右端にドラッグハンドルを設置し、マウスドラッグで幅を自由に変更できるようにする。幅は localStorage に永続化し、次回起動時に復元する。

## 前提
- Phase 13 完了

## タスク

### Zustand ストア — サイドバー幅の状態管理
- [x] `src/store/appState.ts` を修正
  - [x] `sidebarWidth: number` 状態を追加（デフォルト: 256px = 既存の `w-64`）
  - [x] `setSidebarWidth(width: number)` アクションを追加
  - [x] localStorage への永続化（キー: `sidebarWidth`）
  - [x] 起動時に localStorage から復元する `loadSidebarWidth()` を `src/lib/settings.ts` に追加

### ドラッグハンドルの実装
- [x] `src/components/layout/Sidebar.tsx` を修正
  - [x] 固定幅 `w-64` を `style={{ width: sidebarWidth }}` に置き換え
  - [x] サイドバー右端にドラッグハンドル要素を配置
    - [x] 幅 4px 程度の透明なヒットエリア
    - [x] ホバー時にカーソルを `col-resize` に変更
    - [x] ホバー時にハンドルのビジュアルインジケータ（薄い線）を表示
  - [x] ドラッグ中の幅計算ロジック
    - [x] `mousedown` でドラッグ開始
    - [x] `mousemove`（document レベル）で幅をリアルタイム更新
    - [x] `mouseup` でドラッグ終了、localStorage に保存
  - [x] 最小幅: 200px、最大幅: 800px にクランプ
  - [x] ドラッグ中はテキスト選択を無効化（`user-select: none`）

### App レイアウトの調整
- [x] `src/App.tsx` を修正
  - [x] サイドバーの幅に応じて MainContent が残りスペースを占めるよう確認
  - [x] flex レイアウトとの互換性確認

## 完了条件
- サイドバー右端をドラッグして幅を変更できる
- 最小幅（200px）・最大幅（480px）の制限が機能する
- ドラッグ中にカーソルが `col-resize` になる
- 変更した幅がアプリ再起動後も復元される
- ドラッグ中にテキスト選択が発生しない
- 既存のサイドバー機能（検索、フィルター、サービスリスト）が正常動作する

## 検証
- [x] `cargo check` — Rust コンパイル確認
- [x] `bun run biome check .` — フロントエンドリント
- [x] 手動テスト
  - [x] ドラッグで幅が変わる
  - [x] 最小・最大幅で止まる
  - [x] アプリ再起動後に幅が保持されている
  - [x] ダークモード/ライトモードでハンドルが適切に表示される
