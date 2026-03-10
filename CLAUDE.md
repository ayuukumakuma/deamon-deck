# CLAUDE.md

## プロジェクト概要

Daemon Deck — macOSのlaunchdサービス(`~/Library/LaunchAgents/`)をGUIで管理するデスクトップアプリ。sudo不要のユーザーエージェント管理ツール。

## 技術スタック

- **フレームワーク**: Tauri v2 (Rust backend + React frontend)
- **フロントエンド**: React + TypeScript, Zustand (状態管理), Tailwind CSS v4, CodeMirror (XMLエディタ)
- **バックエンド**: Rust
- **パッケージマネージャ**: Bun
- **リント/フォーマット**: Biome (JS/TS), cargo clippy + cargo fmt (Rust)
- **型チェック**: tsgo
- **開発環境**: Nix Flake + direnv

## コマンド

```bash
# 開発環境
nix develop                        # 開発シェルに入る
bun install                        # JS依存インストール

# 開発・ビルド
bun run tauri dev                  # 開発サーバー起動 (ホットリロード)
bun run tauri build                # プロダクションビルド

# リント・フォーマット
bun run biome check .              # JS/TSのリント・フォーマットチェック
bun run biome check --write .      # 自動修正
cargo clippy                       # Rustリント
cargo fmt                          # Rustフォーマット
cargo check                        # Rustコンパイルチェック
```

## アーキテクチャ

詳細は @docs/architecture.md を参照。

## 開発フェーズ: **絶対遵守**

- ファイルの編集が終わったら `code-simplifier` スキルを使用して簡素化を行うこと。
- セッション内での実装がすべて終わったら `simplify` スキルを使用して変更のあったコード全体を対象に簡素化を行うこと。
- 実装が完了したら完了報告をする前にレビュー用の別エージェントを起動してプラン通りに実装されているかを確認すること。
- @docs/tasks のファイルを渡されている場合はチェック項目を確認して満たしている場合はチェックボックスを更新すること。


