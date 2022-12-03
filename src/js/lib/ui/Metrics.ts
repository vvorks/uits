import { Logs } from "../lang";

export class Metrics {

	public static _instance:Metrics = new Metrics();

	public static getInstance() {
		return Metrics._instance;
	}

	private _emSize:number = 0;

	private _exSize:number = 0;

	private _inSize:number = 0;

	public measure(owner:HTMLElement):void {
		this._emSize = this.measureSize(owner, "10em") / 10.0;
		this._exSize = this.measureSize(owner, "10ex") / 10.0;
		this._inSize = this.measureSize(owner, "1in");
	}

	private measureSize(owner:HTMLElement, size:string):number {
		let div:HTMLDivElement = document.createElement("div") as HTMLDivElement;
		let style = div.style;
		style.position = "absolute";
		style.boxSizing = "border-box";
		style.margin = "0px";
		style.borderWidth = "0px";
		style.padding = "0px";
		style.left = "0px";
		style.top = "0px";
		style.overflow = "hidden";
		style.borderStyle = "solid";
		style.width = size;
		style.height = size;
		owner.appendChild(div);
		let result = div.offsetWidth;
		owner.removeChild(div);
		return result;
	}
	
	public get emSize():number {
		return this._emSize;
	}

	public get exSize():number {
		return this._exSize;
	}

	public get inSize():number {
		return this._inSize;
	}

	public get cmSize():number {
		return this._inSize / 2.54;
	}

	public get mmSize():number {
		return this._inSize / 25.4;
	}

	public get ptSize():number {
		return this._inSize / 72.0;
	}

	public get pcSize():number {
		return this._inSize /  6.0;
	}

}
