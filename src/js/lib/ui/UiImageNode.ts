import { Logs } from "../lang";
import { UiNode } from "./UiNode";

export class UiImageNode extends UiNode {

	private _innerImage: HTMLImageElement|null = null;

	private _imageResource:any;

	public clone():UiImageNode {
		return new UiImageNode(this);
	}

	public get image():any {
		return this._imageResource;
	}

	public set image(res:any) {
		this._imageResource = res;
		Logs.debug("res %s %s", res, typeof res);
		if (this._innerImage != null && this._imageResource != null) {
			this._innerImage.src = this._imageResource;
		}
	}

	protected createDomElement(target:UiNode, tag:string):HTMLElement {
		let outer = super.createDomElement(target, tag);
		this._innerImage = document.createElement("img");
		let style = this._innerImage.style;
		style.position = "absolute";
		style.display = "block";
		style.margin = "auto";
		style.left = "50%";
		style.top = "50%";
		style.transform = "translate(-50%, -50%)";
		if (this._imageResource != null) {
			this._innerImage.src = this._imageResource;
		}
		outer.appendChild(this._innerImage);
		return outer;
	}

}