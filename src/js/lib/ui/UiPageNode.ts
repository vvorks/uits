import { Logs, Properties } from "../lang";
import { Scrollable } from "./Scrollable";
import { UiApplication } from "./UiApplication";
import { Changed, UiNode } from "./UiNode";
import { UiStyle } from "./UiStyle";

enum PageFlags {
	INITIAL = 0,
	INITIALIZED = 1,
}

export class UiPageNode extends UiNode {

	private _hScrollables: Properties<Scrollable[]>;

	private _vScrollables: Properties<Scrollable[]>;

	private _arguments: Properties<string>;

	private _pageFlags: PageFlags;

	public clone():UiPageNode {
		return new UiPageNode(this);
	}

	constructor(app:UiApplication, args?:Properties<string>);
	constructor(src:UiPageNode);
	public constructor(param:any, args?:Properties<string>) {
		if (param instanceof UiPageNode) {
			super(param as UiPageNode);
			let src = param as UiPageNode;
			this._arguments = src._arguments;
			this._pageFlags = src._pageFlags;
		} else {
			super(param as UiApplication);
			this._arguments = (args === undefined) ? {} : args;
			this._pageFlags = PageFlags.INITIAL;
		}
		this._hScrollables = {};
		this._vScrollables = {};
	}

	public getPageNode():UiPageNode|null {
		return this;
	}

	public get initialized():boolean {
		return this.getPageFlag(PageFlags.INITIALIZED);
	}

	public set initialized(on:boolean) {
		this.setPageFlag(PageFlags.INITIALIZED, on);
	}

	protected getPageFlag(bit:PageFlags):boolean {
		return !!(this._pageFlags & bit);
	}

	protected setPageFlag(bit:PageFlags, on:boolean):boolean {
		let changed:boolean = (this.getPageFlag(bit) != on);
		if (changed) {
			if (on) {
				this._pageFlags |= bit;
			} else {
				this._pageFlags &= ~bit;
			}
		}
		return changed;
	}

	public onMount():void {
		if (!this.initialized) {
			this.initialize(this._arguments);
			this.initialized = true;
		}
		super.onMount();
		this.initScroll(this._hScrollables, (s)=>s.fireHScroll());
		this.initScroll(this._vScrollables, (s)=>s.fireVScroll());
		this.setChanged(Changed.STYLE, true);
	}

	protected initialize(args:Properties<string>):void {
	}

	private initScroll(prop:Properties<Scrollable[]>, func:(s:Scrollable)=>void) {
		for (const [k, v] of Object.entries(prop)) {
			let s = v as Scrollable[];
			if (s.length > 1) {
				func(s[0]);
			}
		}
	}

	public onUnmount():void {
		super.onUnmount();
		this.clearStyle();
	}

	protected syncStyle():void {
		if (!this.isChanged(Changed.STYLE)) {
			return;
		}
		let sb = "";
		let prefix = this.className + this.id + "_";
		let styles:UiStyle[] = Array.from(this.collectStyle(prefix, new Set<UiStyle>()));
		sb = "";
		for (let s of styles) {
			sb += "." + prefix + s.id + " " + s.toCssString() + "\n";
		}
		this.setStyleNode(prefix + "style", sb);
		this.setChanged(Changed.STYLE, false);
	}

	protected clearStyle():void {
		let prefix = this.className + this.id + "_";
		let nodeId = prefix + "style";
		let node = document.getElementById(nodeId);
		if (node != null && node.parentElement != null) {
			node.parentElement.removeChild(node);
		}
	}

	public attachHScroll(name:string, scrollable:Scrollable):void {
		this.attachScroll(this._hScrollables, name, scrollable);
	}

	public detachHScroll(name:string, scrollable:Scrollable):void {
		this.detachScroll(this._hScrollables, name, scrollable);
	}

	public attachVScroll(name:string, scrollable:Scrollable):void {
		this.attachScroll(this._vScrollables, name, scrollable);
	}

	public detachVScroll(name:string, scrollable:Scrollable):void {
		this.detachScroll(this._vScrollables, name, scrollable);
	}

	private attachScroll(prop:Properties<Scrollable[]>, name:string, scrollable:Scrollable):void {
		let array = prop[name];
		if (array !== undefined) {
			let index = array.indexOf(scrollable);
			if (index == -1) {
				array.push(scrollable);
			}
		} else {
			array = [];
			prop[name] = array;
			array.push(scrollable);
		}
	}

	private detachScroll(prop:Properties<Scrollable[]>, name:string, scrollable:Scrollable):void {
		let array = prop[name];
		if (array !== undefined) {
			let index = array.indexOf(scrollable);
			if (index != -1) {
				array.splice(index, 1);
			}
		}
	}

	public dispatchHScroll(name:string, source:Scrollable, offset:number, limit:number, count:number) {
		let array = this._hScrollables[name];
		if (array !== undefined) {
			for (let s of array) {
				if (s != source) {
					s.onHScroll(source, offset, limit, count);
				}
			}
		}
	}

	public dispatchVScroll(name:string, source:Scrollable, offset:number, limit:number, count:number) {
		let array = this._vScrollables[name];
		if (array !== undefined) {
			for (let s of array) {
				if (s != source) {
					s.onVScroll(source, offset, limit, count);
				}
			}
		}
	}

}