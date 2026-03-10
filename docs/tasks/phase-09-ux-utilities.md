# Phase 9: UX ユーティリティ基盤

## 概要
UX改善の土台となるユーティリティモジュールとトースト通知コンポーネントを実装する。以降のPhase 10〜12で活用する共通基盤。

## 前提
- Phase 8 完了（全機能が動作する状態）

## 背景
競合アプリ調査の結果、以下の課題が判明:
- `StartInterval: 1800` などの技術用語がそのまま表示され、意味がわからない（Lingon Xは自然言語で表示）
- 操作結果がDetailPanel内にしか表示されず見逃しやすい（Docker Desktopはトースト通知）
- サービスの分類がなく一覧が把握しづらい

## タスク

### 人間にわかりやすい表示変換
- [x] `src/lib/humanize.ts` を作成
- [x] `humanizeRunSchedule(plistEntries)` 関数
  - [x] `RunAtLoad: true` → 「ログイン時に自動起動」/「Starts at login」
  - [x] `KeepAlive: true` → 「常時起動（クラッシュ時自動再起動）」/「Always running (auto-restart on crash)」
  - [x] `StartInterval: N` → 「N秒ごとに実行」を適切な単位に変換（60→「1分ごと」、3600→「1時間ごと」）
  - [x] `StartCalendarInterval` → 「毎日 15:00 に実行」「月曜〜金曜 9:00 に実行」等
  - [x] 複数条件の組み合わせ対応
- [x] `humanizeStatus(status, pid)` 関数
  - [x] Running → 「実行中 (PID: 1234)」/「Running (PID: 1234)」
  - [x] Stopped → 「停止中」/「Stopped」
  - [x] Error → 「エラー (終了コード: 1)」/「Error (exit code: 1)」
  - [x] NotLoaded → 「未読み込み」/「Not Loaded」
- [x] `humanizeProgram(program, programArguments)` 関数
  - [x] フルパスからコマンド名を抽出（`/usr/local/bin/node` → `node`）
  - [x] 引数を含めた短縮表示
- [x] i18n対応（locale引数で日英切替）

### サービスカテゴリ分類
- [x] `src/lib/categorize.ts` を作成
- [x] `categorizeService(label)` 関数
  - [x] `homebrew.mxcl.*` → `"homebrew"`
  - [x] `com.apple.*` → `"apple"`
  - [x] それ以外 → `"custom"`
- [x] `ServiceCategory` 型定義: `"all" | "homebrew" | "apple" | "custom"`
- [x] `getCategoryLabel(category, locale)` 関数
  - [x] all → 「すべて」/「All」
  - [x] homebrew → 「Homebrew」
  - [x] apple → 「Apple」
  - [x] custom → 「カスタム」/「Custom」
- [x] `getCategoryIcon(category)` 関数（絵文字 or テキストアイコン）

### plist キー説明辞書
- [x] `src/lib/plistHelp.ts` を作成
- [x] `getPlistKeyHelp(key, locale)` 関数
- [x] 主要キーの説明（日英）
  - [x] `Label` — サービスの一意な識別子。launchdがサービスを区別するために使用
  - [x] `Program` — 実行するプログラムのフルパス
  - [x] `ProgramArguments` — プログラムに渡す引数の配列。最初の要素はプログラム自体
  - [x] `RunAtLoad` — trueの場合、サービスがロードされた時（通常はログイン時）に自動的に起動
  - [x] `KeepAlive` — trueの場合、プロセスが終了しても自動的に再起動
  - [x] `StartInterval` — 指定秒数ごとにサービスを実行（例: 3600 = 1時間ごと）
  - [x] `StartCalendarInterval` — cron形式のスケジュールで実行日時を指定
  - [x] `WorkingDirectory` — プログラムの実行時の作業ディレクトリ
  - [x] `EnvironmentVariables` — プログラムに渡す環境変数
  - [x] `StandardOutPath` — 標準出力の書き出し先ファイルパス
  - [x] `StandardErrorPath` — 標準エラー出力の書き出し先ファイルパス
  - [x] `ThrottleInterval` — サービスの再起動間隔の最小秒数
  - [x] `WatchPaths` — 指定パスに変更があった時にサービスを起動
  - [x] `QueueDirectories` — 指定ディレクトリにファイルが追加された時にサービスを起動

### トースト通知コンポーネント
- [x] `src/components/ui/Toast.tsx` を作成
  - [x] トースト表示: 画面右下に固定配置
  - [x] 成功: 緑背景、チェックアイコン
  - [x] エラー: 赤背景、×アイコン
  - [x] 警告: 黄背景、!アイコン
  - [x] 自動消去: 成功は3秒、エラーは手動消去
  - [x] スタック表示: 複数トーストが重なる場合の配置
  - [x] フェードイン/アウトのアニメーション
- [x] `src/store/appState.ts` にトースト状態を追加
  - [x] `toasts: Toast[]` 配列
  - [x] `addToast(toast)` アクション
  - [x] `removeToast(id)` アクション
- [x] `Toast` 型定義
  - [x] `id: string`
  - [x] `type: "success" | "error" | "warning"`
  - [x] `message: string`
  - [x] `duration?: number`（ミリ秒、デフォルト3000）
- [x] `App.tsx` にトーストコンテナを配置

### i18n 翻訳キー追加
- [x] `src/lib/i18n.ts` に以下のキーを追加
  - [x] humanize関連の翻訳キー
  - [x] カテゴリラベルの翻訳キー
  - [x] トースト通知メッセージの翻訳キー

## 完了条件
- `humanizeRunSchedule()` が各種plist設定を自然言語に変換できる
- `categorizeService()` がLabel名からカテゴリを正しく判定する
- `getPlistKeyHelp()` が主要キーの説明を返す
- トースト通知が画面右下に表示・自動消去される
- 全ユーティリティがi18n対応（日英）している
