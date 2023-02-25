import { Types } from './Types';

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
