import { Logs, Properties, StateError } from "~/lib/lang";

export class HistoryState {

	/** ハッシュタグ */
	private _hashTag:string;

	private _arguments:Properties<string>;

	public constructor(param:string, args?:Properties<string>) {
		if (args === undefined) {
			let hash = param;
			if (hash == "") {
				this._hashTag = "";
				this._arguments = {};
			} else {
				let index = hash.indexOf(':');
				if (index == -1) {
					this._hashTag = hash.substring(1);
					this._arguments = {};
				} else {
					this._hashTag = hash.substring(1, index);
					this._arguments = this.decodeArguments(hash.substring(index + 1));
				}
			}
		} else {
			this._hashTag = param;
			this._arguments = args;
		}
	}

	private decodeArguments(str:string):Properties<string> {
		let result: Properties<string> = {};
		for (let param of str.split("&")) {
			let pair = param.split('=');
			if (pair.length == 1) {
				let key = pair[0];
				result[key] = "";
			} else {
				let key = pair[0];
				let value = pair[1];
				result[key] = value;
			}
		}
		return result;
	}

	private encodeArguments(props:Properties<string>):string {
		let b = "";
		let sep = "";
		for (const [key, value] of Object.entries(props)) {
			if (value != "") {
				b += sep + key + "=" + value;
			} else {
				b += sep + key;
			}
			sep = "&";
		}
		return b;
	}

	public get tag():string {
		return this._hashTag;
	}

	public get arguments():Properties<string> {
		return this._arguments;
	}

	public get hash():string {
		if (this._hashTag == "") {
			return "";
		} else if (Object.entries(this._arguments).length == 0) {
			return "#" + this._hashTag;
		} else {
			return "#" + this._hashTag + ":" + this.encodeArguments(this._arguments);
		}
	}

}

class PageHistory {

	private _states: HistoryState[];

	public constructor(hash:string) {
		this._states = [new HistoryState(hash)];
	}

	public getPageStates(): HistoryState[] {
		return this._states;
	}

	public setPageStates(states:HistoryState[]): void {
		this._states = states;
	}

}

type HistoryElement = {
	index: number
};

export class HistoryManager {

	private _index: number = 0;

	private _nextIndex: number = 0;

	private _hisotries: PageHistory[] = [];

	public forward() {
		window.history.forward();
	}

	public back() {
		window.history.back();
	}

	public go(tag: string, args: Properties<string>) {
		let hash = new HistoryState(tag, args).hash;
		window.history.pushState({index: this._index}, "");
		window.location.hash = hash;
	}

	public popstate(state:any):void {
		Logs.info("popstate %s index %d length %d", JSON.stringify(state), this._index, this._hisotries.length);
		if (state === undefined || state === null) {
			this._nextIndex = this._index + 1;
		} else {
			let newState = (state as HistoryElement);
			this._nextIndex = newState.index;
		}
	}

	public saveHistoryStates(states:HistoryState[]):void {
		if (this._index < this._hisotries.length) {
			this._hisotries[this._index].setPageStates(states);
		}
	}

	public loadHistoryStates(hash: string):HistoryState[] {
		let result:HistoryState[];
		Logs.debug("restoreHistoryStates index %d length %d", this._index, this._hisotries.length);
		this._index = this._nextIndex;
		if (this._index < this._hisotries.length) {
			result = this._hisotries[this._index].getPageStates();
		} else {
			this._hisotries.push(new PageHistory(hash));
			this._index = this._hisotries.length - 1;
			result = this._hisotries[this._index].getPageStates();
		}
		for (let e of result) {
			Logs.info("GOTO [%s] %s", e.tag, JSON.stringify(e.arguments));
		}
		return result;
	}

}