/**
 * ログレベル
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
  MAX_LEVEL = VERBOSE,
}

/**
 * ログ出力インターフェース
 */
export interface Logger {
  /**
   * ログを出力する
   *
   * @param level ログレベル
   * @param msg ログメッセージ
   */
  log(level: LogLevel, msg: string): void;
}
