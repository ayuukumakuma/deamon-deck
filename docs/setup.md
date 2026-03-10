# 開発環境セットアップ

## 前提条件

- macOS (Apple Silicon or Intel)
- [Nix](https://nixos.org/download/) がインストール済み
  - Flakes が有効になっていること (`experimental-features = nix-command flakes`)
- (任意) [direnv](https://direnv.net/) + [nix-direnv](https://github.com/nix-community/nix-direnv)

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/ayuukumakuma/deamon-deck.git
cd deamon-deck
```

### 2. 開発シェルに入る

```bash
nix develop
```

これにより以下のツールが利用可能になる:
- `rustup` (Rust ツールチェーン管理)
- `bun` (JavaScript パッケージマネージャ/ランタイム)
- `biome` (lint/format)
- macOS SDK フレームワーク (WebKit, AppKit, Security 等)

### 3. Rust ツールチェーンのセットアップ

`rust-toolchain.toml` に基づいて rustup が自動的にツールチェーンをインストールする:

```bash
# 初回は自動インストールが走る
cargo --version
```

### 4. フロントエンド依存関係のインストール

```bash
bun install
```

### 5. 開発サーバーの起動

```bash
bun run tauri dev
```

### direnv を使う場合

`.envrc` が設定済みであれば、ディレクトリに入るだけで自動的に開発シェルが有効になる:

```bash
direnv allow
cd deamon-deck  # 自動で nix develop 相当の環境が有効化
```

## Nix Flake の構成

### devShell が提供するもの

| ツール | 用途 |
|--------|------|
| `rustup` | Rust ツールチェーン管理 (stable, rustfmt, clippy) |
| `bun` | JS パッケージマネージャ/ランタイム |
| `biome` | TypeScript/JavaScript の lint + format |
| `pkg-config` | ビルド時のライブラリ検索 |
| `libiconv` | 文字コード変換ライブラリ |
| Apple SDK Frameworks | WebKit, AppKit, Security, CoreServices 等 |

### rust-toolchain.toml

```toml
[toolchain]
channel = "stable"
components = ["rustfmt", "clippy"]
targets = ["aarch64-apple-darwin"]
```

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `bun run tauri dev` | 開発サーバー起動（ホットリロード） |
| `bun run tauri build` | プロダクションビルド |
| `bun run biome check .` | lint + format チェック |
| `bun run biome check --write .` | lint + format 自動修正 |
| `cargo check` | Rust コンパイルチェック |
| `cargo clippy` | Rust lint |
| `cargo fmt` | Rust フォーマット |

## トラブルシューティング

### `nix develop` が遅い場合
- バイナリキャッシュを有効にする: `substituters = https://cache.nixos.org`
- direnv + nix-direnv を使うとキャッシュが効いて高速化される

### Tauri ビルドエラー (macOS SDK)
- Xcode Command Line Tools がインストールされていることを確認: `xcode-select --install`
- Nix の Apple SDK フレームワークが正しく提供されているか確認

### rustup がツールチェーンをインストールしない場合
- `rustup show` で現在の状態を確認
- `rustup toolchain install stable` で手動インストール
