import { sprintf, vsprintf } from "sprintf-js";

export class Logs {

	private static readonly NAME = "Function.Logs";

	private static getCaller():string {
		let elems = ((new Error()).stack as string).split("\n");
		let state = 0;
		let result = "?";
		for (let e of elems) {
			let fields = e.trim().split(" ");
			if (fields.length == 3 && fields[0] == "at") {
				let callerName = fields[1];
				if (state == 0 && callerName.startsWith(Logs.NAME)) {
					state = 1;
				} else if (state == 1 && !callerName.startsWith(Logs.NAME)) {
					let desc = fields[2];
					let path = desc.substring(1, desc.length - 1).split("\/");
					let loc = path[path.length - 1];
					let lastColon = loc.lastIndexOf(":");
					if (lastColon > 0) {
						loc = loc.substring(0, lastColon);
					}
					//result = callerName + "(" + loc + ")";
					result = loc;
					break;
				}
			}
		}
		return result;
	}

	public static log(type:string, format:string, args:any[]) {
		let now = new Date();
		let message = sprintf("%02d/%02d %02d:%02d:%02d.%03d %s %s at %s",
			//now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds(),
			type,
			vsprintf(format, args),
			Logs.getCaller()
		);
		//console.log(message);
		setTimeout(window.console.log.bind(window.console, message));
	}

	public static error(format:string, ...args: any[]):void {
		Logs.log("E", format, args);	
	}

	public static warn(format:string, ...args: any[]):void {
		Logs.log("W", format, args);	
	}

	public static info(format:string, ...args: any[]):void {
		Logs.log("I", format, args);	
	}

	public static debug(format:string, ...args: any[]):void {
		Logs.log("D", format, args);	
	}

	public static verbose(format:string, ...args: any[]):void {
		Logs.log("V", format, args);	
	}

	public static dump(obj:Object):void {
		console.log(obj);	
	}

}
