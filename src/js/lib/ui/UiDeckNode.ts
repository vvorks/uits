import
	{ Properties }
	from "~/lib/lang";
import { UiApplication, UiAxis } from "~/lib/ui/UiApplication";
import { UiNode } from "~/lib/ui/UiNode";

export class UiDeckNode extends UiNode {

	private _selected: string|null;

	private _savedFocusNodes:Properties<UiNode> = {};

	public clone():UiDeckNode {
		return new UiDeckNode(this);
	}

	constructor(app:UiApplication, name?:string);
	constructor(src:UiDeckNode);
	public constructor(param:any, name?:string) {
		super(param, name);
		if (param instanceof UiDeckNode) {
			let src = param as UiDeckNode;
			this._selected = src._selected;
		} else {
			this._selected = null;
		}
	}

	public onMount():void {
		super.onMount();
		this.initSavedFocusNodes();
		if (this._selected == null && this._children.length > 0) {
			this.select(this._children[0].name);
		}
	}

	private initSavedFocusNodes():void {
		let app = this.application;
		for (let c of this._children) {
			let list = c.getDescendantsIf((e)=>app.isAppearedFocusable(e), 1);
			if (list.length > 0) {
				this._savedFocusNodes[c.name] = list[0];
			}
		}
	}

	public select(name:string):void {
		if (this._selected != name) {
			let app = this.application;
			let focusNode = app.getFocusOf(this);
			let focusLost = false;
			for (let c of this._children) {
				if (c.name == name) {
					c.visible = true;
				} else if (c.visible) {
					if (focusNode != null && c.isAncestorOf(focusNode)) {
						this._savedFocusNodes[c.name] = focusNode;
						focusLost = true;
					}
					c.visible = false;
				}
			}
			if (focusLost) {
				let saved = this._savedFocusNodes[name];
				if (saved !== undefined) {
					app.setFocus(saved, UiAxis.XY);
				}
			}
			this._selected = name;
		}
	}

}