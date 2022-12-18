import {vsprintf as jvsprintf} from "sprintf-js";
import { Properties } from "../lang";

const ESCAPE_PATTERN = /[&<>"'\/]/g;

const ESCAPE_CHARS:Properties<string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

export class Strings {

	public static escapeHtml(str:string):string {
		return str.replace(ESCAPE_PATTERN, c => ESCAPE_CHARS[c] as string);
	}

	public static repeat(str:string, count:number):string {
		let result = "";
		for (let i = 0; i < count; i++) {
			result += str;
		}
		return result;
	}

	public static sprintf(format:string, ...args: any[]):string {
		return jvsprintf(format, args);
	}

}