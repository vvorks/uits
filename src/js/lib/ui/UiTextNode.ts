import { Logs, Properties, Types, Value } from "../lang";
import { UiNode } from "./UiNode";

export class UiTextNode extends UiNode {

	private _textContent: Value = null;

	public clone():UiTextNode {
		return new UiTextNode(this);
	}

	public get textContent():Value {
		return this._textContent;
	}

	public set textContent(value:Value) {
		if (this._textContent != value) {
			this._textContent = value;
			this.onContentChanged();
		}
	}

	protected createDomElement(target:UiNode, tag:string):HTMLElement {
		let border = this.getBorderSize();
		let dom = super.createDomElement(target, tag);
		let div = document.createElement("div");
		let style = div.style;
		style.position = "absolute";
		style.left = `${border.left}px`;
		style.right = `${border.right}px`;
		dom.appendChild(div);
		return dom;
	}

	protected renderContent():void {
		let border = this.getBorderSize();
		let dom = this.domElement as HTMLElement;
		let div = dom.firstChild as HTMLDivElement;
		let cssStyle = div.style;
		let uiStyle = this.style.getEffectiveStyle(this);
		let align = uiStyle.textAlign;
		let valign = uiStyle.verticalAlign;
		cssStyle.textAlign = align;
		if (valign == "top") {
			cssStyle.top = `${border.top}px`;
		} else if (valign == "bottom") {
			cssStyle.bottom = `${border.bottom}px`;
		} else {
			cssStyle.top = "50%";
			cssStyle.transform = "translate(0,-50%)";
		}
		div.innerText = this.asString(this.textContent);
	}

	protected asString(value:Value):string {
		let result:string;
		if (Types.isString(value)) {
			result = value as string;
		} else if (Types.isNumber(value)) {
			result = "" + value;
		} else if (Types.isBoolean(value)) {
			result = (value as boolean) ? "true" : "false";
		} else {
			result = "";
		}
		return result;
	}

}