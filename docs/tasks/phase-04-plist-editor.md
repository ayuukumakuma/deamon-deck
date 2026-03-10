# Phase 4: Plist エディタ

## 概要
サービス定義ファイル (.plist) を GUI で閲覧・編集できるエディタを実装する。

## 前提
- Phase 3 完了（サービス制御が動作する状態）

## タスク

### Rust: plist モデル
- [x] `src-tauri/src/models/plist_data.rs` を作成
  - [x] `PlistValue` enum: String, Integer, Real, Boolean, Array, Dict, Data, Date
  - [x] `PlistDocument` struct: キーと値のマップ
  - [x] `serde::Serialize` / `Deserialize` を derive

### Rust: plist コマンド
- [x] `src-tauri/src/commands/plist.rs` を作成
- [x] `read_plist(path: String)` コマンド
  - [x] `plist` クレートで読み取り（XML/バイナリ両対応）
  - [x] `PlistDocument` として返却
- [x] `write_plist(path: String, data: PlistDocument)` コマンド
  - [x] 書き込み前にバックアップ作成 (`.plist.bak`)
  - [x] XML 形式で書き出し
- [x] `validate_plist(data: PlistDocument)` コマンド
  - [x] `Label` キーの存在チェック（必須）
  - [x] `Label` が空文字でないことを確認
  - [x] 型の整合性チェック
  - [x] バリデーション結果をエラーリストとして返却
- [x] `create_plist(data: PlistDocument)` コマンド
  - [x] `~/Library/LaunchAgents/{label}.plist` として新規作成
  - [x] 同名ファイルが存在する場合はエラー
- [x] 全コマンドを Tauri コマンドとして登録

### フロントエンド: コマンドラッパー
- [x] `src/lib/commands.ts` に以下を追加
  - [x] `readPlist(path)`
  - [x] `writePlist(path, data)`
  - [x] `validatePlist(data)`
  - [x] `createPlist(data)`
- [x] `src/lib/types.ts` に `PlistValue`, `PlistDocument` 型を追加

### フロントエンド: hooks
- [x] `src/hooks/usePlistEditor.ts` を作成
  - [x] plist 読み込み状態管理
  - [x] 編集中データの管理
  - [x] 変更検知（dirty フラグ）
  - [x] 保存処理（バリデーション → 書き込み）
  - [x] 「保存 & リロード」処理（書き込み → bootout → bootstrap）

### フロントエンド: 構造化フォーム
- [x] `src/components/plist-editor/PlistEditor.tsx`
  - [x] 構造化モード / raw XML モードの切替トグル
  - [x] 保存ボタン、保存 & リロードボタン
  - [x] 未保存変更の警告
- [x] `src/components/plist-editor/PlistField.tsx`
  - [x] 各フィールドタイプに対応した入力コンポーネント
  - [x] String → テキスト入力
  - [x] Boolean → トグルスイッチ
  - [x] Integer → 数値入力
  - [x] Array<String> → リスト入力（追加/削除/並び替え）
  - [x] Dict → キー/値ペアのフォーム
- [x] 主要 launchd キーのフォーム
  - [x] `Label` (String, 必須、読み取り専用 on 編集時)
  - [x] `Program` (String)
  - [x] `ProgramArguments` (Array<String>)
  - [x] `RunAtLoad` (Boolean)
  - [x] `KeepAlive` (Boolean)
  - [x] `StartInterval` (Integer)
  - [x] `StartCalendarInterval` (Dict)
  - [x] `WorkingDirectory` (String)
  - [x] `EnvironmentVariables` (Dict<String, String>)
  - [x] `StandardOutPath` (String)
  - [x] `StandardErrorPath` (String)
- [x] 「その他のプロパティ」セクション
  - [x] 未知のキーをキー/値ペアとして表示
  - [x] 新規プロパティ追加機能

### フロントエンド: Raw XML エディタ
- [x] `src/components/plist-editor/RawXmlEditor.tsx`
  - [x] CodeMirror エディタのラッパー
  - [x] XML シンタックスハイライト
  - [x] 構造化モードとのデータ同期
  - [x] XML パースエラーの表示

### フロントエンド: 新規サービス作成
- [x] 「新規サービス」ボタン（サイドバー上部）
- [x] 作成ダイアログ / フォーム
  - [x] Label 入力（必須）
  - [x] ProgramArguments 入力
  - [x] RunAtLoad チェックボックス
- [x] テンプレートベースの最小限 plist 生成
- [x] 作成後に自動で load

### フロントエンド: DetailPanel 更新
- [x] `DetailPanel.tsx` の Editor タブに PlistEditor を配置
- [x] タブ切替時に plist を読み込み

## 完了条件
- サービス選択 → Editor タブで plist の内容が構造化フォームで表示される
- フォームで値を変更 → 保存で plist ファイルが更新される
- raw XML モードに切り替えて直接編集できる
- 「保存 & リロード」でサービスが自動的に再読み込みされる
- 新規サービスを作成して Load できる
- バリデーションエラーが分かりやすく表示される
