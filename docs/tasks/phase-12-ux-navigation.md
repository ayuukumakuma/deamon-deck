# Phase 12: ナビゲーション・検索の改善

## 概要
サービスのカテゴリフィルター、ウェルカム画面の改善、ログビューアの検索機能を実装し、情報へのアクセス性を向上させる。

## 前提
- Phase 11 完了（情報の可読性が向上した状態）

## タスク

### サービスカテゴリフィルター
- [x] `src/store/appState.ts` を修正
  - [x] `categoryFilter: ServiceCategory` 状態を追加（デフォルト: `"all"`）
  - [x] `setCategoryFilter(category)` アクションを追加
- [x] `src/components/layout/Sidebar.tsx` を修正
  - [x] 検索バーの下にフィルターチップを配置
  - [x] チップ: All / Homebrew / Apple / Custom
  - [x] 各チップにサービス数を表示（例: 「Homebrew (5)」）
  - [x] 選択中のチップはアクセントカラーで強調
- [x] `src/components/service-list/ServiceTable.tsx` を修正
  - [x] テキスト検索フィルターに加え、カテゴリフィルターを適用
  - [x] `categorizeService()` でフィルタリング
- [x] フィルターチップのスタイル
  - [x] 水平スクロール（チップが多い場合）
  - [x] コンパクトなピル型デザイン
  - [x] ダークモード対応

### ウェルカム画面の改善
- [x] `src/components/service-detail/WelcomePanel.tsx` を新規作成
- [x] サービスサマリーカード
  - [x] ステータス別の数を表示（Running: N, Stopped: N, Error: N, Not Loaded: N）
  - [x] 各ステータスのカラーアイコン付き
  - [x] エラーがある場合は目立つ警告表示
- [x] クイックアクションセクション
  - [x] 「新しいサービスを作成」ボタン（既存のCreateServiceDialogを開く）
  - [x] 「サービスフォルダを開く」ボタン（~/Library/LaunchAgents/ をFinderで開く）
- [x] キーボードショートカット一覧
  - [x] `Cmd+N` — 新規サービス作成
  - [x] `Cmd+F` — サービス検索
  - [x] `Cmd+R` — リフレッシュ
  - [x] `↑` / `↓` — サービス選択
  - [x] `Cmd+S` — Plist 保存
- [x] `src/components/service-detail/DetailPanel.tsx` を修正
  - [x] サービス未選択時のウェルカムメッセージをWelcomePanelに置き換え

### ログビューアの検索機能
- [x] `src/components/log-viewer/LogViewer.tsx` を修正
- [x] 検索バー
  - [x] `Cmd+F` でログビューア内に検索バーを表示/非表示
  - [x] テキスト入力フィールド + マッチ数表示（「3/15」形式）
  - [x] 前へ (↑) / 次へ (↓) ナビゲーションボタン
  - [x] `Enter` で次のマッチへ、`Shift+Enter` で前のマッチへ
  - [x] `Escape` で検索バーを閉じ
- [x] 検索ロジック
  - [x] 大文字小文字を区別しない検索（トグルで切替可能）
  - [x] マッチした行のハイライト表示（背景色変更）
  - [x] 現在フォーカス中のマッチは別色でハイライト
  - [x] 仮想スクロールとの連携（マッチ行に自動スクロール）
- [x] `src/components/log-viewer/LogLine.tsx` を修正
  - [x] マッチ部分のテキストをハイライト表示（`<mark>` タグ）
  - [x] 現在のマッチ / 他のマッチで異なるハイライト色

### i18n 翻訳キー追加
- [x] `src/lib/i18n.ts` に以下のキーを追加
  - [x] フィルターチップラベル
  - [x] ウェルカム画面テキスト
  - [x] ログ検索プレースホルダー・ラベル

## 完了条件
- フィルターチップでカテゴリ別にサービスを絞り込める
- フィルターチップにカテゴリ別のサービス数が表示される
- テキスト検索とカテゴリフィルターが組み合わせて動作する
- サービス未選択時にウェルカム画面が表示される
- ウェルカム画面にサービスサマリーとクイックアクションがある
- ログビューアで `Cmd+F` 検索ができる
- マッチ行のハイライトと前後ナビゲーションが動作する
