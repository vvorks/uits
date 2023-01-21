import
	{ Predicate, Types, Value }
	from "~/lib/lang";
import { UiPane } from "~/lib/ui/UiPane";
import { CssLength } from "~/lib/ui/CssLength";
import { UiListNode } from "~/lib/ui/UiListNode";
import { ActionListener, UiLocation, UiNode } from "~/lib/ui/UiNode";
import { UiStyle } from "~/lib/ui/UiStyle";
import { UiTextNode } from "~/lib/ui/UiTextNode";
import { UiMenu } from "~/lib/ui/UiMenu";

type Size = string|number;

export class UiNodeBuilder<T extends UiNode> {

	private _root: T;
	private _node: UiNode;

	private _defaultLength:CssLength;

	public constructor(node:T, len:string = "1px") {
		this._root = node;
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

	public lw(left:Size, width:Size):UiNodeBuilder<T> {
		this._node.left = this.toValue(left);
		this._node.width = this.toValue(width);
		return this;
	}

	public rw(right:Size, width:Size):UiNodeBuilder<T> {
		this._node.right = this.toValue(right);
		this._node.width = this.toValue(width);
		return this;
	}

	public lr(left:Size, right:Size, width?:Size):UiNodeBuilder<T> {
		this._node.left = this.toValue(left);
		this._node.right = this.toValue(right);
		this._node.width = Types.isUndefined(width) ? null : this.toValue(width as Size);
		return this;
	}

	public th(top:Size, height:Size):UiNodeBuilder<T> {
		this._node.top = this.toValue(top);
		this._node.height = this.toValue(height);
		return this;
	}

	public bh(bottom:Size, height:Size):UiNodeBuilder<T> {
		this._node.bottom = this.toValue(bottom);
		this._node.height = this.toValue(height);
		return this;
	}

	public tb(top:Size, bottom:Size, height?:Size):UiNodeBuilder<T> {
		this._node.top = this.toValue(top);
		this._node.bottom = this.toValue(bottom);
		this._node.height = Types.isUndefined(height) ? null : this.toValue(height as Size);
		return this;
	}

	public locate(
		left:Size, top:Size,
		right:Size, bottom: Size,
		width:Size, height:Size
	):UiNodeBuilder<T> {
		this._node.left = this.toValue(left);
		this._node.top = this.toValue(top);
		this._node.right = this.toValue(right);
		this._node.bottom = this.toValue(bottom);
		this._node.width = this.toValue(width);
		this._node.height = this.toValue(height);
		return this;
	}

	public inset(v:Size):UiNodeBuilder<T> {
		this._node.inset = this.toValue(v);
		return this;
	}

	public style(value:UiStyle):UiNodeBuilder<T> {
		this._node.style = value;
		return this;
	}

	public visible(value:boolean):UiNodeBuilder<T> {
		this._node.visible = value;
		return this;
	}

	public enable(value:boolean):UiNodeBuilder<T> {
		this._node.enable = value;
		return this;
	}

	public focusable(value:boolean):UiNodeBuilder<T> {
		this._node.focusable = value;
		return this;
	}

	public editable(value:boolean):UiNodeBuilder<T> {
		this._node.editable = value;
		return this;
	}

	public textContent(value:Value):UiNodeBuilder<T> {
		if (this._node instanceof UiTextNode) {
			(this._node as UiTextNode).textContent = value;
		}
		return this;
	}

	public dataSource(name:string):UiNodeBuilder<T> {
		this._node.dataSourceName = name;
		return this;
	}

	public contentNode(path:string):UiNodeBuilder<T> {
		if (this._node instanceof UiMenu) {
			(this._node as UiMenu).contentNodePath = path;
		}
		return this;
	}

	public vscroll(name:string):UiNodeBuilder<T> {
		this._node.vScrollName = name;
		return this;
	}

	public hscroll(name:string):UiNodeBuilder<T> {
		this._node.hScrollName = name;
		return this;
	}

	public loop(value:boolean):UiNodeBuilder<T> {
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).loop = value;
		}
		return this;
	}

	public vertical(value:boolean):UiNodeBuilder<T> {
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).vertical = value;
		}
		return this;
	}

	public location(value:UiLocation):UiNodeBuilder<T> {
		if (this._node instanceof UiPane) {
			(this._node as UiPane).location = value;
		} else if (this._node instanceof UiMenu) {
			(this._node as UiMenu).location = value;
		}
		return this;
	}

	public extentionSizes(value:string[]):UiNodeBuilder<T> {
		if (this._node instanceof UiMenu) {
			(this._node as UiMenu).extentionSizes = value;
		}
		return this;
	}

	public flexSize(size1:Size, size2:Size):UiNodeBuilder<T> {
		if (this._node instanceof UiPane) {
			(this._node as UiPane).setFlexSize(
				this.toValue(size1),
				this.toValue(size2));
		}
		return this;
	}

	public nextFocusFilter(func:Predicate<UiNode>):UiNodeBuilder<T> {
		this._node.nextFocusFilter = func;
		return this;
	}

	public scrollLock(on:boolean):UiNodeBuilder<T> {
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).scrollLock = on;
		}
		return this;
	}

	public listen(listener:ActionListener):UiNodeBuilder<T> {
		this._node.addActionListener(listener);
		return this;
	}

	public enter(child:UiNode):UiNodeBuilder<T> {
		this._node.appendChild(child);
		this._node = child;
		return this;
	}

	public leave():UiNodeBuilder<T> {
		this._node = this._node.parent as UiNode;
		return this;
	}

	public build():T {
		return this._root;
	}

}