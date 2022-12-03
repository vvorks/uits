import { Types } from "../lang";
import { CssLength } from "./CssLength";
import { UiNode } from "./UiNode";
import { UiStyle } from "./UiStyle";

type Size = string|number;

export class UiNodeBuilder {

	private _node: UiNode;

	private _defaultLength:CssLength;

	public constructor(node:UiNode, len:string = "1px") {
		this._node = node;
		this._defaultLength = new CssLength(len);
	}

	private toValue(s:Size):string {
		if (typeof s == "string") {
			return s as string;
		} else if (typeof s == "number") {
			let v = (s as number) * this._defaultLength.value;
			return `${v}${this._defaultLength.unit}`;
		} else {
			return "0px";
		}
	}

	public lw(left:Size, width:Size):UiNodeBuilder {
		this._node.left = this.toValue(left);
		this._node.width = this.toValue(width);
		return this;
	}

	public rw(right:Size, width:Size):UiNodeBuilder {
		this._node.right = this.toValue(right);
		this._node.width = this.toValue(width);
		return this;
	}

	public lr(left:Size, right:Size, width?:Size):UiNodeBuilder {
		this._node.left = this.toValue(left);
		this._node.right = this.toValue(right);
		this._node.width = Types.isUndefined(width) ? null : this.toValue(width as Size);
		return this;
	}

	public th(top:Size, height:Size):UiNodeBuilder {
		this._node.top = this.toValue(top);
		this._node.height = this.toValue(height);
		return this;
	}

	public bh(bottom:Size, height:Size):UiNodeBuilder {
		this._node.bottom = this.toValue(bottom);
		this._node.height = this.toValue(height);
		return this;
	}

	public tb(top:Size, bottom:Size, height?:Size):UiNodeBuilder {
		this._node.top = this.toValue(top);
		this._node.bottom = this.toValue(bottom);
		this._node.height = Types.isUndefined(height) ? null : this.toValue(height as Size);
		return this;
	}

	public locate(
		left:Size, top:Size,
		right:Size, bottom: Size,
		width:Size, height:Size
	):UiNodeBuilder {
		this._node.left = this.toValue(left);
		this._node.top = this.toValue(top);
		this._node.right = this.toValue(right);
		this._node.bottom = this.toValue(bottom);
		this._node.width = this.toValue(width);
		this._node.height = this.toValue(height);
		return this;
	}

	public inset(v:Size):UiNodeBuilder {
		this._node.inset = this.toValue(v);
		return this;
	}

	public style(value:UiStyle):UiNodeBuilder {
		this._node.style = value;
		return this;
	}

	public visible(value:boolean):UiNodeBuilder {
		this._node.visible = value;
		return this;
	}

	public enable(value:boolean):UiNodeBuilder {
		this._node.enable = value;
		return this;
	}

	public focusable(value:boolean):UiNodeBuilder {
		this._node.focusable = value;
		return this;
	}

	public editable(value:boolean):UiNodeBuilder {
		this._node.editable = value;
		return this;
	}

	public content(text:string):UiNodeBuilder {
		this._node.content = text;
		return this;
	}

	public enter(child:UiNode):UiNodeBuilder {
		this._node.appendChild(child);
		this._node = child;
		return this;
	}

	public leave():UiNodeBuilder {
		this._node = this._node.parent as UiNode;
		return this;
	}

}