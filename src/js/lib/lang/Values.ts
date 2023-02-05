import { Types } from './Types';

//TODO Date(とBigIntも？)をValue型の一部として認めるべき？
export type Value = string | number | boolean | null;

export class Values {
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
}
