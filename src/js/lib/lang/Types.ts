export class Types {
  public static isUndefined(v: any) {
    return typeof v === 'undefined';
  }

  public static isNull(v: any) {
    return v == null;
  }

  public static isString(v: any) {
    return typeof v === 'string';
  }

  public static isNumber(v: any) {
    return typeof v === 'number';
  }

  public static isBoolean(v: any) {
    return typeof v === 'boolean';
  }

  public static isValueType(v: any) {
    let t = typeof v;
    return t == 'string' || t == 'number' || t == 'boolean';
  }

  public static isObject(v: any) {
    return v !== null && typeof v === 'object';
  }

  public static isArray(v: any) {
    return Types.isObject(v) && Array.isArray(v);
  }
}
