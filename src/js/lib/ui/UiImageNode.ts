import { Logs } from "../lang";
import { UiNode } from "./UiNode";

export class UiImageNode extends UiNode {

	private _imageContent:any;

	public clone():UiImageNode {
		return new UiImageNode(this);
	}

	public get imageContent():any {
		return this._imageContent;
	}

	public set imageContent(value:any) {
		if (this._imageContent != value) {
			this._imageContent = value;
			this.onContentChanged();
		}
	}

	protected createDomElement(target:UiNode, tag:string):HTMLElement {
		Logs.debug("createDomElement");
		let dom = super.createDomElement(target, tag);
		let img = document.createElement("img");
		let style = img.style;
		style.position = "absolute";
		style.display = "block";
		dom.appendChild(img);
		return dom;
	}

	protected renderContent():void {
		let dom = this.domElement as HTMLElement;
		let img = dom.firstChild as HTMLImageElement;
		let cssStyle = img.style;
		let uiStyle = this.style.getEffectiveStyle(this);
		let align = uiStyle.textAlign;
		let valign = uiStyle.verticalAlign;
		if (align == "left" || align == "justify") {
			cssStyle.left = "0px";
		} else if (align == "right" ) {
			cssStyle.right = "0px";
		} else {
			cssStyle.left = "0px";
			cssStyle.right = "0px";
			cssStyle.margin = "auto";
		}
		if (valign == "top") {
			cssStyle.top = "0px";
		} else if (valign == "bottom") {
			cssStyle.bottom = "0px";
		} else {
			cssStyle.top = "50%";
			cssStyle.transform = "translate(0,-50%)";
		}
		img.src = this._imageContent;
	}

}