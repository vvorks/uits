import { Asserts, Properties, Value } from '~/lib/lang';
import { Strings } from '~/lib/lang/Strings';
import { Types } from '~/lib/lang/Types';

// prettier-ignore
type PatternType = 'b'|'o'|'d'|'x'|'X'|'c'|'s'|'G'|'Y'|'m'|'D'|'A'|'P'|'H'|'M'|'S'|'L'|'Z'|'F'|'T'|'%'|'n';
const PATTERNS = /[bodxXcsGYmDAPHMSLZFT%n]/;

const FLAG_SYMBOLS = '-0+ ,$¥€£¤#';
enum Flags {
  LEFT = 0,
  ZERO = 1,
  PLUS = 2,
  SPACE = 3,
  GROUP = 4,
  DOLLER = 5,
  YEN = 6,
  EURO = 7,
  POUND = 8,
  CURRENCY = 9,
  ALTERNATIVE = 10,
}

// prettier-ignore
const FULLWIDTH_CODEPOINTS = [
  0x01100, 0x011ff, //Hangul Jamo	ハングル字母
  0x02e80, 0x02eff, //CJK Radicals Supplement	CJK部首補助
  0x02f00, 0x02fdf, //Kangxi Radicals	康煕部首
  0x02ff0, 0x02fff, //Ideographic Description Characters	漢字構成記述文字
  0x03000, 0x0303f, //CJK Symbols and Punctuation	CJKの記号及び句読点
  0x03040, 0x0309f, //Hiragana	平仮名
  0x030a0, 0x030ff, //Katakana	片仮名
  0x03100, 0x0312f, //Bopomofo	注音字母
  0x03130, 0x0318f, //Hangul Compatibility Jamo	ハングル互換字母
  0x03190, 0x0319f, //Kanbun	漢文用記号
  0x031a0, 0x031bf, //Bopomofo Extended	注音字母拡張
  0x031c0, 0x031ef, //CJK Strokes	CJKの筆画
  0x031f0, 0x031ff, //Katakana Phonetic Extensions	片仮名拡張
  0x03200, 0x032ff, //Enclosed CJK Letters and Months	囲みCJK文字・月
  0x03300, 0x033ff, //CJK Compatibility	CJK互換用文字
  0x03400, 0x04dbf, //CJK Unified Ideographs Extension A	CJK統合漢字拡張A
  0x04dc0, 0x04dff, //Yijing Hexagram Symbols	易経記号
  0x04e00, 0x09fff, //CJK Unified Ideographs	CJK統合漢字
  0x0ac00, 0x0d7af, //Hangul Syllables	ハングル音節文字
  0x0d7b0, 0x0d7ff, //Hangul Jamo Extended-B	ハングル字母拡張B
  0x0f900, 0x0faff, //CJK Compatibility Ideographs	CJK互換漢字
  0x0fe10, 0x0fe1f, //Vertical Forms	縦書き形
  0x0fe30, 0x0fe4f, //CJK Compatibility Forms	CJK互換形
  0x0ff01, 0x0ff5e, //Fullwidth Forms	全角形
  0x20000, 0x2a6df, //CJK Unified Ideographs Extension B	CJK統合漢字拡張B
  0x2a700, 0x2b73f, //CJK Unified Ideographs Extension C	CJK統合漢字拡張C
  0x2b740, 0x2b81f, //CJK Unified Ideographs Extension D	CJK統合漢字拡張D
  0x2b820, 0x2ceaf, //CJK Unified Ideographs Extension E	CJK統合漢字拡張E
  0x2ceb0, 0x2ebef, //CJK Unified Ideographs Extension F	CJK統合漢字拡張F
  0x2f800, 0x2fa1f, //CJK Compatibility Ideographs Supplement	CJK互換漢字補助
  0x30000, 0x3134f, //CJK Unified Ideographs Extension G	CJK統合漢字拡張G
];

class Pattern {
  private _type: PatternType;
  private _flags: number[];
  private _order: number;
  private _width: number;
  private _precision: number;
  private _text: string;

  public constructor(
    type: PatternType,
    order: number,
    flags: number[] | null,
    width: number,
    precision: number,
    text: string
  ) {
    this._type = type;
    this._order = order;
    this._flags = flags != null ? flags : new Array(FLAG_SYMBOLS.length).fill(0);
    this._width = width;
    this._precision = precision;
    this._text = text;
  }

  public get type(): PatternType {
    return this._type;
  }

  public get flags(): number[] {
    return this._flags;
  }

  public get order(): number {
    return this._order;
  }

  public get width(): number {
    return this._width;
  }

  public get precision(): number {
    return this._precision;
  }

  public get text(): string {
    return this._text;
  }

  public get leftSide(): boolean {
    return this._flags[Flags.LEFT] > 0;
  }

  public get zeroFill(): boolean {
    return this._flags[Flags.ZERO] > 0;
  }

  public get grouping(): boolean {
    return this._flags[Flags.GROUP] > 0;
  }

  public get positive(): boolean {
    return this._flags[Flags.PLUS] > 0;
  }
  public get positiveCount(): number {
    return this._flags[Flags.PLUS];
  }

  public get positiveChar(): string {
    if (this._flags[Flags.PLUS] > 0) {
      return '+';
    } else if (this._flags[Flags.SPACE] > 0) {
      return ' ';
    }
    return '';
  }

  public get currencyChar(): string {
    if (this._flags[Flags.CURRENCY] > 0) {
      return '¤';
    } else if (this._flags[Flags.DOLLER] > 0) {
      return '$';
    } else if (this._flags[Flags.YEN] > 0) {
      return '¥';
    } else if (this._flags[Flags.EURO] > 0) {
      return '€';
    } else if (this._flags[Flags.POUND] > 0) {
      return '£';
    }
    return '';
  }

  public get alternative(): boolean {
    return this._flags[Flags.ALTERNATIVE] > 0;
  }

  public get alternativeCount(): number {
    return this._flags[Flags.ALTERNATIVE];
  }

  public get preferrdWidth(): number {
    let preferred = 0;
    preferred += this.positiveChar.length;
    preferred += this.currencyChar.length;
    preferred += this.width;
    if (this.grouping && this.width > 3) {
      preferred += Math.floor((this.width - 1) / 3);
    }
    if (this.precision > 0) {
      preferred += 1 + this.precision;
    }
    return preferred;
  }

  public isWidthedString(): boolean {
    return this._type == 's' && this._width > 0;
  }

  public isLiteral(): boolean {
    return this._type == '%';
  }

  public isDateTimeStyle(): boolean {
    return 'FT'.indexOf(this._type) >= 0;
  }

  public isDateTime(): boolean {
    return 'GYmDAPHMSLZ'.indexOf(this._type) >= 0;
  }
}

abstract class Fragment {
  public abstract format(value: Value | Date): string;

  protected measureText(str: string): number {
    let len = 0;
    for (let ch of str) {
      len += this.isFullWidth(ch.charCodeAt(0)) ? 2 : 1;
    }
    return len;
  }

  protected isFullWidth(codePoint: number): boolean {
    for (let i = 0; i < FULLWIDTH_CODEPOINTS.length; i += 2) {
      if (FULLWIDTH_CODEPOINTS[i] <= codePoint && codePoint <= FULLWIDTH_CODEPOINTS[i + 1]) {
        return true;
      }
    }
    return false;
  }

  protected fill(str: string, p: Pattern, zeroFill: boolean): string {
    let width = p.preferrdWidth;
    let len = this.measureText(str);
    let orgStr = str;
    if (len < width) {
      let size = width - len;
      if (p.leftSide) {
        str = str + Strings.repeat(' ', size);
      } else if (zeroFill && p.zeroFill) {
        str = Strings.repeat('0', size) + str;
      } else {
        str = Strings.repeat(' ', size) + str;
      }
    }
    return str;
  }

  protected asNumber(value: Value | Date): number {
    if (value == null) {
      return 0;
    } else if (Types.isNumber(value)) {
      return value as number;
    } else if (Types.isString(value)) {
      return Number(value);
    } else if (Types.isBoolean(value)) {
      return (value as boolean) ? 1 : 0;
    } else if (value instanceof Date) {
      return (value as Date).getTime();
    }
    return 0;
  }

  protected asString(value: Value | Date): string {
    if (value == null) {
      return 'null';
    } else if (Types.isNumber(value)) {
      return '' + value;
    } else if (Types.isString(value)) {
      return value as string;
    } else if (Types.isBoolean(value)) {
      return (value as boolean) ? 'true' : 'false';
    } else if (value instanceof Date) {
      return (value as Date).toISOString();
    }
    return '';
  }

  protected asDate(value: Value | Date): Date {
    if (value == null) {
      return new Date(0);
    } else if (Types.isNumber(value)) {
      return new Date(value as number);
    } else if (Types.isString(value)) {
      return new Date(Date.parse(value as string));
    } else if (Types.isBoolean(value)) {
      return (value as boolean) ? new Date() : new Date(0);
    } else if (value instanceof Date) {
      return value as Date;
    }
    return new Date(0);
  }
}

class LiteralFragment extends Fragment {
  private _text: string;

  public constructor(text: string) {
    super();
    this._text = text;
  }

  public format(value: Value | Date): string {
    return this._text;
  }
}

abstract class PatternFragment extends Fragment {
  private _pattern: Pattern;

  public constructor(p: Pattern) {
    super();
    this._pattern = p;
  }

  public get pattern(): Pattern {
    return this._pattern;
  }
}

class RadixFragment extends PatternFragment {
  private _radix: number;

  private _uppercase: boolean;

  public constructor(p: Pattern, radix: number, uppercase: boolean = false) {
    super(p);
    this._radix = radix;
    this._uppercase = uppercase;
  }

  public format(value: Value | Date): string {
    let num = Math.floor(this.asNumber(value));
    let str = num.toString(this._radix);
    if (this._uppercase) {
      str = str.toUpperCase();
    }
    return this.fill(str, this.pattern, true);
  }
}

class DefaultOptions {
  private static _instance: DefaultOptions | null = null;

  private _dateTimeOptions: Intl.ResolvedDateTimeFormatOptions;

  private _numberOptions: Intl.ResolvedNumberFormatOptions;

  private _groupSymbol: string;

  private _decimalSymbol: string;

  public static getInstance() {
    if (DefaultOptions._instance == null) {
      if (!!Intl && !!Intl.NumberFormat && !!Intl.DateTimeFormat) {
        DefaultOptions._instance = new DefaultOptions();
      }
    }
    return DefaultOptions._instance;
  }

  private constructor() {
    this._dateTimeOptions = new Intl.DateTimeFormat().resolvedOptions();
    this._numberOptions = new Intl.NumberFormat().resolvedOptions();
    let f = new Intl.NumberFormat(this.locale, { useGrouping: true, minimumFractionDigits: 3 });
    let gSym = ',';
    let dSym = '.';
    for (let p of f.formatToParts(1234.567)) {
      if (p.type == 'group') {
        gSym = p.value;
      } else if (p.type == 'decimal') {
        dSym = p.value;
      }
    }
    this._groupSymbol = gSym;
    this._decimalSymbol = dSym;
  }

  public get locale(): string {
    return this._dateTimeOptions.locale;
  }

  public get currency(): string {
    let c = this._numberOptions.currency;
    if (c === undefined) {
      c = this.getDefaultCurrency(this.locale);
    }
    return c;
  }

  public get groupSymbol(): string {
    return this._groupSymbol;
  }

  public get decimalSymbol(): string {
    return this._decimalSymbol;
  }

  private getDefaultCurrency(locale: string): string {
    //TODO 要実装。https://www.npmjs.com/package/country-locale-map を使うか検討
    return 'JPY';
  }
}

class NumberFragment extends PatternFragment {
  private _defaultOptions: DefaultOptions;
  private _formatter: Intl.NumberFormat;

  public constructor(p: Pattern) {
    super(p);
    //処理準備
    this._defaultOptions = DefaultOptions.getInstance() as DefaultOptions;
    let locale = this._defaultOptions.locale;
    let options: Intl.NumberFormatOptions = {};
    //通貨記号
    let currency = p.currencyChar;
    if (currency.length > 0) {
      options.style = 'currency';
      options.currencyDisplay = 'narrowSymbol';
      options.currency = this.toCurrencyCode(currency);
    }
    //桁区切り
    options.useGrouping = p.grouping;
    //精度
    let precision = p.precision;
    if (precision >= 0) {
      options.minimumFractionDigits = precision;
      options.maximumFractionDigits = precision;
    }
    //符号
    options.signDisplay = this.toSignDisplay(p.positiveChar);
    //Intl作成
    this._formatter = new Intl.NumberFormat(locale, options);
  }

  private toCurrencyCode(sym: string): string {
    switch (sym) {
      case '¥':
        return 'JPY';
      case '€':
        return 'EUR';
      case '£':
        return 'GBP';
      case '$':
        return 'USD';
      case '¤':
      default:
        return this._defaultOptions.currency;
    }
  }

  private toSignDisplay(pc: string): 'always' | 'auto' {
    switch (pc) {
      case '+':
        return 'always';
      case ' ':
        return 'always'; //一旦'+'で整形。後処理で' 'に置換
      default:
        return 'auto';
    }
  }

  public format(value: Value | Date): string {
    let num = this.asNumber(value);
    let parts = this._formatter.formatToParts(num);
    let p = this.pattern;
    if (p.precision < 0) {
      //通貨によって、自動的に小数桁が付与されるため、パターンを補正する
      let fractionPart = parts.find((e) => e.type == 'fraction');
      if (fractionPart !== undefined) {
        let modPrecition = fractionPart.value.length;
        p = new Pattern(p.type, p.order, p.flags, p.width, modPrecition, p.text);
      }
    }
    let str = this.composeText(parts, p);
    return this.fill(str, this.pattern, true);
  }

  private composeText(parts: Intl.NumberFormatPart[], p: Pattern): string {
    let zeros: string | null = p.zeroFill ? this.getZeros(parts, p) : null;
    let sb = '';
    for (let f of parts) {
      let type = f.type;
      let value = f.value;
      if (type == 'integer' && zeros != null) {
        sb += zeros;
        zeros = null;
      }
      if (type == 'plusSign' && p.positiveChar == ' ') {
        sb += ' ';
      } else if (type == 'currency' && value == '￥') {
        sb += '¥';
      } else {
        sb += value;
      }
    }
    return sb;
  }

  private getZeros(parts: Intl.NumberFormatPart[], p: Pattern): string | null {
    let zeros: string | null = null;
    //整数桁長を調べる
    let len = 0;
    let len1st = 0;
    for (let f of parts) {
      if (f.type == 'integer') {
        len += f.value.length;
        if (len1st == 0) {
          len1st = len;
        }
      }
    }
    //zeroFill文字列を作成
    let width = p.width;
    if (len < width) {
      let remain = width - len;
      if (p.grouping) {
        zeros = this.makeGroupedZeros(remain, len1st);
      } else {
        zeros = Strings.repeat('0', remain);
      }
    }
    return zeros;
  }

  private makeGroupedZeros(remain: number, len1st: number): string {
    let sb = '';
    let sep = this._defaultOptions.groupSymbol;
    let n = 3 - len1st;
    sb += Strings.repeat('0', Math.min(remain, n));
    remain -= n;
    while (remain > 0) {
      sb += sep;
      sb += Strings.repeat('0', Math.min(remain, 3));
      remain -= 3;
    }
    return Strings.reverse(sb);
  }
}

class CharFragment extends PatternFragment {
  public format(value: Value | Date): string {
    let num = this.asNumber(value);
    let str = String.fromCharCode(num);
    return this.fill(str, this.pattern, false);
  }
}

class StringFragment extends PatternFragment {
  public format(value: Value | Date): string {
    let str = this.asString(value);
    return this.fill(str, this.pattern, false);
  }
}

class TextFragment extends Fragment {
  private _patterns: Pattern[];

  public constructor(patterns: Pattern[]) {
    super();
    this._patterns = patterns;
  }

  public format(value: Value | Date): string {
    let s = '';
    let t = this.asString(value);
    for (let p of this._patterns) {
      if (p.type == 's') {
        let width = p.width;
        if (t.length <= width) {
          s += t; //this.fill(t, p, false);
          break;
        }
        let t1 = t.substring(0, width);
        let t2 = t.substring(width);
        s += this.fill(t1, p, false);
        t = t2;
      } else if (p.type == '%') {
        s += p.text;
      }
    }
    return s;
  }
}

class DateTimeFragment extends Fragment {
  private _patterns: Pattern[];

  private _defaultOptions: DefaultOptions;

  private _formatter: Intl.DateTimeFormat;

  public constructor(patterns: Pattern[]) {
    super();
    //処理準備
    this._patterns = patterns;
    this._defaultOptions = DefaultOptions.getInstance() as DefaultOptions;
    let locale = this._defaultOptions.locale;
    let options: Intl.DateTimeFormatOptions = {};
    for (let p of patterns) {
      this.addOptions(p, options);
    }
    //オプション設定
    this._formatter = new Intl.DateTimeFormat(locale, options);
  }

  private addOptions(p: Pattern, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
    switch (p.type) {
      case 'G':
        return this.addEraOptions(p, options);
      case 'Y':
        return this.addYearOptions(p, options);
      case 'm':
        return this.addMonthOptions(p, options);
      case 'D':
        return this.addDayOptions(p, options);
      case 'A':
        return this.addWeekOpttions(p, options);
      case 'P':
        return this.addAmPmOptions(p, options);
      case 'H':
        return this.addHourOptions(p, options);
      case 'M':
        return this.addMinuteOptions(p, options);
      case 'S':
        return this.addSecondOptions(p, options);
      case 'L':
        return this.addMillisecondOptions(p, options);
      case 'Z':
        return this.addTimezoneOptions(p, options);
      case 'F':
        return this.addDateStyleOptions(p, options);
      case 'T':
        return this.addTimeStyleOptions(p, options);
      default:
        return options;
    }
  }

  private addEraOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    let positiveCount = p.positiveCount;
    if (positiveCount == 0) {
      options.era = 'narrow';
    } else if (positiveCount == 1) {
      options.era = 'short';
    } else {
      options.era = 'long';
    }
    return options;
  }

  private addYearOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    if (p.alternative) {
      let locale = this._defaultOptions.locale;
      options.calendar = this.getAlternativeCalendar(locale, p.alternativeCount);
    }
    if (p.zeroFill && p.width == 2) {
      options.year = '2-digit';
    } else {
      options.year = 'numeric';
    }
    return options;
  }

  private getAlternativeCalendar(locale: string, count: number): string {
    if (locale.startsWith('ja') && count > 0) {
      return 'japanese';
    } else {
      return 'gregory';
    }
  }

  private addMonthOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    let positiveCount = p.positiveCount;
    if (positiveCount == 0) {
      if (p.zeroFill && p.width == 2) {
        options.month = '2-digit';
      } else {
        options.month = 'numeric';
      }
    } else if (positiveCount == 1) {
      options.month = 'narrow';
    } else if (positiveCount == 2) {
      options.month = 'short';
    } else {
      options.month = 'long';
    }
    return options;
  }

  private addDayOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    if (p.zeroFill && p.width) {
      options.day = '2-digit';
    } else {
      options.day = 'numeric';
    }
    return options;
  }

  private addWeekOpttions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    let positiveCount = p.positiveCount;
    if (positiveCount == 0) {
      options.weekday = 'narrow';
    } else if (positiveCount == 1) {
      options.weekday = 'short';
    } else {
      options.weekday = 'long';
    }
    return options;
  }

  private addAmPmOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    options.hour12 = true;
    let positiveCount = p.positiveCount;
    if (positiveCount > 0) {
      if (positiveCount == 1) {
        //apply locale default pattern.
      } else if (positiveCount == 2) {
        options.dayPeriod = 'narrow';
      } else if (positiveCount == 3) {
        options.dayPeriod = 'short';
      } else {
        options.dayPeriod = 'long';
      }
    }
    return options;
  }

  private addHourOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    if (p.zeroFill && p.width == 2) {
      options.hour = '2-digit';
    } else {
      options.hour = 'numeric';
    }
    return options;
  }

  private addMinuteOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    if (p.zeroFill && p.width == 2) {
      options.minute = '2-digit';
    } else {
      options.minute = 'numeric';
    }
    return options;
  }

  private addSecondOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    if (p.zeroFill && p.width == 2) {
      options.second = '2-digit';
    } else {
      options.second = 'numeric';
    }
    return options;
  }

  private addMillisecondOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    //TypeScript ライブラリのインターフェース定義もれ？回避
    let opt2: Properties<any> = options;
    let msecWidth = p.width;
    if (!(1 <= msecWidth && msecWidth <= 3)) {
      msecWidth = 3;
    }
    opt2['fractionalSecondDigits'] = msecWidth;
    return opt2 as Intl.DateTimeFormatOptions;
  }

  private addTimezoneOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    let positiveCount = p.positiveCount;
    if (positiveCount == 0) {
      options.timeZoneName = 'longOffset';
    } else if (positiveCount == 1) {
      options.timeZoneName = 'short';
    } else {
      options.timeZoneName = 'long';
    }
    return options;
  }

  private addDateStyleOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    if (p.alternative) {
      let locale = this._defaultOptions.locale;
      options.calendar = this.getAlternativeCalendar(locale, p.alternativeCount);
    }
    let positiveCount = p.positiveCount;
    if (positiveCount == 0) {
      options.dateStyle = 'short';
    } else if (positiveCount == 1) {
      options.dateStyle = 'medium';
    } else if (positiveCount == 2) {
      options.dateStyle = 'long';
    } else {
      options.dateStyle = 'full';
    }
    return options;
  }

  private addTimeStyleOptions(
    p: Pattern,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormatOptions {
    let positiveCount = p.positiveCount;
    if (positiveCount == 0) {
      options.timeStyle = 'short';
    } else if (positiveCount == 1) {
      options.timeStyle = 'medium';
    } else if (positiveCount == 2) {
      options.timeStyle = 'long';
    } else {
      options.timeStyle = 'full';
    }
    return options;
  }

  private static readonly TAGS: Properties<string> = {
    '%': 'literal',
    G: 'era',
    Y: 'year',
    m: 'month',
    D: 'day',
    A: 'weekday',
    P: 'dayPeriod',
    H: 'hour',
    M: 'minute',
    S: 'second',
    L: 'fractionalSecond',
    Z: 'timeZoneName',
  };

  public format(value: Value | Date): string {
    let date = this.asDate(value);
    let parts = this._formatter.formatToParts(date);
    let sb = '';
    for (let p of this._patterns) {
      if (p.type == '%') {
        sb += p.text;
      } else if (p.type == 'F') {
        sb += this.composeRange(parts, ['era', 'year', 'month', 'day', 'weekday']);
      } else if (p.type == 'T') {
        sb += this.composeRange(parts, [
          'dayPeriod',
          'hour',
          'minute',
          'second',
          'fractionalSecond',
          'timeZoneName',
        ]);
      } else if (p.type == 'P' && p.positiveCount == 0) {
        let v = this.findPartValue(parts, DateTimeFragment.TAGS[p.type]);
        if (v != '') {
          let hour24 = date.getHours();
          sb += this.fill(hour24 < 12 ? 'AM' : 'PM', p, false);
        }
      } else if (p.type == 'Z' && p.positiveCount == 0) {
        let v = this.findPartValue(parts, DateTimeFragment.TAGS[p.type]);
        if (v.startsWith('GMT') || v.startsWith('UTC')) {
          v = v.substring(3);
        }
        sb += this.fill(v, p, false);
      } else if (p.type == 'M' || p.type == 'S') {
        let v = this.supressZero(this.findPartValue(parts, DateTimeFragment.TAGS[p.type]));
        sb += this.fill(v, p, true);
      } else {
        let v = this.findPartValue(parts, DateTimeFragment.TAGS[p.type]);
        sb += this.fill(v, p, this.isInteger(v));
      }
    }
    return sb;
  }

  private composeRange(parts: Intl.DateTimeFormatPart[], tags: string[]): string {
    //コピー範囲の調査
    let n = parts.length;
    let spos = -1;
    let epos = n;
    for (let i = 0; i < n; i++) {
      let part = parts[i];
      if (spos == -1) {
        if (tags.indexOf(part.type) >= 0) {
          spos = i;
        }
      } else {
        if (tags.indexOf(part.type) < 0 && part.type != 'literal') {
          epos = i;
          break;
        }
      }
    }
    if (spos == -1) {
      return '';
    }
    //サブリストの値をコピー
    let sb = '';
    for (let part of parts.slice(spos, epos)) {
      sb += part.value;
    }
    return sb.trim();
  }

  private findPartValue(parts: Intl.DateTimeFormatPart[], tag: string | undefined): string {
    if (tag == undefined) {
      return '';
    }
    for (let p of parts) {
      if (p.type == tag) {
        return p.value;
      }
    }
    return '';
  }

  private supressZero(s: string): string {
    let index = 0;
    while (index < s.length && s.charAt(index) == '0') {
      index++;
    }
    if (index == 0) {
      return s;
    } else if (index < s.length) {
      return s.substring(index);
    } else {
      return s.substring(index - 1);
    }
  }

  private isInteger(s: string): boolean {
    let n = Number(s);
    if (isNaN(n)) {
      return false;
    }
    let m = Math.floor(n);
    return n == m;
  }
}

class AltDateTimeFragment extends Fragment {
  private static readonly WEEK2 = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  private static readonly WEEK3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private _patterns: Pattern[];

  public constructor(patterns: Pattern[]) {
    super();
    this._patterns = patterns;
  }

  public format(value: Value | Date): string {
    let date = this.asDate(value);
    let hasDayPeriod = this._patterns.some((e) => e.type == 'P');
    let b = '';
    for (let p of this._patterns) {
      let p4 = new Pattern(p.type, p.order, [0, 1, 0, ...p.flags.slice(3)], 4, p.precision, p.text);
      let p2 = new Pattern(p.type, p.order, [0, 1, 0, ...p.flags.slice(3)], 2, p.precision, p.text);
      switch (p.type) {
        case 'F':
          b += this.formatYear(date, p4);
          b += '-';
          b += this.formatMonth(date, p2);
          b += '-';
          b += this.formatDay(date, p2);
          break;
        case 'G':
          break;
        case 'Y':
          b += this.formatYear(date, p);
          break;
        case 'm':
          b += this.formatMonth(date, p);
          break;
        case 'D':
          b += this.formatDay(date, p);
          break;
        case 'A':
          b += this.formatWeek(date, p);
          break;
        case 'T':
          b += this.formatHour24(date, p2);
          b += ':';
          b += this.formatMinute(date, p2);
          b += ':';
          b += this.formatSecond(date, p2);
          break;
        case 'P':
          b += this.formatAMPM(date, p);
          break;
        case 'H':
          if (hasDayPeriod) {
            b += this.formatHour12(date, p);
          } else {
            b += this.formatHour24(date, p);
          }
          break;
        case 'M':
          b += this.formatMinute(date, p);
          break;
        case 'S':
          b += this.formatSecond(date, p);
          break;
        case 'L':
          b += this.formatMillis(date, p);
          break;
        case 'Z':
          b += this.formatTimezone(date, p);
          break;
        case '%':
          b += p.text;
          break;
      }
    }
    return b;
  }

  private formatYear(date: Date, p: Pattern) {
    let year = date.getFullYear();
    let str = '' + year;
    return this.fill(str, p, true);
  }

  private formatMonth(date: Date, p: Pattern) {
    let month = date.getMonth() + 1;
    let str = '' + month;
    return this.fill(str, p, true);
  }

  private formatDay(date: Date, p: Pattern) {
    let day = date.getDate();
    let str = '' + day;
    return this.fill(str, p, true);
  }

  private formatWeek(date: Date, p: Pattern) {
    let week = date.getDay();
    let array = p.preferrdWidth < 3 ? AltDateTimeFragment.WEEK2 : AltDateTimeFragment.WEEK3;
    let str = array[week];
    return this.fill(str, p, true);
  }

  private formatAMPM(date: Date, p: Pattern) {
    let hour24 = date.getHours();
    let str = hour24 < 12 ? 'AM' : 'PM';
    return this.fill(str, p, false);
  }

  private formatHour24(date: Date, p: Pattern) {
    let hour24 = date.getHours();
    let str = '' + hour24;
    return this.fill(str, p, true);
  }

  private formatHour12(date: Date, p: Pattern) {
    let hour = date.getHours() % 12;
    let hour12 = hour == 0 ? 12 : hour;
    let str = '' + hour12;
    return this.fill(str, p, true);
  }

  private formatMinute(date: Date, p: Pattern) {
    let minute = date.getMinutes();
    let str = '' + minute;
    return this.fill(str, p, true);
  }

  private formatSecond(date: Date, p: Pattern) {
    let sec = date.getSeconds();
    let str = '' + sec;
    return this.fill(str, p, true);
  }

  private formatMillis(date: Date, p: Pattern) {
    let millis = date.getTime() % 1000;
    let str = '' + millis;
    return this.fill(str, p, true);
  }

  private formatTimezone(date: Date, p: Pattern) {
    let tz = date.getTimezoneOffset();
    let s = tz < 0 ? '+' : '-';
    let a = Math.abs(tz);
    let h = ('00' + a / 60).slice(-2);
    let m = ('00' + (a % 60)).slice(-2);
    let str = s + h + ':' + m;
    return this.fill(str, p, false);
  }
}

export class Formatter {
  private _fragments: Fragment[];

  public constructor(src: string) {
    this._fragments = this.parse(src);
  }

  public format(value: Value | Date): string {
    let s = '';
    for (let f of this._fragments) {
      s += f.format(value);
    }
    return s;
  }

  private parse(src: string): Fragment[] {
    let str = src;
    let patterns: Pattern[] = [];
    let lastOrder = 0;
    while (str.length > 0) {
      let index = str.indexOf('%');
      if (index < 0) {
        patterns.push(new Pattern('%', 0, null, 0, 0, str));
        str = '';
      } else {
        if (index > 0) {
          patterns.push(new Pattern('%', 0, null, 0, 0, str.substring(0, index)));
        }
        let tmp = str.substring(index);
        str = tmp.substring(1);
        let patIndex = str.search(PATTERNS);
        if (patIndex < 0) {
          patterns.push(new Pattern('%', 0, null, 0, 0, tmp));
          str = '';
        } else {
          let type = str.substring(patIndex, patIndex + 1) as PatternType;
          let pattern = this.parsePattern(type, str.substring(0, patIndex), lastOrder);
          patterns.push(pattern);
          lastOrder = pattern.order;
          str = str.substring(patIndex + 1);
        }
      }
    }
    return this.toFragments(patterns);
  }

  private parsePattern(type: PatternType, src: string, lastOrder: number): Pattern {
    let str = src;
    let pos = 0;
    //引数番号指定の解釈
    let order;
    if (pos < str.length && str.charAt(pos) == '<') {
      order = Math.max(1, lastOrder);
      pos++;
    } else if (pos < str.length && str.search(/[123456789][0123456789]*\$/) == 0) {
      order = 0;
      while (pos < str.length && str.charAt(pos) != '$') {
        order *= 10;
        order += (str.codePointAt(pos++) as number) - 0x30;
      }
      pos++;
    } else {
      order = lastOrder + 1;
    }
    //フラグの解釈
    let flags: number[] = new Array(FLAG_SYMBOLS.length).fill(0);
    for (let i = 0; pos < str.length && (i = FLAG_SYMBOLS.indexOf(str.charAt(pos))) >= 0; pos++) {
      flags[i]++;
    }
    //幅と精度の解釈
    let spos = pos;
    let mpos = -1;
    for (let i = 0; pos < str.length && (i = '.01234567890'.indexOf(str.charAt(pos))) >= 0; pos++) {
      if (i == 0) {
        Asserts.require(mpos == -1, 'period detected twice');
        mpos = pos;
      }
    }
    let epos = pos;
    let width = -1;
    let precision = -1;
    if (spos == epos) {
      //empty. do nothing
    } else if (mpos == -1) {
      width = parseInt(str.substring(spos, epos));
    } else if (spos == mpos) {
      precision = parseInt(str.substring(mpos + 1, epos));
    } else if (mpos + 1 < epos) {
      width = parseInt(str.substring(spos, mpos));
      precision = parseInt(str.substring(mpos + 1, epos));
    } else {
      width = parseInt(str.substring(spos, mpos));
    }
    return new Pattern(type, order, flags, width, precision, src);
  }

  private toFragments(patterns: Pattern[]): Fragment[] {
    let pos = 0;
    let p: Pattern | null = pos < patterns.length ? patterns[pos++] : null;
    let fragments: Fragment[] = [];
    while (p != null) {
      if (p.isWidthedString()) {
        let bundlePatterns: Pattern[] = [];
        bundlePatterns.push(p);
        let lastOrder = p.order;
        p = pos < patterns.length ? patterns[pos++] : null;
        let widthedCount = 1;
        while (
          p != null &&
          (p.isWidthedString() || p.isLiteral()) &&
          this.isNearOrder(lastOrder, p.order)
        ) {
          if (p.isWidthedString()) {
            widthedCount++;
          }
          lastOrder = p.order > 0 ? p.order : lastOrder;
          bundlePatterns.push(p);
          p = pos < patterns.length ? patterns[pos++] : null;
        }
        if (widthedCount > 1) {
          fragments.push(new TextFragment(bundlePatterns));
        } else {
          for (let q of bundlePatterns) {
            fragments.push(this.newFragment(q));
          }
        }
      } else if (p.isDateTimeStyle()) {
        let bundlePatterns: Pattern[] = [];
        bundlePatterns.push(p);
        let lastOrder = p.order;
        p = pos < patterns.length ? patterns[pos++] : null;
        while (
          p != null &&
          (p.isDateTimeStyle() || p.isLiteral()) &&
          this.isNearOrder(lastOrder, p.order)
        ) {
          lastOrder = p.order > 0 ? p.order : lastOrder;
          bundlePatterns.push(p);
          p = pos < patterns.length ? patterns[pos++] : null;
        }
        fragments.push(this.newDateTimeFragment(bundlePatterns));
      } else if (p.isDateTime()) {
        let bundlePatterns: Pattern[] = [];
        bundlePatterns.push(p);
        let lastOrder = p.order;
        p = pos < patterns.length ? patterns[pos++] : null;
        while (
          p != null &&
          (p.isDateTime() || p.isLiteral()) &&
          this.isNearOrder(lastOrder, p.order)
        ) {
          lastOrder = p.order > 0 ? p.order : lastOrder;
          bundlePatterns.push(p);
          p = pos < patterns.length ? patterns[pos++] : null;
        }
        fragments.push(this.newDateTimeFragment(bundlePatterns));
      } else {
        fragments.push(this.newFragment(p));
        p = pos < patterns.length ? patterns[pos++] : null;
      }
    }
    return fragments;
  }

  private isNearOrder(prev: number, curr: number): boolean {
    return curr == 0 || prev == 0 || prev == curr || prev + 1 == curr;
  }

  private newFragment(pattern: Pattern): Fragment {
    switch (pattern.type) {
      case 'b':
        return new RadixFragment(pattern, 2);
      case 'o':
        return new RadixFragment(pattern, 8);
      case 'x':
        return new RadixFragment(pattern, 16);
      case 'X':
        return new RadixFragment(pattern, 16, true);
      case 'd':
        return this.newNumberFragment(pattern);
      case 'c':
        return new CharFragment(pattern);
      case 's':
        return new StringFragment(pattern);
      case '%':
        return new LiteralFragment(pattern.text);
      case 'n':
        return new LiteralFragment('\n');
      default:
        return new LiteralFragment('');
    }
  }

  private newNumberFragment(pattern: Pattern): Fragment {
    if (DefaultOptions.getInstance() != null) {
      return new NumberFragment(pattern);
    } else {
      return new RadixFragment(pattern, 10);
    }
  }

  private newDateTimeFragment(patterns: Pattern[]): Fragment {
    if (DefaultOptions.getInstance() != null) {
      return new DateTimeFragment(patterns);
    } else {
      return new AltDateTimeFragment(patterns);
    }
  }
}
