# Phase 1: プロジェクトスキャフォールド

## 概要
Tauri v2 + React + TypeScript のプロジェクト基盤を構築し、基本レイアウトを作成する。

## 前提
- Phase 0 完了（開発環境が使える状態）

## タスク

### Tauri プロジェクト生成
- [x] `bunx create-tauri-app` で React + TypeScript テンプレートを生成
- [x] 生成されたファイルを既存リポジトリにマージ
- [x] `bun install` で依存関係インストール

### Tauri 設定
- [x] `tauri.conf.json` を編集
  - [x] アプリ名: "Daemon Deck"
  - [x] ウィンドウタイトル: "Daemon Deck"
  - [x] ウィンドウサイズ: 幅 1000px, 高さ 700px
  - [x] `transparent: true` (vibrancy 用)
  - [x] `decorations: true`
- [x] `capabilities/default.json` を設定
  - [x] ファイルシステム読み書き権限 (`~/Library/LaunchAgents/` スコープ)

### Rust 依存関係
- [x] `Cargo.toml` に以下を追加
  - [x] `plist`
  - [x] `notify` (v7+)
  - [x] `dirs`
  - [x] `thiserror`
  - [x] `serde` + `serde_json`
- [x] `cargo check` で依存解決を確認

### フロントエンド依存関係
- [x] `bun add` で以下を追加
  - [x] `@tauri-apps/api` (v2)
  - [x] `zustand`
  - [x] `@uiw/react-codemirror`
  - [x] `@codemirror/lang-xml`
  - [x] `@tanstack/react-virtual`
- [x] `bun add -d` で以下を追加
  - [x] `tailwindcss` (v4)

### Tailwind CSS 設定
- [x] Tailwind CSS v4 を設定
- [x] グローバルスタイルに macOS ネイティブ風の CSS 変数を定義
- [x] システムフォント (`-apple-system`) を設定

### 基本レイアウト
- [x] `src/App.tsx` - サイドバー + メインコンテンツのレイアウト
- [x] `src/components/layout/Sidebar.tsx` - サイドバーシェル
- [x] `src/components/layout/MainContent.tsx` - メインコンテンツシェル
- [x] プレースホルダーコンテンツで表示確認

### ディレクトリ構造
- [x] `src/components/` 配下のディレクトリを作成
  - [x] `layout/`
  - [x] `service-list/`
  - [x] `service-detail/`
  - [x] `plist-editor/`
  - [x] `log-viewer/`
- [x] `src/hooks/` を作成
- [x] `src/lib/` を作成
- [x] `src/store/` を作成
- [x] `src-tauri/src/commands/` を作成
- [x] `src-tauri/src/models/` を作成

### 共通型定義
- [x] `src/lib/types.ts` - Service, ServiceStatus 等の TypeScript 型
- [x] `src/lib/commands.ts` - `invoke()` の型付きラッパー関数

### 動作確認
- [x] `bun run tauri dev` でアプリが起動する
- [x] サイドバー + メインコンテンツのレイアウトが表示される
- [x] ホットリロードが機能する

## 完了条件
- `bun run tauri dev` でアプリが起動し、基本レイアウトが表示される
- Rust/フロントエンドのコンパイルが通る
- ディレクトリ構造が整備されている
