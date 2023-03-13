export class Types {
  public static isUndefined(v: any): v is undefined {
    return typeof v === 'undefined';
  }

  public static isNull(v: any): v is null {
    return v == null;
  }

  public static isString(v: any): v is string {
    return typeof v === 'string';
  }

  public static isNumber(v: any): v is number {
    return typeof v === 'number';
  }

  public static isBoolean(v: any): v is boolean {
    return typeof v === 'boolean';
  }

  public static isValueType(v: any): v is string | number | boolean {
    let t = typeof v;
    return t == 'string' || t == 'number' || t == 'boolean';
  }

  public static isObject(v: any): v is object {
    return v !== null && typeof v === 'object';
  }

  public static isArray(v: any): v is any[] {
    return Types.isObject(v) && Array.isArray(v);
  }
}
