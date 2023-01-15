import
	{ Types, Value }
	from "~/lib/lang";
import { Color, Colors } from "~/lib/ui/Colors";
import { UiNode } from "~/lib/ui/UiNode";

const RESOURCE_HEAD_MARKER = "{{";
const RESOURCE_TAIL_MARKER = "}}";

export class UiTextNode extends UiNode {

	private _textContent: Value = null;

	private _textColor: Color|null = null;

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

	public get textColor():Color|null {
		return this._textColor;
	}

	public set textColor(value:Color|null) {
		if (this._textColor != value) {
			this._textColor = value;
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
		if (this._textColor != null) {
			cssStyle.color = Colors.toCssColor(this._textColor);
		} else {
			cssStyle.removeProperty("color");
		}
		div.innerText = this.asString(this.textContent);
	}

	protected asString(value:Value):string {
		let result:string;
		if (Types.isString(value)) {
			result = this.retrieveTextResource(value as string);
		} else if (Types.isNumber(value)) {
			result = "" + value;
		} else if (Types.isBoolean(value)) {
			result = (value as boolean) ? "true" : "false";
		} else {
			result = "";
		}
		return result;
	}

	protected retrieveTextResource(raw:string):string {
		let str = raw.trim();
		if (str !== raw) {
			return str;
		}
		let len = raw.length;
		if (len <= RESOURCE_HEAD_MARKER.length + RESOURCE_TAIL_MARKER.length) {
			return raw;
		}
		let head = raw.substring(0   , RESOURCE_HEAD_MARKER.length);
		let tail = raw.substring(len - RESOURCE_TAIL_MARKER.length);
		if (head != RESOURCE_HEAD_MARKER || tail != RESOURCE_TAIL_MARKER) {
			return raw;
		}
		let tag = raw.substring(RESOURCE_HEAD_MARKER.length, len - RESOURCE_TAIL_MARKER.length);
		let app = this.application;
		let result = app.findTextResourceAsString(tag, raw);
		return result;
	}

}