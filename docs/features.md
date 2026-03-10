# 機能仕様

## 1. サービス一覧・ステータス表示

### 概要
`~/Library/LaunchAgents/` 配下の全 .plist ファイルを読み取り、登録されているサービスの一覧と実行状態を表示する。

### 表示項目
| 項目 | 説明 |
|------|------|
| Label | サービスの一意識別子（plist の `Label` キー） |
| Status | 実行状態（Running / Stopped / Error / Not Loaded） |
| Program | 実行されるプログラム（`Program` or `ProgramArguments[0]`） |
| PID | 実行中の場合のプロセスID |
| RunAtLoad | ログイン時自動起動の有無 |

### ステータス判定ロジック
- `launchctl list` の出力をパース
  - PID 列が数値 → **Running** (緑)
  - Status 列が非ゼロ → **Error** (赤)
  - PID が `-` かつ Status が `0` → **Stopped** (グレー)
- plist ファイルはあるが `launchctl list` に存在しない → **Not Loaded** (黄)

### 更新方式
- 5秒間隔のポーリング
- `~/Library/LaunchAgents/` のファイル変更イベントで即時リフレッシュ

### UI
- サイドバーにサービス一覧をテーブル表示
- 検索/フィルター入力でラベル名による絞り込み
- ステータスによるフィルタリング
- クリックでサービス選択 → 詳細パネル表示

---

## 2. サービス制御

### 操作一覧
| 操作 | launchctl コマンド (modern) | fallback (legacy) |
|------|---------------------------|-------------------|
| Load | `bootstrap gui/{uid} {path}` | `load {path}` |
| Unload | `bootout gui/{uid}/{label}` | `unload {path}` |
| Start | `kickstart gui/{uid}/{label}` | `start {label}` |
| Stop | `kill SIGTERM gui/{uid}/{label}` | `stop {label}` |
| Restart | Stop → Start | Stop → Start |
| Enable | `enable gui/{uid}/{label}` | - |
| Disable | `disable gui/{uid}/{label}` | - |

### UI
- 詳細パネル上部に操作ボタンを配置
- サービスの状態に応じてボタンを有効/無効化
  - Running: Stop, Restart が有効
  - Stopped: Start が有効
  - Not Loaded: Load が有効
- 操作中はローディング表示
- 操作失敗時はエラー通知を表示
- 操作完了後にサービス一覧を自動リフレッシュ

---

## 3. Plist エディタ

### 概要
サービス定義ファイル (.plist) を GUI で編集できるエディタ。構造化フォームモードと raw XML モードを切り替え可能。

### 構造化フォームモード
以下の launchd.plist(5) の主要キーをフォームフィールドとして提供:

| キー | 型 | 説明 |
|------|------|------|
| `Label` | String | サービス識別子（必須） |
| `Program` | String | 実行プログラムのパス |
| `ProgramArguments` | Array<String> | 実行コマンドと引数 |
| `RunAtLoad` | Boolean | ログイン時自動起動 |
| `KeepAlive` | Boolean/Dict | 常時起動維持 |
| `StartInterval` | Integer | 定期実行間隔（秒） |
| `StartCalendarInterval` | Dict | カレンダーベースの実行スケジュール |
| `WorkingDirectory` | String | 作業ディレクトリ |
| `EnvironmentVariables` | Dict | 環境変数 |
| `StandardOutPath` | String | stdout 出力先ファイル |
| `StandardErrorPath` | String | stderr 出力先ファイル |
| `UserName` | String | 実行ユーザー |

未知のキーは「その他のプロパティ」セクションにキー/値ペアとして表示。

### Raw XML モード
- CodeMirror エディタで plist XML を直接編集
- XML シンタックスハイライト
- 構造化モードとの切り替え時にデータ同期

### 保存
- 保存前にバリデーション実行（`Label` 必須チェック等）
- 保存時に元ファイルの `.bak` バックアップを作成
- 「保存 & リロード」アクション: 保存後に自動で `bootout` → `bootstrap` を実行

### 新規サービス作成
- テンプレートから最小限の plist を生成
- `Label`, `ProgramArguments` を入力するウィザード
- `~/Library/LaunchAgents/{label}.plist` として保存

---

## 4. ログビューア

### 概要
選択中のサービスの stdout/stderr ログをリアルタイムで表示する。

### ログ取得方法

#### 方法 1: ファイルベース（優先）
- plist の `StandardOutPath` / `StandardErrorPath` で指定されたファイルを監視
- `notify` クレートでファイル変更を検知し、差分を読み取り
- Tauri Channel 経由でフロントエンドにプッシュ

#### 方法 2: システムログ（フォールバック）
- ログパスが未設定の場合は `log stream --predicate` コマンドで取得
- プロセス名ベースのフィルタリング

### UI
- 自動スクロール（最新のログが常に表示される）
- 一時停止トグル（スクロールを止めてログを確認）
- クリアボタン（表示をリセット）
- stdout / stderr の色分け表示
- 仮想スクロール（大量のログ行でもパフォーマンス維持）

---

## UI デザイン

### レイアウト
```
┌──────────────────────────────────────────────┐
│  ◉ ◉ ◉   Daemon Deck              (titlebar)│
├──────────┬───────────────────────────────────┤
│          │                                   │
│ [検索]   │  Service Detail                   │
│          │  ┌──────┬────────┬──────┐         │
│ service1 │  │ Info │ Editor │ Logs │         │
│ service2 │  ├──────┴────────┴──────┤         │
│ service3 │  │                      │         │
│ service4 │  │  [Start] [Stop]      │         │
│ ...      │  │  [Restart]           │         │
│          │  │                      │         │
│          │  │  Label: xxx          │         │
│          │  │  Program: /usr/...   │         │
│          │  │  Status: Running     │         │
│          │  │                      │         │
├──────────┴──┴──────────────────────┴─────────┤
│                                              │
└──────────────────────────────────────────────┘
```

### テーマ
- macOS ネイティブ風デザイン
- システムフォント (`-apple-system, BlinkMacSystemFont`)
- `prefers-color-scheme` でダーク/ライトモード自動切替
- Tauri window vibrancy でサイドバーの半透明効果
