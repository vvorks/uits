export class Arrays {
  public static divide<T>(array: T[], filter: (e: T) => boolean): [T[], T[]] {
    let matched: T[] = [];
    let another: T[] = [];
    for (let e of array) {
      if (filter(e)) {
        matched.push(e);
      } else {
        another.push(e);
      }
    }
    return [matched, another];
  }

  public static first<T>(array: T[]): T | null {
    let len = array.length;
    return len > 0 ? array[0] : null;
  }

  public static last<T>(array: T[]): T | null {
    let len = array.length;
    return len > 0 ? array[len - 1] : null;
  }

  public static shuffle<T>(array: T[]): T[] {
    const out = Array.from(array);
    for (let i = out.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[r];
      out[r] = tmp;
    }
    return out;
  }
}
