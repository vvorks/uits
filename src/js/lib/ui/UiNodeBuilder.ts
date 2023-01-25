import
	{ Predicate, Properties, StateError, Types, Value }
	from "~/lib/lang";
import { UiPane } from "~/lib/ui/UiPane";
import { CssLength } from "~/lib/ui/CssLength";
import { UiListNode } from "~/lib/ui/UiListNode";
import { ActionListener, Size, UiLocation, UiNode } from "~/lib/ui/UiNode";
import { UiStyle } from "~/lib/ui/UiStyle";
import { UiTextNode } from "~/lib/ui/UiTextNode";
import { UiMenu } from "~/lib/ui/UiMenu";
import { UiImageNode } from "./UiImageNode";
import { UiImageLookupField } from "./UiImageLookupField";

export class UiNodeBuilder {

	private _parent: UiNode|null;
	private _node: UiNode|null;

	private _defaultLength:CssLength;

	public constructor(len:string = "1px") {
		this._parent = null;
		this._node   = null;
		this._defaultLength = new CssLength(len);
	}

	private toValue(s:Size|null):string|null {
		if (s == null) {
			return null;
		} else if (typeof s == "string") {
			return s as string;
		} else if (typeof s == "number") {
			let v = (s as number) * this._defaultLength.value;
			return `${v}${this._defaultLength.unit}`;
		} else {
			return "0px";
		}
	}

	public position(
		left:Size|null, top:Size|null,
		right:Size|null, bottom: Size|null,
		width:Size|null, height:Size|null
	):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.left = this.toValue(left);
		this._node.top = this.toValue(top);
		this._node.right = this.toValue(right);
		this._node.bottom = this.toValue(bottom);
		this._node.width = this.toValue(width);
		this._node.height = this.toValue(height);
		return this;
	}

	public bounds(
		left:Size, top:Size,
		width:Size, height:Size
	) {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.left = this.toValue(left);
		this._node.top = this.toValue(top);
		this._node.right = null;
		this._node.bottom = null;
		this._node.width = this.toValue(width);
		this._node.height = this.toValue(height);
		return this;
	}

	public inset(left:Size, top?:Size, right?:Size, bottom?:Size):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (top !== undefined && right !== undefined && bottom !== undefined) {
			this._node.left = this.toValue(left);
			this._node.top = this.toValue(top);
			this._node.right = this.toValue(right);
			this._node.bottom = this.toValue(bottom);
		} else if (top !== undefined) {
			this._node.left = this.toValue(left);
			this._node.top = this.toValue(top);
			this._node.right = this.toValue(left);
			this._node.bottom = this.toValue(top);
		} else {
			this._node.left = this.toValue(left);
			this._node.top = this.toValue(left);
			this._node.right = this.toValue(left);
			this._node.bottom = this.toValue(left);
		}
		return this;
	}

	public style(value:UiStyle):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.style = value;
		return this;
	}

	public visible(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.visible = value;
		return this;
	}

	public enable(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.enable = value;
		return this;
	}

	public focusable(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.focusable = value;
		return this;
	}

	public editable(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.editable = value;
		return this;
	}

	public textContent(value:Value):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiTextNode) {
			(this._node as UiTextNode).textContent = value;
		}
		return this;
	}

	public imageContent(value:Value):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiImageNode) {
			(this._node as UiImageNode).imageContent = value;
		}
		return this;
	}

	public imageSize(width:Size|null, height:Size|null):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiImageNode) {
			let e = this._node as UiImageNode;
			e.imageWidth = width;
			e.imageHeight = height;
		}
		return this;
	}

	public lookupTable(table: Properties<any>):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiImageLookupField) {
			(this._node as UiImageLookupField).lookupTable = table;
		}
		return this;
	}

	public dataSource(name:string):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.dataSourceName = name;
		return this;
	}

	public dataField(name:string):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.dataFieldName = name;
		return this;
	}

	public contentNode(path:string):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiMenu) {
			(this._node as UiMenu).contentNodePath = path;
		}
		return this;
	}

	public vscroll(name:string):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.vScrollName = name;
		return this;
	}

	public hscroll(name:string):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.hScrollName = name;
		return this;
	}

	public loop(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).loop = value;
		}
		return this;
	}

	public vertical(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).vertical = value;
		}
		return this;
	}

	public outerMargin(value:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).outerMargin = value;
		}
		return this;
	}

	public location(value:UiLocation):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiPane) {
			(this._node as UiPane).location = value;
		} else if (this._node instanceof UiMenu) {
			(this._node as UiMenu).location = value;
		}
		return this;
	}

	public extentionSizes(value:string[]):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiMenu) {
			(this._node as UiMenu).extentionSizes = value;
		}
		return this;
	}

	public flexSize(size1:Size, size2:Size):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiPane) {
			(this._node as UiPane).setFlexSize(
				this.toValue(size1) as string,
				this.toValue(size2) as string);
		}
		return this;
	}

	public nextFocusFilter(func:Predicate<UiNode>):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.nextFocusFilter = func;
		return this;
	}

	public scrollLock(on:boolean):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		if (this._node instanceof UiListNode) {
			(this._node as UiListNode).scrollLock = on;
		}
		return this;
	}

	public listen(listener:ActionListener):UiNodeBuilder {
		if (this._node == null) {
			throw new StateError();
		}
		this._node.addActionListener(listener);
		return this;
	}

	public element(e:UiNode):UiNodeBuilder {
		if (this._parent != null) {
			this._parent.appendChild(e);
		}
		this._node = e;
		return this;
	}

	public belongs(func:(b:UiNodeBuilder)=>void) {
		if (this._node == null) {
			throw new StateError();
		}
		this._parent = this._node;
		this._node = null;
		func(this);
		this._node = this._parent;
		this._parent = this._node.parent as UiNode;
	}

}