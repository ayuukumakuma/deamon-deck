# アーキテクチャ

## 全体構成

Tauri v2 アプリケーションとして、Rust バックエンドと React フロントエンドの2層構成。

```
┌─────────────────────────────────────────────┐
│              React Frontend                  │
│  (TypeScript + Tailwind CSS + CodeMirror)    │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Service  │ │  Plist   │ │    Log       │ │
│  │  List    │ │  Editor  │ │   Viewer     │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │              │         │
│  ─────┼─────────────┼──────────────┼──────── │
│       │  invoke()   │   invoke()   │ Channel │
├───────┼─────────────┼──────────────┼─────────┤
│       ▼             ▼              ▼         │
│              Rust Backend                    │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ services │ │  plist   │ │    logs      │ │
│  │  .rs     │ │  .rs     │ │    .rs       │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │              │         │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴───────┐ │
│  │launchctl │  │ plist    │  │ file tail  │ │
│  │ command  │  │ crate    │  │ / notify   │ │
│  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────┘
         │              │             │
         ▼              ▼             ▼
    launchctl     ~/Library/     ログファイル
                  LaunchAgents/
```

## Rust バックエンド

### モジュール構成

```
src-tauri/src/
├── main.rs                  # エントリポイント
├── lib.rs                   # Tauri builder, コマンド登録
├── error.rs                 # カスタムエラー型 (thiserror)
├── commands/
│   ├── mod.rs
│   ├── services.rs          # サービス一覧・ステータス取得
│   ├── launchctl.rs         # サービス制御 (start/stop/load/unload)
│   ├── plist.rs             # plist読み書き・バリデーション
│   └── logs.rs              # ログストリーミング
├── models/
│   ├── mod.rs
│   ├── service.rs           # Service, ServiceStatus
│   └── plist_data.rs        # PlistValue, PlistDocument
└── watcher.rs               # ファイルシステム監視
```

### commands/services.rs

サービス一覧の取得とステータス解決を担当。

- `~/Library/LaunchAgents/*.plist` をスキャンし、`plist` クレートで各ファイルをパース
- `launchctl list` の出力（タブ区切り: `PID\tStatus\tLabel`）をパースし、各サービスのステータスを判定
  - PID が `-` でない → **Running**
  - Status が非ゼロ → **Error**
  - それ以外 → **Stopped**
  - plist はあるが `launchctl list` に存在しない → **Not Loaded**

### commands/launchctl.rs

`std::process::Command` 経由で launchctl を実行。

- modern API (`bootstrap`/`bootout`/`kickstart`) を優先使用
- 失敗時は legacy API (`load`/`unload`/`start`/`stop`) にフォールバック
- UID は `users::get_current_uid()` で取得し、`gui/{uid}` ドメインを使用

### commands/plist.rs

`plist` クレートで .plist ファイルの読み書き。

- XML/バイナリ両形式の読み取りに対応
- 書き込みは常に XML 形式（人間が読みやすい）
- 保存前に元ファイルのバックアップを作成（`.plist.bak`）
- バリデーション: `Label` 必須チェック、型チェック

### commands/logs.rs

Tauri Channel を使ったプッシュ型ログストリーミング。

- plist の `StandardOutPath`/`StandardErrorPath` から対象ファイルを特定
- `notify` クレートでファイル変更を監視し、差分を Channel で送信
- ログパスが未設定の場合は `log stream --predicate` コマンドで代替

### watcher.rs

`notify` クレートで `~/Library/LaunchAgents/` ディレクトリを監視。

- ファイルの作成/変更/削除を検知
- Tauri のグローバルイベント (`services-changed`) をフロントエンドに送信
- Tauri の `setup` フックで初期化

## React フロントエンド

### コンポーネント構成

```
src/
├── main.tsx
├── App.tsx                          # ルートレイアウト
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # サイドバー（サービス一覧 + 検索）
│   │   ├── MainContent.tsx          # メインコンテンツエリア
│   │   └── TitleBar.tsx             # カスタムタイトルバー
│   ├── service-list/
│   │   ├── ServiceTable.tsx         # サービステーブル
│   │   ├── ServiceRow.tsx           # 個別サービス行
│   │   └── StatusBadge.tsx          # ステータスインジケータ
│   ├── service-detail/
│   │   ├── DetailPanel.tsx          # 詳細パネル（タブ切替）
│   │   ├── ServiceActions.tsx       # 操作ボタン群
│   │   └── ServiceInfo.tsx          # サービスメタデータ
│   ├── plist-editor/
│   │   ├── PlistEditor.tsx          # エディタ（構造化/raw切替）
│   │   ├── PlistField.tsx           # フォームフィールド
│   │   └── RawXmlEditor.tsx         # CodeMirrorラッパー
│   └── log-viewer/
│       ├── LogViewer.tsx            # ログ表示（仮想スクロール）
│       └── LogLine.tsx              # ログ行
├── hooks/
│   ├── useServices.ts               # サービス一覧 + ポーリング
│   ├── useServiceStatus.ts          # ステータス取得
│   ├── usePlistEditor.ts            # plist読み書きロジック
│   ├── useLogStream.ts              # Channelベースログ受信
│   └── useTheme.ts                  # ダークモード検出
├── lib/
│   ├── commands.ts                  # invoke() 型付きラッパー
│   └── types.ts                     # 共有型定義
└── store/
    └── appState.ts                  # Zustand ストア
```

### 状態管理 (Zustand)

```typescript
interface AppState {
  services: Service[];
  selectedServiceLabel: string | null;
  activeTab: 'detail' | 'editor' | 'logs';
  filter: string;
}
```

## データフロー

| 操作 | 方式 | 詳細 |
|------|------|------|
| サービス一覧取得 | Request-Response | `invoke('list_services')` → 5秒ポーリング |
| サービス操作 | Request-Response | `invoke('start_service')` 等 |
| plist読み書き | Request-Response | `invoke('read_plist')` / `invoke('write_plist')` |
| ログストリーム | Push (Channel) | Rust → Channel → React |
| FS変更通知 | Push (Event) | `notify` → Tauri Event → React |

## Tauri v2 権限設定

`capabilities/default.json` で以下のスコープを設定:
- ファイルシステム: `~/Library/LaunchAgents/` への読み書き
- launchctl 等のシステムコマンドは Rust バックエンドの `std::process::Command` で実行（shell plugin 不要）

## 主要ライブラリ

### Rust

| クレート | バージョン | 用途 |
|---------|-----------|------|
| `tauri` | v2 | アプリケーションフレームワーク |
| `plist` | 1.7+ | plist 読み書き |
| `notify` | 7+ | ファイルシステム監視 |
| `dirs` | latest | ホームディレクトリ解決 |
| `thiserror` | latest | エラー型定義 |
| `serde` / `serde_json` | latest | シリアライズ |

### フロントエンド

| パッケージ | 用途 |
|-----------|------|
| `@tauri-apps/api` v2 | Tauri API |
| `@uiw/react-codemirror` + `@codemirror/lang-xml` | XML エディタ |
| `zustand` | 状態管理 |
| `@tanstack/react-virtual` | 仮想スクロール |
| `tailwindcss` v4 | スタイリング |
