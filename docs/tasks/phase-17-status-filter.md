# Phase 17: ステータスクリックでフィルター

## 概要
ホーム画面（WelcomePanel）のステータスサマリーカードをクリック可能にし、クリックしたステータスでサイドバーのサービスリストをフィルターする。同じステータスを再クリックするとフィルター解除（トグル動作）。フィルター適用後もホーム画面は維持する。

## 前提
- Phase 16 完了

## タスク

### Zustand ストア — ステータスフィルター状態
- [x] `src/store/appState.ts` を修正
  - [x] `statusFilter: ServiceStatus | null` 状態を追加（デフォルト: `null` = フィルターなし）
  - [x] `setStatusFilter(status: ServiceStatus | null)` アクションを追加
- [x] `src/lib/types.ts` の `ServiceStatus` 型を再利用

### WelcomePanel — クリックハンドラ
- [x] `src/components/service-detail/WelcomePanel.tsx` を修正
  - [x] ステータスカードに `onClick` ハンドラを追加
  - [x] クリック時: 現在の `statusFilter` と同じなら `null`（解除）、異なれば該当ステータスを設定
  - [x] 選択中のカードに視覚的フィードバック
    - [x] ボーダーをアクセントカラーまたはステータスカラーに変更
    - [x] 背景色を薄く変更
  - [x] カーソルを `pointer` に変更
  - [x] 未選択カードとのコントラストを明確にする

### ServiceTable — ステータスフィルター適用
- [x] `src/components/service-list/ServiceTable.tsx` を修正
  - [x] 既存のフィルタリングロジック（テキスト検索 + カテゴリフィルター）に `statusFilter` を追加
  - [x] `statusFilter` が `null` 以外の場合、該当ステータスのサービスのみ表示
  - [x] 3つのフィルター（テキスト、カテゴリ、ステータス）は AND 条件で結合

### i18n（必要な場合）
- [x] `src/lib/i18n.ts` に翻訳キーを追加
  - [x] `welcome.filterByStatus` — フィルター適用中の表示テキスト（例:「{status} でフィルター中」）

### フィルター解除の整合性
- [x] サービスを選択した際に `statusFilter` をクリアするかは任意（維持する方が自然）
- [x] カテゴリフィルターチップの「All」クリック時に `statusFilter` もリセットするか検討

## 完了条件
- WelcomePanel のステータスカードをクリックするとサイドバーのリストが該当ステータスでフィルターされる
- 同じステータスカードを再クリックするとフィルターが解除される
- フィルター適用中のカードが視覚的に区別できる
- フィルター適用後もホーム画面（WelcomePanel）が維持される
- テキスト検索・カテゴリフィルターとの AND 条件が正常動作する
- ステータスフィルター適用中にサービス数が 0 件でも正常表示される

## 検証
- [x] `cargo check` — Rust コンパイル確認（変更なしのためスキップ）
- [x] `bun run biome check .` — フロントエンドリント
- [x] 手動テスト
  - [x] Running カードクリック → Running サービスのみ表示
  - [x] Running カード再クリック → フィルター解除、全サービス表示
  - [x] Stopped カードクリック → Stopped サービスのみ表示
  - [x] ステータスフィルター + テキスト検索の組み合わせが動作する
  - [x] ステータスフィルター + カテゴリフィルターの組み合わせが動作する
  - [x] フィルター適用中にホーム画面が維持される
  - [x] 選択中カードのスタイルがダークモード/ライトモードで適切
