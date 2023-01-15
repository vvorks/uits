import { CssLength } from "~/lib/ui/CssLength";
import { UiNode } from "~/lib/ui/UiNode";
import { TextAlign, VerticalAlign } from "~/lib/ui/UiStyle";

export class UiImageNode extends UiNode {

	private _imageContent:any;

	private _imageSize: CssLength = new CssLength("100%");

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

	public get imageSize():string {
		return this._imageSize.toString();
	}

	public set imageSize(size:string) {
		this._imageSize = new CssLength(size);
	}

	protected createDomElement(target:UiNode, tag:string):HTMLElement {
		let dom = super.createDomElement(target, tag);
		let img = document.createElement("img");
		let style = img.style;
		style.position = "absolute";
		style.display = "block";
		dom.appendChild(img);
		return dom;
	}

	protected renderContent():void {
		if (this._imageContent === undefined || this._imageContent == null) {
			return;
		}
		let dom = this.domElement as HTMLElement;
		let img = dom.firstChild as HTMLImageElement;
		let cssStyle = img.style;
		let uiStyle = this.style.getEffectiveStyle(this);
		let align:TextAlign = uiStyle.textAlign;
		let valign:VerticalAlign = uiStyle.verticalAlign;
		cssStyle.width = this._imageSize.toString();
		cssStyle.height = "auto";
		if (align == "left") {
			cssStyle.left = "0px";
		} else if (align == "right" ) {
			cssStyle.right = "0px";
		} else if (align == "center") {
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