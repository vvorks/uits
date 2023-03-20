import { ConsoleLogger } from './ConsoleLogger';
import { LogLevel } from './Logger';
import { Strings } from '~/lib/lang/Strings';

/**
 * ログ出力ユーティリティ（Facade）
 */
export class Logs {
  private static readonly NAME = 'Function.getCaller';

  private static readonly DEPTH = 2; //message, error|info|warn|debug|verbose

  private static readonly LOGGERS = [new ConsoleLogger()];

  private static getCaller(): string {
    let frame = new Error().stack as string;
    let elems = frame.split('\n');
    let result = elems.length <= 0 ? '?' : elems[1];
    for (let i = 0; i < elems.length; i++) {
      let e = elems[i];
      let fields = e.trim().split(' ');
      if (fields[0] == 'at') {
        let callerName = fields[1];
        if (callerName.startsWith(Logs.NAME)) {
          let e2 = elems[i + Logs.DEPTH + 1];
          let callerFields = e2.trim().split(' ');
          if (callerFields[1] == 'new') {
            result = callerFields[1] + ' ' + callerFields[2];
          } else {
            result = callerFields[1];
          }
          break;
        }
      }
    }
    return result;
  }

  private static message(type: string, format: string, args: any[]): string {
    let now = new Date();
    let message = Strings.sprintf(
      '%02d/%02d %02d:%02d:%02d.%03d %s %s',
      //now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
      type,
      Strings.vsprintf(format, args)
      //Logs.getCaller()
    );
    let eol = message.indexOf('\n');
    if (eol == -1) {
      eol = 256;
    }
    if (message.length > eol) {
      message = message.substring(0, eol);
    }
    return message;
  }

  public static error(format: string, ...args: any[]): void {
    const msg = Logs.message('E', format, args);
    for (const logger of Logs.LOGGERS) {
      logger.log(LogLevel.ERROR, msg);
    }
  }

  public static warn(format: string, ...args: any[]): void {
    const msg = Logs.message('W', format, args);
    for (const logger of Logs.LOGGERS) {
      logger.log(LogLevel.WARN, msg);
    }
  }

  public static info(format: string, ...args: any[]): void {
    const msg = Logs.message('I', format, args);
    for (const logger of Logs.LOGGERS) {
      logger.log(LogLevel.INFO, msg);
    }
  }

  public static debug(format: string, ...args: any[]): void {
    const msg = Logs.message('D', format, args);
    for (const logger of Logs.LOGGERS) {
      logger.log(LogLevel.DEBUG, msg);
    }
  }

  public static verbose(format: string, ...args: any[]): void {
    const msg = Logs.message('V', format, args);
    for (const logger of Logs.LOGGERS) {
      logger.log(LogLevel.VERBOSE, msg);
    }
  }

  public static trace(): void {
    let stack = new Error().stack;
    if (stack != undefined) {
      const msg = Logs.message('V', 'STACK TRACE', []);
      for (const logger of Logs.LOGGERS) {
        logger.log(LogLevel.VERBOSE, msg);
      }
      for (let e of stack.split('\n')) {
        for (const logger of Logs.LOGGERS) {
          logger.log(LogLevel.VERBOSE, e);
        }
      }
    }
  }
}
