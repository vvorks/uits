import { Logger, LogLevel } from './Logger';

/**
 * リモート側にログを出力するロガー
 */
export class RemoteLogger implements Logger {
  /**
   * コンストラクタ
   *
   * リモートとの接続処理を行う
   */
  public constructor() {}

  /**
   * ログを出力する
   *
   * @param level ログレベル
   * @param msg ログメッセージ
   */
  log(level: LogLevel, msg: string): void {}
}
