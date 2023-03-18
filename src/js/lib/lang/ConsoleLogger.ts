import { Logger, LogLevel } from './Logger';

type LogFunc = (message: string) => void;

export class ConsoleLogger implements Logger {
  private _funcs: LogFunc[];

  public constructor() {
    this._funcs = new Array(LogLevel.MAX_LEVEL + 1);
    this._funcs[LogLevel.ERROR] = console.error;
    this._funcs[LogLevel.WARN] = console.warn;
    this._funcs[LogLevel.INFO] = console.info;
    this._funcs[LogLevel.DEBUG] = console.log;
    this._funcs[LogLevel.VERBOSE] = console.log;
  }

  public log(level: LogLevel, msg: string): void {
    //this._funcs[level](msg);
    let func = this._funcs[level];
    func(msg);
    //window.setTimeout(func, 0, msg);
  }
}
