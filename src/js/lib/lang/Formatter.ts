import { Logs, ParamError, Strings, Types, Value } from "../lang";

type PatternType = "b"|"o"|"d"|"x"|"c"|"s"|"G"|"Y"|"m"|"D"|"A"|"P"|"H"|"M"|"S"|"L"|"Z"|"F"|"T"|"%"|"n";
const PATTERNS = /[bodxcsGYmDAPHMSLZFT%n]/

const FLAG_SYMBOLS = "-0+ ,$¥€£¤#";
enum Flags {
	LEFT		= 0,
	ZERO		= 1,
	PLUS		= 2,
	SPACE		= 3,
	GROUP		= 4,
	DOLLER		= 5,
	YEN			= 6,
	EURO		= 7,
	POUND		= 8,
	CURRENCY	= 9,
	ALTERNATIVE	= 10,
}

class Pattern {

	 private _type: PatternType;
	 private _flags: number[];
	 private _width: number;
	 private _precision: number;
	 private _text: string;

	public constructor(type:PatternType, flags:number[]|null, width:number, precision:number, text:string) {
		this._type = type;
		this._flags = (flags != null ? flags : new Array(FLAG_SYMBOLS.length).fill(0));
		this._width = width;
		this._precision = precision;
		this._text = text;
	}

	public get type():PatternType {
		return this._type;
	}

	public get leftSide():boolean {
		return this._flags[Flags.LEFT] > 0;
	}

	public get zeroFill():boolean {
		return this._flags[Flags.ZERO] > 0;
	}

	public get grouping():boolean {
		return this._flags[Flags.GROUP] > 0;
	}

	public get positive():boolean {
		return this._flags[Flags.PLUS] > 0;
	}
	public get positiveCount():number {
		return this._flags[Flags.PLUS];
	}

	public get positiveChar():string {
		if (this._flags[Flags.PLUS] > 0) {
			return '+';
		} else if (this._flags[Flags.SPACE] > 0) {
			return ' ';
		}
		return "";
	}

	public get currencyChar():string {
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
		return "";
	}

	public get alternative():boolean {
		return this._flags[Flags.ALTERNATIVE] > 0;
	}

	public alternativeCount():number {
		return this._flags[Flags.ALTERNATIVE];
	}

	public get width():number {
		return this._width;
	}

	public get precision():number {
		return this._precision;
	}

	public get preferrdWidth():number {
		let preferred = 0;
		preferred += this.positiveChar.length;
		preferred += this.currencyChar.length;
		preferred += this.width;
		if (this.grouping && this.width > 3) {
			preferred += (this.width - 1) / 3;
		}
		if (this.precision > 0) {
			preferred += 1 + this.precision;
		}
		return preferred;
	}

}

export class Formatter {

	public static parse(formatString:string):Formatter {
		return Parser.INSTANCE.parse(formatString);
	}

	public format(value:Value|Date):string {
		return "";
	}

	protected measureText(str:string):number {
		return str.length; //TODO 仮。正確には半角１、全角２として返したい。
	}

}

class LiteralFormatter extends Formatter {

	private _text: string;

	public constructor(text:string) {
		super();
		this._text = text;
	}

	public format(value:Value|Date):string {
		return this._text;
	}

}

class BundleFormatter extends Formatter {

	private _formatters: Formatter[];

	public constructor(formatters:Formatter[]) {
		super();
		this._formatters = formatters;
	}

	public format(value:Value|Date):string {
		//TODO スプリットモードサポート
		let s = "";
		for (let f of this._formatters) {
			s += f.format(value);
		}
		return s;
	}

}

class PatternFormatter extends Formatter {

	private _pattern: Pattern;

	public constructor(p:Pattern) {
		super();
		this._pattern = p;
	}

	public get pattern():Pattern {
		return this._pattern;
	}

	protected asNumber(value:Value|Date):number {
		if (Types.isNumber(value)) {
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

	protected asString(value:Value|Date):string {
		if (Types.isNumber(value)) {
			return "" + value;
		} else if (Types.isString(value)) {
			return value as string;
		} else if (Types.isBoolean(value)) {
			return (value as boolean) ? "true" : "false";
		} else if (value instanceof Date) {
			return (value as Date).toISOString();
		}
		return "";
	}

	protected fill(str:string, zeroFill:boolean):string {
		let p = this.pattern;
		let width = p.preferrdWidth;
		let len = this.measureText(str);
		if (len < width) {
			let size = width - len;
			if (p.leftSide) {
				str = str + Strings.repeat(" ", size);
			} else if (zeroFill && p.zeroFill) {
				str = Strings.repeat("0", size) + str;
			} else {
				str = Strings.repeat(" ", size) + str;
			}
		}
		return str;
	}

}

class RadixFormatter extends PatternFormatter {

	private _radix:number;

	public constructor(p:Pattern, radix:number) {
		super(p);
		this._radix = radix;
	}

	public format(value:Value|Date):string {
		let num = this.asNumber(value);
		return this.fill(num.toString(this._radix), true);
	}

}

class NumberFormatter extends PatternFormatter {
	//TODO 実装
}

class DateTimeFormatter extends PatternFormatter {
	//TODO 実装
}

class CharFormatter extends PatternFormatter {

	public format(value:Value|Date):string {
		let num = this.asNumber(value);
		let str = String.fromCharCode(num);
		return this.fill(str, false);
	}

}

class StringFormatter extends PatternFormatter {

	public format(value:Value|Date):string {
		let str = this.asString(value);
		return this.fill(str, false);
	}

}

class Parser {

	public static INSTANCE = new Parser();

	public parse(src:string):Formatter {
		let str = src;
		let formatters:Formatter[] = [];
		while (str.length > 0) {
			let index = str.indexOf('%');
			if (index < 0) {
				formatters.push(new LiteralFormatter(str));
				str = "";
			} else {
				if (index > 0) {
					formatters.push(new LiteralFormatter(str.substring(0, index)));
				}
				let tmp = str.substring(index);
				str = tmp.substring(1);
				let patIndex = str.search(PATTERNS);
				if (patIndex < 0) {
					formatters.push(new LiteralFormatter(tmp));
					str = "";
				} else {
					let type = str.substring(patIndex, patIndex + 1) as PatternType;
					let pattern = this.parsePattern(type, str.substring(0, patIndex));
					formatters.push(this.createFormatter(pattern));
					str = str.substring(patIndex + 1);
				}
			}
		}
		return new BundleFormatter(formatters);
	}

	private parsePattern(type:PatternType, src:string):Pattern {
		let str = src;
		let pos = 0;
		let flags:number[] = new Array(FLAG_SYMBOLS.length).fill(0);
		for (let i = 0; pos < str.length && (i = FLAG_SYMBOLS.indexOf(str.charAt(pos))) >= 0; pos++) {
			flags[i]++;
		}
		let spos = pos;
		let mpos = -1;
		for (let i = 0; pos < str.length && (i = ".01234567890".indexOf(str.charAt(pos))) >= 0; pos++) {
			if (i == 0) {
				if (mpos != -1) {
					throw new ParamError();
				}
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
		return new Pattern(type, flags, width, precision, src);
	}

	private createFormatter(pattern:Pattern):Formatter {
		switch (pattern.type) {
		case "b":
			return new RadixFormatter(pattern,  2);
		case "o":
			return new RadixFormatter(pattern,  8);
		case "x":
			return new RadixFormatter(pattern, 16);
		case "d":
			return new NumberFormatter(pattern);
		case "c":
			return new CharFormatter(pattern);
		case "s":
			return new StringFormatter(pattern);
		case "%":
			return new LiteralFormatter("%");
		case "G":	case "Y":	case "m":	case "D":
		case "A":	case "P":	case "H":	case "M":	case "S":	case "L":	case "Z":
		case "F":	case "T":
			return new DateTimeFormatter(pattern);
		case "n":
			return new LiteralFormatter("\n");
		default:
			return new LiteralFormatter("");
		}
	}

}
