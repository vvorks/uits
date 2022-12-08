import { Asserts, Logs, StateError } from "../lang";
import { Colors } from "./Colors";
import { Rect } from "./Rect";
import { UiNode, UiResult } from "./UiNode";
import { UiStyle, UiStyleBuilder } from "./UiStyle";

const RECORD_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.TRANSPARENT)
	.borderSize("0px")
	.build();

const MARGIN = 3;

class UiRecord extends UiNode {

	public clone():UiRecord {
		return new UiRecord(this);
	}

	public get className():string {
		return "UiRecord";
	}

	public setNo(no:number):void {
		this._children[0].content = "" + no;
	}

}

enum ListFlags {
	VERTICAL		= 0x00000001,
	INITIAL			= VERTICAL
}

export enum CursorMode {
	EXIT = 0,
	STOP = 1,
	LOOP = 2,
}

export class UiListNode extends UiNode {

	private _cursorMode: CursorMode;

	private _listFlags:number;

	private _template: UiRecord | null;

	private _templateRect: Rect | null;

	private _recSize: number;

	private _pageSize:number;

	private _recsPerPage:number;

	public clone():UiListNode {
		return new UiListNode(this);
	}

	public get className():string {
		return "UiListNode";
	}

	public constructor(param:any, name?:string) {
		super(param, name);
		if (param instanceof UiListNode) {
			let src = param as UiListNode;
			this._cursorMode = src._cursorMode;
			this._listFlags = src._listFlags;
			this._template = src._template;
			this._templateRect = src._templateRect;
			this._recSize = src._recSize;
			this._pageSize = src._pageSize;
			this._recsPerPage = src._recsPerPage;
		} else {
			this._cursorMode = CursorMode.EXIT;
			this._listFlags = ListFlags.INITIAL;
			this._template = null;
			this._templateRect = null;
			this.vertical = true; //TODO kari
			this._recSize = 0;
			this._pageSize = 0;
			this._recsPerPage = 0;
		}
	}

	public get cursorMode():CursorMode {
		return this._cursorMode;
	}

	public set cursorMode(mode:CursorMode) {
		this._cursorMode = mode;
	}

	public get vertical():boolean {
		return this.getListFlag(ListFlags.VERTICAL);
	}

	public set vertical(on:boolean) {
		Asserts.assume(this._template == null);
		this.setListFlag(ListFlags.VERTICAL, on);
	}

	protected getListFlag(bit:ListFlags):boolean {
		return !!(this._listFlags & bit);
	}

	protected setListFlag(bit:ListFlags, on:boolean):boolean {
		let changed:boolean = (this.getListFlag(bit) != on);
		if (changed) {
			if (on) {
				this._listFlags |= bit;
			} else {
				this._listFlags &= ~bit;
			}
		}
		return changed;
	}

	public onMount():void {
		if (this._template == null) {
			this._templateRect = this.getChildrenRect();
			this._template = this.makeTemplate(this._templateRect);
		}
		this.measureSize();
		this.prepareArea();
		this.prepareRecs();
		this.relocateRecs();
		super.onMount();
	}

	private makeTemplate(rTemplate:Rect):UiRecord {
		let template = new UiRecord(this.application);
		if (this.vertical) {
			template.left = "0px";
			template.right = "0px"
			template.top = "0px";
			template.height = `${rTemplate.height}px`;
			for (let c of this._children) {
				let rChild = c.getRect();
				c.top = `${rChild.top - rTemplate.top}px`;
				c.height = `${rChild.height}px`;
				c.bottom = null;
			}
		} else {
			template.left = "0px";
			template.width = `${rTemplate.width}px`;
			template.top = "0px";
			template.bottom = "0px";
			for (let c of this._children) {
				let rChild = c.getRect();
				c.left = `${rChild.left - rTemplate.left}px`;
				c.width = `${rChild.width}px`;
				c.right = null;
			}
		}
		template.adoptChildren(this);
		template.style = RECORD_STYLE;
		return template;
	}

	protected measureSize():void {
		if (this._templateRect == null) {
			throw new StateError();
		}
		let rTemplate = this._templateRect;
		if (this.vertical) {
			this._recSize = rTemplate.top + rTemplate.height;
			this._pageSize = this.innerHeight;
		} else {
			this._recSize = rTemplate.left + rTemplate.width;
			this._pageSize = this.innerWidth;
		}
		this._recsPerPage = Math.ceil(this._pageSize / this._recSize);
	}

	protected prepareArea():void {
		if (this._templateRect == null) {
			throw new StateError();
		}
		let rTemplate = this._templateRect;
		let n = this._recsPerPage + MARGIN * 2;
		if (this.vertical) {
			this.scrollLeft = "0px";
			this.scrollTop = `${this._recSize * MARGIN}px`;
			this.scrollWidth = "0px";
			this.scrollHeight = `${this._recSize * n + rTemplate.top}px`;
		} else {
			this.scrollLeft = `${this._recSize * MARGIN}px`;
			this.scrollTop = "0px";
			this.scrollWidth = `${this._recSize * n + rTemplate.left}px`;
			this.scrollHeight = "0px";
		}
	}

	protected prepareRecs():void {
		if (this._template == null) {
			throw new StateError();
		}
		let m = this._children.length;
		let n = this._recsPerPage + MARGIN * 2;
		for (let i = m; i < n; i++) {
			let rec = this._template.clone();
			this.appendChild(rec);
			rec.setNo(i); //debug
		}
	}

	protected relocateRecs():void {
		if (this._template == null || this._templateRect == null) {
			throw new StateError();
		}
		let n = this._children.length;
		let r = this._templateRect as Rect;
		if (this.vertical) {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let y = r.top + i * (r.top + r.height);
				rec.top = `${y}px`
			}
		} else {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let x = r.left + i * (r.left + r.width);
				rec.left = `${x}px`
			}
		}
	}

	public scrollFor(node:UiNode):UiResult {
		let result = super.scrollFor(node);
		if (this.vertical) {
			result |= this.adjustScrollTop();
		} else {
			result |= this.adjustScrollLeft();
		}
		return result;
	}

	protected adjustScrollTop():UiResult {
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let y = scroll.y;
		let result = UiResult.IGNORED;
		while (y < margin) {
			this._children.unshift(this._children.pop() as UiNode);
			y += this._recSize;
		}
		while (scroll.height - (y + this._pageSize) < margin) {
			this._children.push(this._children.shift() as UiNode);
			y -= this._recSize;
		}
		if (y != scroll.y) {
			this.scrollTop = `${y}px`;
			this.relocateRecs();
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	protected adjustScrollLeft():UiResult {
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let x = scroll.x;
		let result = UiResult.IGNORED;
		while (x < margin) {
			this._children.unshift(this._children.pop() as UiNode);
			x += this._recSize;
		}
		while (scroll.height - (x + this._pageSize) < margin) {
			this._children.push(this._children.shift() as UiNode);
			x -= this._recSize;
		}
		if (x != scroll.x) {
			this.scrollLeft = `${x}px`;
			this.relocateRecs();
			result |= UiResult.AFFECTED;
		}
		return result;
	}

}