import { Changed, UiNode } from "./UiNode";
import { UiStyle } from "./UiStyle";

export class UiPageNode extends UiNode {
	
	public getPageNode():UiNode|null {
		return this;
	}

	protected syncStyle():void {
		if (!this.isChanged(Changed.STYLE)) {
			return;
		}
		let sb = "";
		let prefix = this.className + this._id + "_";
		let styles:UiStyle[] = Array.from(this.collectStyle(prefix, new Set<UiStyle>()));
		sb = "";
		for (let s of styles) {
			sb += "." + prefix + s.id + " " + s.toCssString() + "\n";
		}
		this.setStyleNode(prefix + "style", sb);
		this.setChanged(Changed.STYLE, false);
	}

	public onUnmount():void {
		super.onUnmount();
		this.clearStyle();
	}

	protected clearStyle():void {
		let prefix = this.className + this._id + "_";
		let nodeId = prefix + "style";
		let node = document.getElementById(nodeId);
		if (node != null && node.parentElement != null) {
			node.parentElement.removeChild(node);
		}
	}

}