import
	{ Types, Value }
	from "~/lib/lang";
import { Color, Colors } from "~/lib/ui/Colors";
import { UiNode } from "~/lib/ui/UiNode";

const RESOURCE_HEAD_MARKER = "{{";
const RESOURCE_TAIL_MARKER = "}}";

const VALIGN_TRANSFORM = false;

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
		if (VALIGN_TRANSFORM) {
			let div = document.createElement("div");
			let style = div.style;
			style.position = "absolute";
			style.left = `${border.left}px`;
			style.right = `${border.right}px`;
			dom.appendChild(div);
		} else {
			let tb = document.createElement("div");
			let style = tb.style;
			style.display = "table";
			style.width = "100%";
			style.height = "100%";
			let td = document.createElement("div");
			let tdStyle = td.style;
			tdStyle.display = "table-cell";
			tdStyle.width = "100%";
			tdStyle.height = "100%";
			tb.appendChild(td);
			dom.appendChild(tb);
		}
		return dom;
	}

	protected renderContent():void {
		let border = this.getBorderSize();
		let dom = this.domElement as HTMLElement;
		let uiStyle = this.style.getEffectiveStyle(this);
		let align = uiStyle.textAlign;
		let valign = uiStyle.verticalAlign;
		if (VALIGN_TRANSFORM) {
			let div = dom.firstChild as HTMLDivElement;
			let divStyle = div.style;
			divStyle.textAlign = align;
			if (valign == "top") {
				divStyle.top = `${border.top}px`;
			} else if (valign == "bottom") {
				divStyle.bottom = `${border.bottom}px`;
			} else {
				divStyle.top = "50%";
				divStyle.transform = "translate(0,-50%)";
			}
			if (this._textColor != null) {
				divStyle.color = Colors.toCssColor(this._textColor);
			} else {
				divStyle.removeProperty("color");
			}
			div.innerText = this.asString(this.textContent);
		} else {
			let tb = dom.firstChild as HTMLTableElement;
			let td = tb.firstChild as HTMLTableCellElement;
			let tdStyle = td.style;			
			tdStyle.textAlign = align;
			if (valign == "top") {
				tdStyle.verticalAlign = "top";
			} else if (valign == "bottom") {
				tdStyle.verticalAlign = "bottom";
			} else {
				tdStyle.verticalAlign = "middle";
			}
			if (this._textColor != null) {
				tdStyle.color = Colors.toCssColor(this._textColor);
			} else {
				tdStyle.removeProperty("color");
			}
			td.innerText = this.asString(this.textContent);
		}
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