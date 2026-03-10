import { useCallback, useMemo } from "react";
import { useAppState } from "../store/appState";

export type Locale = "en" | "ja";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Sidebar
    "sidebar.services": "Services",
    "sidebar.search": "Search services...",
    "sidebar.newService": "New Service",
    "sidebar.settings": "Settings",
    "sidebar.noMatch": "No matching services.",
    "sidebar.noServices": "No LaunchAgent services found.",
    "sidebar.createHint": "Press Cmd+N to create one.",

    // DetailPanel
    "detail.info": "Info",
    "detail.editor": "Editor",
    "detail.logs": "Logs",
    "detail.welcome": "Daemon Deck",
    "detail.selectService": "Select a service from the sidebar to get started.",
    "detail.createHint": "Cmd+N to create a new service",

    // StatusBadge
    "status.Running": "Running",
    "status.Stopped": "Stopped",
    "status.Error": "Error",
    "status.NotLoaded": "Not Loaded",

    // CreateServiceDialog
    "create.title": "New Service",
    "create.label": "Label",
    "create.program": "Program",
    "create.programHelp": "Space-separated command and arguments",
    "create.runAtLoad": "Run at Load",
    "create.cancel": "Cancel",
    "create.create": "Create",
    "create.creating": "Creating...",
    "create.labelRequired": "Label is required",
    "create.programRequired": "Program is required",
    "create.labelPlaceholder": "com.example.myservice",
    "create.programPlaceholder": "/usr/local/bin/myapp --flag",

    // ServiceActions
    "action.start": "Start",
    "action.stop": "Stop",
    "action.restart": "Restart",
    "action.load": "Load",
    "action.unload": "Unload",
    "action.delete": "Delete",

    // Delete confirmation
    "delete.title": "Delete Service",
    "delete.message": 'Are you sure you want to delete "{label}"?',
    "delete.confirm": "Delete",
    "delete.cancel": "Cancel",
    "delete.deleting": "Deleting...",
    "delete.backupOption": "Create backup before deletion",

    // ServiceInfo
    "info.label": "Label",
    "info.status": "Status",
    "info.pid": "PID",
    "info.lastExitStatus": "Last Exit Status",
    "info.program": "Program",
    "info.runAtLoad": "Run at Load",
    "info.yes": "Yes",
    "info.no": "No",
    "info.plistPath": "Plist Path",
    "info.stdoutPath": "Stdout Path",
    "info.stderrPath": "Stderr Path",

    // Category
    "category.all": "All",
    "category.homebrew": "Homebrew",
    "category.apple": "Apple",
    "category.custom": "Custom",

    // Humanize
    "humanize.runAtLoad": "Starts at login",
    "humanize.keepAlive": "Always running (auto-restart on crash)",
    "humanize.statusRunning": "Running",
    "humanize.statusRunningPid": "Running (PID: {pid})",
    "humanize.statusStopped": "Stopped",
    "humanize.statusError": "Error",
    "humanize.statusErrorCode": "Error (exit code: {code})",
    "humanize.statusNotLoaded": "Not Loaded",
    "humanize.every": "Every {value}",
    "humanize.seconds": "{n} seconds",
    "humanize.minutes": "{n} minute(s)",
    "humanize.hours": "{n} hour(s)",
    "humanize.days": "{n} day(s)",
    "humanize.runsDaily": "Runs daily at {time}",
    "humanize.runsWeekly": "Runs every {weekday} at {time}",
    "humanize.runsMonthly": "Runs on day {day} at {time} every month",
    "humanize.runsYearly": "Runs on {month}/{day} at {time} every year",
    "humanize.scheduledExecution": "Scheduled",

    // Summary
    "summary.status": "Status",
    "summary.schedule": "Schedule",
    "summary.command": "Command",
    "summary.noSchedule": "No schedule configured",

    // Plist groups
    "plist.group.basic": "Basic Settings",
    "plist.group.schedule": "Execution Conditions",
    "plist.group.logs": "Logs",
    "plist.group.environment": "Environment",
    "plist.group.other": "Other",

    // Toast
    "toast.dismiss": "Dismiss",
    "toast.actionSuccess": "{action} succeeded",
    "toast.actionError": "{action} failed: {error}",

    // ContextMenu
    "contextMenu.editPlist": "Edit Plist",
    "contextMenu.viewLogs": "View Logs",
    "contextMenu.showInFinder": "Show in Finder",
    "contextMenu.copyLabel": "Copy Label",
    "contextMenu.copied": "Label copied to clipboard",

    // Settings
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.fontSize": "Font Size",
    "settings.small": "Small",
    "settings.medium": "Medium",
    "settings.large": "Large",
    "settings.language": "Language",
    "settings.en": "English",
    "settings.ja": "日本語",

    // Welcome Panel
    "welcome.summary": "Service Summary",
    "welcome.errorWarning": "{count} service(s) have errors",
    "welcome.createService": "Create new service",
    "welcome.openFolder": "Open service folder",
    "welcome.shortcuts": "Keyboard Shortcuts",
    "welcome.shortcut.newService": "New service",
    "welcome.shortcut.search": "Search services",
    "welcome.shortcut.refresh": "Refresh",
    "welcome.shortcut.navigate": "Navigate services",
    "welcome.shortcut.save": "Save plist",

    // Log Search
    "logSearch.placeholder": "Search logs...",
    "logSearch.noMatches": "No matches",
    "logSearch.caseSensitive": "Case sensitive",
    "logSearch.prev": "Previous match",
    "logSearch.next": "Next match",

    // Filter
    "sidebar.filterCategory": "Filter by category",
    "sidebar.homeTooltip": "Back to Home",

    // Plist Editor
    "plist.mode.structured": "Structured",
    "plist.mode.raw": "Raw XML",
    "plist.unsavedChanges": "Unsaved changes",
    "plist.save": "Save",
    "plist.saving": "Saving...",
    "plist.saveAndReload": "Save & Reload",
    "plist.remove": "Remove",
    "plist.addProperty": "Add Property",
    "plist.dismiss": "Dismiss",
    "plist.loading": "Loading plist...",
    "plist.loadError": "Failed to load plist: {error}",
    "plist.newPropertyKey": "New property key...",
    "plist.selectProperty": "Select property...",
    "plist.customKey": "Custom key...",
    "plist.configured": "{count}/{total} configured",
    "plist.addCustomProperty": "Add custom property...",

    // PlistField
    "plist.field.add": "+ Add",
    "plist.field.key": "Key",
    "plist.field.dataBytes": "<Data: {bytes} bytes>",
    "plist.field.datePlaceholder": "YYYY-MM-DDTHH:MM:SSZ",

    // RawXmlEditor
    "plist.loadingXml": "Loading XML...",
    "plist.wrapLines": "Line Wrap",

    // KEY_META labels
    "plist.key.Label": "Label",
    "plist.key.Program": "Program",
    "plist.key.ProgramArguments": "Program Arguments",
    "plist.key.RunAtLoad": "Run at Load",
    "plist.key.KeepAlive": "Keep Alive",
    "plist.key.StartInterval": "Start Interval (seconds)",
    "plist.key.StartCalendarInterval": "Start Calendar Interval",
    "plist.key.WorkingDirectory": "Working Directory",
    "plist.key.EnvironmentVariables": "Environment Variables",
    "plist.key.StandardOutPath": "Standard Output Path",
    "plist.key.StandardErrorPath": "Standard Error Path",
    "plist.key.ThrottleInterval": "Throttle Interval",
    "plist.key.WatchPaths": "Watch Paths",
    "plist.key.QueueDirectories": "Queue Directories",

    // CreateServiceDialog additions
    "create.labelHelp": "Unique identifier in reverse-domain format",
    "create.programExample": "e.g. /usr/local/bin/node server.js",
    "create.labelSuggestion": "Suggestion: {suggestion}",
  },
  ja: {
    // Sidebar
    "sidebar.services": "サービス",
    "sidebar.search": "サービスを検索...",
    "sidebar.newService": "新規サービス",
    "sidebar.settings": "設定",
    "sidebar.noMatch": "一致するサービスがありません。",
    "sidebar.noServices": "LaunchAgentサービスが見つかりません。",
    "sidebar.createHint": "Cmd+N で新規作成",

    // DetailPanel
    "detail.info": "情報",
    "detail.editor": "エディタ",
    "detail.logs": "ログ",
    "detail.welcome": "Daemon Deck",
    "detail.selectService": "サイドバーからサービスを選択してください。",
    "detail.createHint": "Cmd+N で新規サービスを作成",

    // StatusBadge
    "status.Running": "実行中",
    "status.Stopped": "停止",
    "status.Error": "エラー",
    "status.NotLoaded": "未読込",

    // CreateServiceDialog
    "create.title": "新規サービス",
    "create.label": "ラベル",
    "create.program": "プログラム",
    "create.programHelp": "スペース区切りのコマンドと引数",
    "create.runAtLoad": "読み込み時に実行",
    "create.cancel": "キャンセル",
    "create.create": "作成",
    "create.creating": "作成中...",
    "create.labelRequired": "ラベルは必須です",
    "create.programRequired": "プログラムは必須です",
    "create.labelPlaceholder": "com.example.myservice",
    "create.programPlaceholder": "/usr/local/bin/myapp --flag",

    // ServiceActions
    "action.start": "開始",
    "action.stop": "停止",
    "action.restart": "再起動",
    "action.load": "読込",
    "action.unload": "解除",
    "action.delete": "削除",

    // Delete confirmation
    "delete.title": "サービスを削除",
    "delete.message": "「{label}」を削除しますか？",
    "delete.confirm": "削除する",
    "delete.cancel": "キャンセル",
    "delete.deleting": "削除中...",
    "delete.backupOption": "削除前にバックアップを作成する",

    // ServiceInfo
    "info.label": "ラベル",
    "info.status": "ステータス",
    "info.pid": "PID",
    "info.lastExitStatus": "最終終了ステータス",
    "info.program": "プログラム",
    "info.runAtLoad": "読み込み時に実行",
    "info.yes": "はい",
    "info.no": "いいえ",
    "info.plistPath": "Plist パス",
    "info.stdoutPath": "標準出力パス",
    "info.stderrPath": "標準エラーパス",

    // Category
    "category.all": "すべて",
    "category.homebrew": "Homebrew",
    "category.apple": "Apple",
    "category.custom": "カスタム",

    // Humanize
    "humanize.runAtLoad": "ログイン時に自動起動",
    "humanize.keepAlive": "常時起動（クラッシュ時自動再起動）",
    "humanize.statusRunning": "実行中",
    "humanize.statusRunningPid": "実行中 (PID: {pid})",
    "humanize.statusStopped": "停止中",
    "humanize.statusError": "エラー",
    "humanize.statusErrorCode": "エラー (終了コード: {code})",
    "humanize.statusNotLoaded": "未読み込み",
    "humanize.every": "{value}ごと",
    "humanize.seconds": "{n}秒",
    "humanize.minutes": "{n}分",
    "humanize.hours": "{n}時間",
    "humanize.days": "{n}日",
    "humanize.runsDaily": "毎日 {time} に実行",
    "humanize.runsWeekly": "毎週{weekday} {time} に実行",
    "humanize.runsMonthly": "毎月 {day}日 {time} に実行",
    "humanize.runsYearly": "毎年 {month}月{day}日 {time} に実行",
    "humanize.scheduledExecution": "スケジュール実行",

    // Summary
    "summary.status": "ステータス",
    "summary.schedule": "スケジュール",
    "summary.command": "コマンド",
    "summary.noSchedule": "スケジュール未設定",

    // Plist groups
    "plist.group.basic": "基本設定",
    "plist.group.schedule": "実行条件",
    "plist.group.logs": "ログ",
    "plist.group.environment": "環境",
    "plist.group.other": "その他",

    // Toast
    "toast.dismiss": "閉じる",
    "toast.actionSuccess": "{action}に成功しました",
    "toast.actionError": "{action}に失敗しました: {error}",

    // ContextMenu
    "contextMenu.editPlist": "Plistを編集",
    "contextMenu.viewLogs": "ログを表示",
    "contextMenu.showInFinder": "Finderで表示",
    "contextMenu.copyLabel": "ラベルをコピー",
    "contextMenu.copied": "ラベルをクリップボードにコピーしました",

    // Settings
    "settings.title": "設定",
    "settings.theme": "テーマ",
    "settings.light": "ライト",
    "settings.dark": "ダーク",
    "settings.system": "システム",
    "settings.fontSize": "フォントサイズ",
    "settings.small": "小",
    "settings.medium": "中",
    "settings.large": "大",
    "settings.language": "言語",
    "settings.en": "English",
    "settings.ja": "日本語",

    // Welcome Panel
    "welcome.summary": "サービスサマリー",
    "welcome.errorWarning": "{count}件のサービスにエラーがあります",
    "welcome.createService": "新しいサービスを作成",
    "welcome.openFolder": "サービスフォルダを開く",
    "welcome.shortcuts": "キーボードショートカット",
    "welcome.shortcut.newService": "新規サービス作成",
    "welcome.shortcut.search": "サービス検索",
    "welcome.shortcut.refresh": "更新",
    "welcome.shortcut.navigate": "サービス移動",
    "welcome.shortcut.save": "Plist保存",

    // Log Search
    "logSearch.placeholder": "ログを検索...",
    "logSearch.noMatches": "一致なし",
    "logSearch.caseSensitive": "大文字小文字を区別",
    "logSearch.prev": "前のマッチ",
    "logSearch.next": "次のマッチ",

    // Filter
    "sidebar.filterCategory": "カテゴリで絞り込み",
    "sidebar.homeTooltip": "ホームに戻る",

    // Plist Editor
    "plist.mode.structured": "構造化",
    "plist.mode.raw": "Raw XML",
    "plist.unsavedChanges": "未保存の変更",
    "plist.save": "保存",
    "plist.saving": "保存中...",
    "plist.saveAndReload": "保存して再読込",
    "plist.remove": "削除",
    "plist.addProperty": "プロパティを追加",
    "plist.dismiss": "閉じる",
    "plist.loading": "plistを読み込み中...",
    "plist.loadError": "plistの読み込みに失敗しました: {error}",
    "plist.newPropertyKey": "新しいプロパティキー...",
    "plist.selectProperty": "プロパティを選択...",
    "plist.customKey": "カスタムキー...",
    "plist.configured": "{count}/{total} 設定済み",
    "plist.addCustomProperty": "カスタムプロパティを追加...",

    // PlistField
    "plist.field.add": "+ 追加",
    "plist.field.key": "キー",
    "plist.field.dataBytes": "<Data: {bytes} バイト>",
    "plist.field.datePlaceholder": "YYYY-MM-DDTHH:MM:SSZ",

    // RawXmlEditor
    "plist.loadingXml": "XMLを読み込み中...",
    "plist.wrapLines": "行折り返し",

    // KEY_META labels
    "plist.key.Label": "ラベル",
    "plist.key.Program": "プログラム",
    "plist.key.ProgramArguments": "プログラム引数",
    "plist.key.RunAtLoad": "読み込み時に実行",
    "plist.key.KeepAlive": "常時起動",
    "plist.key.StartInterval": "実行間隔（秒）",
    "plist.key.StartCalendarInterval": "カレンダー実行間隔",
    "plist.key.WorkingDirectory": "作業ディレクトリ",
    "plist.key.EnvironmentVariables": "環境変数",
    "plist.key.StandardOutPath": "標準出力パス",
    "plist.key.StandardErrorPath": "標準エラー出力パス",
    "plist.key.ThrottleInterval": "スロットル間隔",
    "plist.key.WatchPaths": "監視パス",
    "plist.key.QueueDirectories": "キューディレクトリ",

    // CreateServiceDialog additions
    "create.labelHelp": "逆ドメイン形式の一意な識別子",
    "create.programExample": "例: /usr/local/bin/node server.js",
    "create.labelSuggestion": "候補: {suggestion}",
  },
};

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  let result = translations[locale][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.split(`{${k}}`).join(String(v));
    }
  }
  return result;
}

export function useTranslation() {
  const locale = useAppState((s) => s.locale);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string =>
      translate(locale, key, params),
    [locale],
  );
  return useMemo(() => ({ t, locale }), [t, locale]);
}
