import { Asserts } from "../lang";
import { Metrics } from "./Metrics";
import { UiApplication } from "./UiApplication";

export class CssLength {

	private static UNITS = [
		"rem", "rex", "%", "in", "cm", "mm", "pt", "pc", "px", "em", "ex"
	]; 

	public static ZERO:CssLength = new CssLength("0px");

	private _value:number;

	private _unit:string;

	public constructor(arg:string) {
		let str = arg.toLowerCase();
		this._unit = "px";
		for (let u of CssLength.UNITS) {
			if (str.endsWith(u)) {
				let mid = str.length - u.length;
				this._unit = str.substring(mid);
				str = str.substring(0, mid);
				break;
			}
		}
		this._value = Number(str);
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

}