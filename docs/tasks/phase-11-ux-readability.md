# Phase 11: 情報の可読性向上

## 概要
サービス情報とplistエディタの表示を改善し、launchdの専門知識がなくても内容を理解できるようにする。

## 前提
- Phase 10 完了（インライン操作ボタン・コンテキストメニューが動作する状態）

## 背景
- Lingon Xはスケジュール設定を「Runs every day at 3:00 PM」のように自然言語で表示
- LaunchControlやLingon Xにないplistキーのコンテキストヘルプは差別化要素になる
- 現状のServiceInfoは生データの羅列で、重要な情報が埋もれている

## タスク

### ServiceInfo のサマリーセクション追加
- [x] `src/components/service-detail/ServiceInfo.tsx` を修正
- [x] 詳細データ一覧の上にサマリーカードを追加
  - [x] ステータス: `humanizeStatus()` で表示（大きめフォント、ステータスカラー付き）
  - [x] スケジュール: `humanizeRunSchedule()` で表示（例: 「30分ごとに実行・ログイン時に自動起動」）
  - [x] コマンド: `humanizeProgram()` で表示（例: `node server.js`）
- [x] サマリーカードのスタイル
  - [x] 背景色で区別（サイドバー色に近い控えめな色）
  - [x] アイコン + テキストのレイアウト
  - [x] ダークモード対応

### ServiceRow のサブテキスト改善
- [x] `src/components/service-list/ServiceRow.tsx` を修正
- [x] 既存のProgram表示を `humanizeProgram()` に置き換え
  - [x] フルパス → コマンド名のみ（例: `/usr/local/bin/node` → `node`）
- [x] スケジュール情報を追加表示（スペースに余裕があれば）
  - [x] 例: 「node · 30分ごとに実行」
  - [x] 例: 「brew · ログイン時に自動起動」
  - [x] テキストが長い場合はtruncate

### Plist エディタのコンテキストヘルプ
- [x] `src/components/plist-editor/PlistField.tsx` を修正
- [x] フィールド名の右にinfoアイコン（ℹ）を追加
  - [x] `getPlistKeyHelp()` で説明が存在するキーのみ表示
  - [x] ホバーでツールチップ表示
- [x] ツールチップのスタイル
  - [x] 最大幅 300px
  - [x] 半透明の暗い背景
  - [x] フィールド名の近くにアロー付きで表示
  - [x] ダークモード対応
- [x] ツールチップの実装方式
  - [x] CSS の `position: relative` + `position: absolute` で配置
  - [x] `onMouseEnter` / `onMouseLeave` で表示切替
  - [x] 遅延表示（300ms）で意図しない表示を防止

### Plist エディタの構造化フォーム見出し改善
- [x] `src/components/plist-editor/PlistEditor.tsx` を修正
- [x] 主要キーをカテゴリでグループ化して表示
  - [x] 「基本設定」: Label, Program, ProgramArguments, WorkingDirectory
  - [x] 「実行条件」: RunAtLoad, KeepAlive, StartInterval, StartCalendarInterval
  - [x] 「ログ」: StandardOutPath, StandardErrorPath
  - [x] 「環境」: EnvironmentVariables
  - [x] 「その他」: 上記以外のキー
- [x] グループ見出しのスタイル
  - [x] 太字 + 区切り線
  - [x] 折りたたみ可能（デフォルトは展開）

### i18n 翻訳キー追加
- [x] `src/lib/i18n.ts` に以下のキーを追加
  - [x] サマリーセクションのラベル
  - [x] plistグループ見出し（「基本設定」「実行条件」「ログ」「環境」「その他」）

## 完了条件
- ServiceInfoの上部に人間にわかりやすいサマリーが表示される
- ServiceRowのサブテキストがコマンド名の短縮表示になっている
- plistエディタのフィールドにinfoアイコンがあり、ホバーで説明が表示される
- plistエディタのフィールドがカテゴリごとにグループ化されている
- 全表示がi18n対応（日英）している
