import { Types } from './Types';

export type Value = string | number | boolean | null;

export class Values {
  /**
   * 値を文字列として取得する
   * @param value 値
   * @returns 文字列値
   */
  public static asString(value: Value): string {
    let result: string;
    if (Types.isString(value)) {
      result = value as string;
    } else if (Types.isNumber(value)) {
      result = '' + value;
    } else if (Types.isBoolean(value)) {
      result = (value as boolean) ? 'true' : 'false';
    } else {
      result = '';
    }
    return result;
  }

  /**
   * 値を真偽値として取得する
   * @param value 値
   * @returns 真偽値
   */
  public static asBoolean(value: Value): boolean {
    let result: boolean;
    if (Types.isString(value)) {
      result = (value as string) == 'true';
    } else if (Types.isNumber(value)) {
      result = (value as number) != 0;
    } else if (Types.isBoolean(value)) {
      result = value as boolean;
    } else {
      result = false;
    }
    return result;
  }
}
