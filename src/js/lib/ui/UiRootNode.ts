import { Rect } from "./Rect";
import { Changed, UiNode } from "./UiNode";

export class UiRootNode extends UiNode {

	public clone():UiRootNode {
		return new UiRootNode(this);
	}

	public getPageNode():UiNode|null {
		return null;
	}

	protected calcRect():Rect {
		let rect = new Rect();
		rect.locate(0, 0, this.application.clientWidth, this.application.clientHeight);
		return rect;
	}

	protected get innerWidth(): number {
		return this.application.clientWidth;
	}

	protected get innerHeight(): number {
		return this.application.clientHeight;
	}

	protected createDomElement(target:UiNode, tag:string):HTMLElement {
		return target == this ? this.application.rootElement : document.createElement(tag);
	}

	protected getWrappedRect():Rect {
		return new Rect(this.getRect());
	}

	protected syncStyle():void {
		if (!this.isChanged(Changed.STYLE)) {
			return;
		}
		let sb = "";
		sb += "BODY {user-select:none;}\n";
		sb += "BODY,DIV {";
		sb += "box-sizing:border-box;";
		sb += "margin:auto;";
		sb += "border-width:0px;";
		sb += "padding:0px;";
		sb += "overflow:hidden;";
		sb += "border-style:solid;";
		sb += "}\n";
		this.setStyleNode("COMMON", sb);
		this.setChanged(Changed.STYLE, false);
	}

	protected syncStyleClass():void {
		return;
	}

	protected syncHierarchy():void {
		this.setChanged(Changed.HIERARCHY, false);
	}

}