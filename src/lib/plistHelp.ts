import type { Locale } from "./i18n";

const PLIST_KEY_HELP: Record<string, Record<Locale, string>> = {
  Label: {
    en: "Unique identifier for the service. Used by launchd to distinguish services.",
    ja: "サービスの一意な識別子。launchdがサービスを区別するために使用。",
  },
  Program: {
    en: "Full path to the program to execute.",
    ja: "実行するプログラムのフルパス。",
  },
  ProgramArguments: {
    en: "Array of arguments to pass to the program. The first element is the program itself.",
    ja: "プログラムに渡す引数の配列。最初の要素はプログラム自体。",
  },
  RunAtLoad: {
    en: "If true, the service starts automatically when loaded (usually at login).",
    ja: "trueの場合、サービスがロードされた時（通常はログイン時）に自動的に起動。",
  },
  KeepAlive: {
    en: "If true, the process is automatically restarted when it exits.",
    ja: "trueの場合、プロセスが終了しても自動的に再起動。",
  },
  StartInterval: {
    en: "Run the service every N seconds (e.g., 3600 = every hour).",
    ja: "指定秒数ごとにサービスを実行（例: 3600 = 1時間ごと）。",
  },
  StartCalendarInterval: {
    en: "Schedule execution using cron-style date/time specification.",
    ja: "cron形式のスケジュールで実行日時を指定。",
  },
  WorkingDirectory: {
    en: "The working directory for the program when it runs.",
    ja: "プログラムの実行時の作業ディレクトリ。",
  },
  EnvironmentVariables: {
    en: "Environment variables passed to the program.",
    ja: "プログラムに渡す環境変数。",
  },
  StandardOutPath: {
    en: "File path where standard output is written.",
    ja: "標準出力の書き出し先ファイルパス。",
  },
  StandardErrorPath: {
    en: "File path where standard error output is written.",
    ja: "標準エラー出力の書き出し先ファイルパス。",
  },
  ThrottleInterval: {
    en: "Minimum number of seconds between service restarts.",
    ja: "サービスの再起動間隔の最小秒数。",
  },
  WatchPaths: {
    en: "Start the service when the specified paths are modified.",
    ja: "指定パスに変更があった時にサービスを起動。",
  },
  QueueDirectories: {
    en: "Start the service when files are added to the specified directories.",
    ja: "指定ディレクトリにファイルが追加された時にサービスを起動。",
  },
};

export function getPlistKeyHelp(key: string, locale: Locale): string | null {
  return PLIST_KEY_HELP[key]?.[locale] ?? null;
}
