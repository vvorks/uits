import { Scrollable } from "./Scrollable";
import { UiApplication } from "./UiApplication";
import { UiNode } from "./UiNode";

export const COMPONENT_THUMB = "thumb";

export class UiScrollbar extends UiNode {

	private _mainThumb: UiNode;

	private _subThumb: UiNode;

	private _lastOffset: number;

	private _lastLimit: number;

	private _lastCount: number;

	private _lastRatio: number;

	public get className():string {
		return "UiScrollbar";
	}

	public clone():UiScrollbar {
		return new UiScrollbar(this);
	}

	constructor(app:UiApplication, name?:string);
	constructor(src:UiScrollbar);
	public constructor(param:any, name?:string) {
		if (param instanceof UiScrollbar) {
			super(param as UiScrollbar);
			let src = param as UiScrollbar;
			this._mainThumb = this._children[0];
			this._subThumb = this._children[1];
			this._lastOffset = src._lastOffset;
			this._lastLimit = src._lastLimit;
			this._lastCount = src._lastCount;
			this._lastRatio = src._lastRatio;
		} else {
			super(param as UiApplication, name);
			let app = param as UiApplication;
			this._mainThumb = new UiNode(app, COMPONENT_THUMB);
			this._subThumb = new UiNode(app, COMPONENT_THUMB);
			this.appendChild(this._mainThumb);
			this.appendChild(this._subThumb);
			this._lastOffset = 0;
			this._lastLimit = 0;
			this._lastCount = 0;
			this._lastRatio = 0;
		}
	}

	protected onStyleChanged():void {
		let style = this.style;
		this._mainThumb.style = style;
		this._subThumb.style = style;
	}

	public onHScroll(source:Scrollable, offset:number, limit:number, count:number):void {
		this._lastOffset = offset;
		this._lastLimit = limit;
		this._lastCount = count;
		this._lastRatio = count / this.innerWidth;
		if (offset + limit <= count) {
			//通常のケース
			let left  = 100.0 * offset / count;
			let width = 100.0 * limit  / count;
			this._mainThumb.locate(`${left}%`, 0, null, 0, `${width}%`, null);
			this._subThumb.locate(0, 0, null, 0, 0, null);
			this._mainThumb.visible = true;
			this._subThumb.visible = false;
		} else {
			//ラップケース
			let left   = 100.0 * offset / count;
			let remain = 100.0 * (offset + limit - count) / count;
			this._mainThumb.locate(`${left}%`, 0, null, 0, "100%", null);
			this._subThumb.locate(0, 0, null, 0, `${remain}%`, null);
			this._mainThumb.visible = true;
			this._subThumb.visible = true;
		}
	}

	public onVScroll(source:Scrollable, offset:number, limit:number, count:number):void {
		this._lastOffset = offset;
		this._lastLimit = limit;
		this._lastCount = count;
		this._lastRatio = count / this.innerHeight;
		if (offset + limit <= count) {
			//通常のケース
			let top  = 100.0 * offset / count;
			let height = 100.0 * limit  / count;
			this._mainThumb.locate(0, `${top}%`, 0, null, null, `${height}%`);
			this._subThumb.locate(0, 0, 0, null, null, 0);
			this._mainThumb.visible = true;
			this._subThumb.visible = false;
		} else {
			//ラップケース
			let top   = 100.0 * offset / count;
			let remain = 100.0 * (offset + limit - count) / count;
			this._mainThumb.locate(0, `${top}%`, 0, null, null, "100%");
			this._subThumb.locate(0, 0, 0, null, null, `${remain}%`);
			this._mainThumb.visible = true;
			this._subThumb.visible = true;
		}

	}

}