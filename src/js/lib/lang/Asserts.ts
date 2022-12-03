import * as err from "./Error";

export class Asserts {

	public static require(cond:boolean, message?:string):void {
		if (!cond) {
			throw new err.ParamError(message);
		}
	}

	public static assume(cond:boolean, message?:string):void {
		if (!cond) {
			throw new err.StateError(message);
		}
	}

	public static ensure(cond:boolean, message?:string):void {
		if (!cond) {
			throw new err.LogicalError(message);
		}
	}

}
