import { Strings } from "~/lib/lang/Strings";

export class Logs {

	private static readonly NAME = "Function.Logs.getCaller";

	private static readonly DEPTH = 2; //message, error|info|warn|debug|verbose

	private static getCaller():string {
		let frame = ((new Error()).stack as string);
		let elems = frame.split("\n");
		let result = "?";
		for (let i = 0; i < elems.length; i++) {
			let e = elems[i];
			let fields = e.trim().split(" ");
			if (fields[0] == "at") {
				let callerName = fields[1];
				if (callerName.startsWith(Logs.NAME)) {
					let e2 = elems[i + Logs.DEPTH + 1];
					let callerFields = e2.trim().split(" ");
					if (callerFields[1] == "new") {
						result = callerFields[1] + " " + callerFields[2];
					} else {
						result = callerFields[1];
					}
					break;
				}
			}
		}
		return result;
	}

	public static message(type:string, format:string, args:any[]):string {
		let now = new Date();
		let message = Strings.sprintf("%02d/%02d %02d:%02d:%02d.%03d %s %s at %s",
			//now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds(),
			type,
			Strings.vsprintf(format, args),
			Logs.getCaller()
		);
		return message;
	}

	public static error(format:string, ...args: any[]):void {
		console.error(Logs.message("E", format, args));
	}

	public static warn(format:string, ...args: any[]):void {
		console.warn(Logs.message("W", format, args));
	}

	public static info(format:string, ...args: any[]):void {
		console.info(Logs.message("I", format, args));
	}

	public static debug(format:string, ...args: any[]):void {
		console.log(Logs.message("D", format, args));
	}

	public static verbose(format:string, ...args: any[]):void {
		console.log(Logs.message("V", format, args));
	}

	public static dump(obj:Object):void {
		console.log(obj);
	}

}
