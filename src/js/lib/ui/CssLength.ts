import
	{ Asserts, Types }
	from "~/lib/lang";
import { Metrics } from "~/lib/ui/Metrics";
import { Size } from "./UiNode";

export class CssLength {

	private static UNITS = [
		"px", "pt", "rem", "rex", "%", "in", "cm", "mm", "pc", "em", "ex"
	];

	public static ZERO:CssLength = new CssLength("0px");

	private _value:number;

	private _unit:string;

	public constructor(arg:Size, defaultUnit:string="px") {
		if (Types.isString(arg)) {
			let str = (arg as string).toLowerCase();
			this._unit = defaultUnit;
			for (let u of CssLength.UNITS) {
				let mid = str.length - u.length;
				if (mid > 0 && str.substring(mid) == u) {
					this._unit = u;
					str = str.substring(0, mid);
					break;
				}
			}
			this._value = Number(str);
		} else {
			this._value = arg as number;
			this._unit = defaultUnit;
		}
		Asserts.require(!isNaN(this._value));
	}

	public get value():number {
		return this._value;
	}

	public get unit():string {
		return this._unit;
	}

	public toPixel(parentSize:() => number):number {
		let met = Metrics.getInstance();
		switch (this._unit) {
		case "%":
			return (this._value * parentSize()) / 100;
		case "in":
			return this._value * met.inSize;
		case "cm":
			return this._value * met.cmSize;
		case "mm":
			return this._value * met.mmSize;
		case "pt":
			return this._value * met.ptSize;
		case "pc":
			return this._value * met.pcSize;
		case "px":
			return this._value;
		case "rem":
		case "em":
			return this._value * met.emSize;
		case "rex":
		case "ex":
			return this._value * met.exSize;
		default:
			return 0;
		}
	}

	public toString():string {
		let unit = this._unit;
		if (unit == "em") {
			unit = "rem";
		} else if (unit == "ex") {
			unit = "rex";
		}
		return `${this._value}${unit}`;
	}

	public static equals(a:CssLength|null, b:CssLength|null):boolean {
		if (a == null || b == null) {
			return a == b;
		} else {
			return a._value == b._value && a._unit == b._unit;
		}
	}

}