# Phase 0: 開発環境セットアップ

## 概要
Nix Flake による再現可能な開発環境を構築する。

## タスク

### flake.nix
- [x] `flake.nix` を作成
- [x] `inputs` に `nixpkgs` を設定
- [x] `devShells.default` を定義
  - [x] `rustup` を追加
  - [x] `bun` を追加
  - [x] `biome` を追加
  - [x] `pkg-config` を追加
  - [ ] `libiconv` を追加
  - [x] macOS SDK frameworks を追加 (WebKit, AppKit, Security, CoreServices, CoreFoundation)
- [x] `shellHook` を設定（RUSTUP_HOME 等の環境変数）
- [x] `nix develop` で開発シェルに入れることを確認

### rust-toolchain.toml
- [x] `rust-toolchain.toml` を作成
- [x] channel: `stable`
- [x] components: `rustfmt`, `clippy`
- [x] targets: `aarch64-apple-darwin`
- [x] `cargo --version` で自動インストールを確認

### Biome
- [x] `biome.json` を作成
- [x] formatter 設定（インデント、行幅等）
- [x] linter ルール設定
- [x] `biome check .` が実行できることを確認

### direnv (任意)
- [x] `.envrc` を作成 (`use flake`)
- [x] `.gitignore` に `.direnv/` を追加
- [x] `direnv allow` で自動有効化を確認

### .gitignore
- [x] `.gitignore` を作成
- [x] Node.js 関連 (`node_modules/`, `.bun/`)
- [x] Rust 関連 (`target/`)
- [x] Tauri 関連
- [x] Nix/direnv 関連 (`.direnv/`)
- [x] OS 関連 (`.DS_Store`)

## 完了条件
- `nix develop` で開発シェルに入り、`rustup`, `bun`, `biome` が利用可能
- `rust-toolchain.toml` に基づいて Rust stable がインストールされる
- `biome check` が実行できる
