# Daemon Deck

macOS の launchd サービスを GUI で管理するデスクトップアプリケーション。

## 概要

`~/Library/LaunchAgents` 配下のユーザー LaunchAgent を、ターミナルを使わずに一覧表示・操作・編集できるネイティブアプリケーション。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Tauri v2 |
| フロントエンド | React + TypeScript |
| バックエンド | Rust |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS v4 |
| コードエディタ | CodeMirror (XML) |
| パッケージマネージャ | Bun |
| Lint/Format | Biome |
| 型チェック | tsgo |
| 開発環境 | Nix Flake |
| Rust管理 | rustup (Nix経由) + rust-toolchain.toml |

## 主要機能

1. **サービス一覧・ステータス表示** - 登録済みサービスの一覧と実行状態 (running/stopped/error) の確認
2. **サービス制御** - start/stop/restart/load/unload 操作
3. **Plist エディタ** - サービス定義ファイル (.plist) の GUI 編集 + raw XML 編集
4. **ログビューア** - サービスの stdout/stderr ログのリアルタイム表示

## 対象範囲

- `~/Library/LaunchAgents` 配下のユーザーエージェントのみ
- sudo 権限不要

## ドキュメント

- [アーキテクチャ](./architecture.md)
- [機能仕様](./features.md)
- [開発環境セットアップ](./setup.md)
- [タスク一覧](./tasks/)
