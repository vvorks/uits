import { ParamError } from "../lang";
import { CssLength } from "./CssLength";
import { Inset } from "./Inset";
import { UiApplication } from "./UiApplication";
import { UiNode, UiResult } from "./UiNode";

export type PaneLocation = "top"|"left"|"right"|"bottom"|"center";

export class UiPane extends UiNode {

	private _location: PaneLocation;

	private _shrinkedSize:CssLength;

	private _expandedSize:CssLength;

	public clone():UiPane {
		return new UiPane(this);
	}

	constructor(app:UiApplication, name?:string);
	constructor(src:UiPane);
	public constructor(param:any, name?:string) {
		if (param instanceof UiPane) {
			super(param as UiPane);
			let src = param as UiPane;
			this._location = src._location;
			this._shrinkedSize = src._shrinkedSize;
			this._expandedSize = src._expandedSize;
		} else {
			super(param, name);
			this._location = "center";
			this._shrinkedSize = new CssLength("0px");
			this._expandedSize = new CssLength("0px");
		}
	}

	public get location():PaneLocation {
		return this._location;
	}

	public set location(loc:PaneLocation) {
		this._location = loc;
	}

	public get shrinkedSize():string {
		return this._shrinkedSize.toString();
	}

	public get expandedSize():string {
		return this._expandedSize.toString();
	}

	public get computedSize():number {
		let size = this.isExpanded() ? this._expandedSize : this._shrinkedSize;
		return size.toPixel(() => this.parentSize);
	}

	protected isExpanded():boolean {
		let app = this.application;
		let focus = app.getFocusOf(this);
		return (focus != null && this.isAncestorOf(focus));
	}

	protected get parentSize():number {
		if (this._location == "top" || this._location == "bottom") {
			return (this.parent as UiNode).innerHeight;
		} else {
			return (this.parent as UiNode).innerWidth;
		}
	}

	public setFlexSize(shrinkedSize:string|number, expandedSize:string|number) {
		let shSize:CssLength = new CssLength(shrinkedSize);
		let exSize:CssLength = new CssLength(expandedSize);
		if (!CssLength.equals(this._shrinkedSize, shSize) || !CssLength.equals(this._expandedSize, exSize)) {
			this._shrinkedSize = shSize;
			this._expandedSize = exSize;
			this.onLocationChanged();
		}
	}

}

export class UiDock extends UiNode {

	public insertChild(child:UiNode, after:UiNode|null):void {
		if (!(child instanceof UiPane)) {
			throw new ParamError();
		}
		super.insertChild(child, after);
	}

	public onMount():void {
		this.relocatePane();
		super.onMount();
	}

	protected relocatePane():void {
		let inset:Inset = new Inset(0, 0, 0, 0);
		for (let c of this._children) {
			let p = c as UiPane;
			let size = p.computedSize;
			switch (p.location) {
			case "left":
				p.locate(inset.left, inset.top, null, inset.bottom, size, null);
				inset.left += size;
				break;
			case "right":
				p.locate(null, inset.top, inset.right, inset.bottom, size, null);
				inset.right += size;
				break;
			case "top":
				p.locate(inset.left, inset.top, inset.right, null, null, size);
				inset.top += size;
				break;
			case "bottom":
				p.locate(inset.left, null, inset.right, inset.bottom, null, size);
				inset.bottom += size;
				break;
			case "center":
				//do nothing here
				break;
			}
		}
		for (let c of this._children) {
			let p = c as UiPane;
			switch (p.location) {
			case "center":
				p.locate(inset.left, inset.top, inset.right, inset.bottom, null, null);
				break;
			default:
				break;
			}
		}
	}

	public onFocus(target: UiNode|null, gained: boolean, other:UiNode|null):UiResult {
		if (gained) {
			this.relocatePane();
		}
		return super.onFocus(target, gained, other);
	}

}