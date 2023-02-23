import { vsprintf as jvsprintf } from 'sprintf-js';
import { Properties } from '~/lib/lang';

const ESCAPE_PATTERN = /[&<>"'\/]/g;

const ESCAPE_CHARS: Properties<string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

export class Strings {
  public static readonly MIN_HIGH_SURROGATE = 0xd800;

  public static readonly MAX_HIGH_SURROGATE = 0xdbff;

  public static readonly MIN_LOW_SURROGATE = 0xdc00;

  public static readonly MAX_LOW_SURROGATE = 0xdfff;

  public static readonly MIN_SURROGATE = Strings.MIN_HIGH_SURROGATE;

  public static readonly MAX_SURROGATE = Strings.MAX_LOW_SURROGATE;

  public static escapeHtml(str: string): string {
    return str.replace(ESCAPE_PATTERN, (c) => ESCAPE_CHARS[c] as string);
  }

  public static repeat(str: string, count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += str;
    }
    return result;
  }

  public static sprintf(format: string, ...args: any[]): string {
    return jvsprintf(format, args);
  }

  public static vsprintf(format: string, args: any[]): string {
    return jvsprintf(format, args);
  }

  public static reverse(str: string) {
    var b = '';
    for (var i = str.length - 1; i >= 0; i--) {
      b += str[i];
    }
    return b;
  }

  public static isHighSurrogate(ch: number): boolean {
    return Strings.MIN_HIGH_SURROGATE <= ch && ch <= Strings.MAX_HIGH_SURROGATE;
  }

  public static isLowSurrogate(ch: number): boolean {
    return Strings.MIN_LOW_SURROGATE <= ch && ch <= Strings.MAX_LOW_SURROGATE;
  }

  public static isSurrogate(ch: number): boolean {
    return Strings.MIN_SURROGATE <= ch && ch <= Strings.MAX_SURROGATE;
  }
}
