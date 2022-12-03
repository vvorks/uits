import {Rect} from "./Rect";
import {CssLength} from "./CssLength"
import { UiStyle } from "./UiStyle"
import { Asserts, Logs } from "../lang";
import type { UiApplication } from "./UiApplication";

 /**
 * UiNodeのフラグ定義
 */
 export enum Flags {

	/** フォーカス可能フラグ */
	FOCUSABLE		= 0x00000001,

	/** 有効フラグ */
	ENABLE			= 0x00000002,

	/** 表示フラグ */
	VISIBLE			= 0x00000004,

	/** 編集可能フラグ */
	EDITABLE		= 0x00000008,

	/** クリック中フラグ */
	CLICKING		= 0x00000010,

	/** 削除済みフラグ */
	DELETED			= 0x00000020,

	/** マウント済みフラグ */
	MOUNTED			= 0x00000040,

	/** DOM接続済みフラグ */
	BINDED			= 0x00000080,

	/** 予約領域(下位１６ビットの未使用分) */
	RESERVED		= 0x0000FF00,

	/** ノード固有のフラグ領域(上位１６ビット) */
	CUSTOM			= 0xFFFF0000,

	/** 初期フラグ値 */
	INITIAL			= ENABLE|VISIBLE,

}

export enum Changed {

	/** 内容更新フラグ */
	CONTENT		= 0x00000001,

	/** 位置更新フラグ */
	LOCATION	= 0x00000002,

	/** 表示属性更新フラグ */
	DISPLAY		= 0x00000004,

	/** スクロール属性更新フラグ */
	SCROLL		= 0x00000008,

	/** リソース更新フラグ */
	RESOURCE	= CONTENT|LOCATION|DISPLAY|SCROLL,

	/** 階層更新フラグ */
	HIERARCHY	= 0x00000010,

	/** スタイル更新フラグ */
	STYLE		= 0x00000020,

	/** 全更新フラグ */
	ALL			= CONTENT|LOCATION|DISPLAY|SCROLL|HIERARCHY|STYLE

}

export enum UiResult {
	IGNORED = 0,
	CONSUMED = 1,
	AFFECTED = 2,
	EATEN = 3
}

/**
 * UiNode
 */
export class UiNode {

	protected _application:UiApplication;

	protected _id:number;

	protected _name:string;

	protected _content:string;

	protected _left:CssLength|null;

	protected _top:CssLength|null;

	protected _right:CssLength|null;

	protected _bottom:CssLength|null;

	protected _width:CssLength|null;

	protected _height:CssLength|null;

	protected _scrollLeft:CssLength|null;

	protected _scrollTop:CssLength|null;

	protected _scrollWidth:CssLength|null;

	protected _scrollHeight:CssLength|null;

	protected _rect:Rect|null;

	protected _parent:UiNode|null;

	protected _children:UiNode[];

	protected _style:UiStyle;

	protected _stylePrefix:string;

	protected _styleClassName: string;

	protected _flags: Flags;

	protected _changed: Changed;

	protected _domElement: HTMLElement|null;

	protected _endElement: HTMLElement|null;

	private static _counter:number = 0;

	public constructor(app:UiApplication, name?:string) {
		UiNode._counter++;
		this._application = app;
		this._id = UiNode._counter;
		this._name = (name != null ? name : this.className + this._id);
		this._content = "";
		this._left = null;
		this._top = null;
		this._right = null;
		this._bottom = null;
		this._width = null;
		this._height = null;
		this._scrollLeft = null;
		this._scrollTop = null;
		this._scrollWidth = null;
		this._scrollHeight = null;
		this._rect = null;
		this._parent = null;
		this._children = [];
		this._style = UiStyle.EMPTY;
		this._stylePrefix = "";
		this._styleClassName = "";
		this._flags = Flags.INITIAL;
		this._changed = Changed.ALL;
		this._domElement = null;
		this._endElement = null;
	}

	/**
	 * バインド中のDomElement（デバッグ用）
	 */
	public get domElement(): HTMLElement|null {
		return this._domElement;
	}

	public get id():number {
		return this._id;
	}

	public get className():string {
		return "UiNode";
	}

	public get application():UiApplication {
		return this._application;
	}

	public get name():string {
		return this._name;
	}

	public get content():string {
		return this._content;
	}

	public set content(value:string) {
		if (this._content != value) {
			this._content = value;
			this.onContentChanged();
		}
	}

	protected onContentChanged():void {
		this.setChanged(Changed.CONTENT, true);
	}

	public get left():string|null {
		return (this._left == null ? null : this._left.toString());
	}

	public set left(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._left != value) {
			this._left = value;
			this.onLocationChanged();
		}
	}

	public get top():string|null {
		return (this._top == null ? null : this._top.toString());
	}

	public set top(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._top != value) {
			this._top = value;
			this.onLocationChanged();
		}
	}

	public get right():string|null {
		return (this._right == null ? null : this._right.toString());
	}

	public set right(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._right != value) {
			this._right = value;
			this.onLocationChanged();
		}
	}

	public get bottom():string|null {
		return (this._bottom == null ? null : this._bottom.toString());
	}
	
	public set bottom(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._bottom != value) {
			this._bottom = value;
			this.onLocationChanged();
		}
	}

	public get width():string|null {
		return (this._width == null ? null : this._width.toString());
	}

	public set width(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._width != value) {
			this._width = value;
			this.onLocationChanged();
		}
	}

	public get height():string|null {
		return (this._height == null ? null : this._height.toString());
	}

	public set height(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._height != value) {
			this._height = value;
			this.onLocationChanged();
		}
	}

	public set inset(str:string) {
		this.left = str;
		this.top = str;
		this.right = str;
		this.bottom = str;
		this.width = null;
		this.height = null;
	}

	protected onLocationChanged():void {
		this._rect = null;
		this.setChanged(Changed.LOCATION, true);
	}

	public get scrollLeft():string|null {
		return (this._scrollLeft == null ? null : this._scrollLeft.toString());
	}

	public set scrollLeft(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._scrollLeft != value) {
			this._scrollLeft = value;
			this.onScrollChanged();	
		}
	}

	public get scrollTop():string|null {
		return (this._scrollTop == null ? null : this._scrollTop.toString());
	}

	public set scrollTop(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._scrollTop != value) {
			this._scrollTop = value;
			this.onScrollChanged();	
		}
	}

	public get scrollWidth():string|null {
		return (this._scrollWidth == null ? null : this._scrollWidth.toString());
	}

	public set scrollWidth(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._scrollWidth != value) {
			this._scrollWidth = value;
			this.onScrollChanged();	
		}
	}

	public get scrollHeight():string|null {
		return (this._scrollHeight == null ? null : this._scrollHeight.toString());
	}

	public set scrollHeight(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		if (this._scrollHeight != value) {
			this._scrollHeight = value;
			this.onScrollChanged();	
		}
	}

	protected onScrollChanged():void {
		this.setChanged(Changed.SCROLL, true);
	}

	public get parent():UiNode|null {
		return this._parent;
	}

	private set parent(p:UiNode|null) {
		if (this._parent != p) {
			this._parent = p;
			this.onLocationChanged();
			let dom = this._domElement;
			if (dom != null && dom.parentElement != null) {
				dom.parentElement.removeChild(dom);
				this.onHierarchyChanged();
			}
			if (this.isChanged(Changed.STYLE) && p != null) {
				p.onStyleChanged();
			}
		}
	}

	public appendChild(child:UiNode):void {
		if (child.parent != null) {
			child.parent.removeChild(child);
		}
		this._children.push(child);
		child.parent = this;
		this.onScrollChanged();
	}

	public removeChild(child:UiNode):void {
		let index = this._children.indexOf(child);
		if (index < 0) {
			return;
		}
		this._children.splice(index, 1);
		child.parent = null;
		this.onScrollChanged();
	}

	public getPageNode():UiNode|null {
		return (this.parent as UiNode).getPageNode()
	}

	protected onHierarchyChanged():void {
		this.setChanged(Changed.HIERARCHY, true);
	}

	public get style():UiStyle {
		return this._style;
	}

	public set style(value:UiStyle) {
		if (this._style != value) {
			this._style = value;
			this.onStyleChanged();
		}
	}

	protected onStyleChanged():void {
		let page:UiNode|null = this.getPageNode();
		if (page != null) {
			this.setChanged(Changed.STYLE, true);
		}
	}

	public getRect():Rect {
		if (this._rect == null) {
			this._rect = this.calcRect();
		}
		return this._rect;
	}

	protected calcRect():Rect {
		let x:number = 0;
		let y:number = 0;
		let w:number = 0;
		let h:number = 0;
		let r:number = 0;
		let b:number = 0;
		let parentWidth:number = (this.parent as UiNode).innerWidth;
		let parentHeight:number = (this.parent as UiNode).innerHeight;
		//水平位置の計算
		if (this._left != null && this._right == null && this._width != null) {
			//左寄せ
			x = this._left.toPixel(() => parentWidth);
			w = this._width.toPixel(() => parentWidth);
		} else if (this._left == null && this._right != null && this._width != null) {
			//右寄せ
			r = this._right.toPixel(() => parentWidth);
			w = this._width.toPixel(() => parentWidth);
			x = parentWidth - r - w;
		} else if (this._left != null && this._right != null) {
			if (this._width == null) {
				//左右寄せ
				x = this._left.toPixel(() => parentWidth);
				r = this._right.toPixel(() => parentWidth);
				w = parentWidth - r - x;
			} else {
				//左右＆中央寄せ
				x = this._left.toPixel(() => parentWidth);
				r = this._right.toPixel(() => parentWidth);
				w = this._width.toPixel(() => parentWidth);
				x += (parentWidth - x - r - w) / 2;
			}
		} else {
			// サイズ無し
			x = 0;
			w = 0;
		}
		//垂直位置の計算
		if (this._top != null && this._bottom == null && this._height != null) {
			//上寄せ
			y = this._top.toPixel(() => parentHeight);
			h = this._height.toPixel(() => parentHeight);
		} else if (this._top == null && this._bottom != null && this._height != null) {
			//下寄せ
			b = this._bottom.toPixel(() => parentHeight);
			h = this._height.toPixel(() => parentHeight);
			y = parentHeight - b - h;
		} else if (this._top != null && this._bottom != null) {
			if (this._height == null) {
				//上下寄せ
				y = this._top.toPixel(() => parentHeight);
				b = this._bottom.toPixel(() => parentHeight);
				h = parentHeight - b - y;
			} else {
				//上下＆中央寄せ
				y = this._top.toPixel(() => parentHeight);
				b = this._bottom.toPixel(() => parentHeight);
				h = this._height.toPixel(() => parentHeight);
				y += (parentHeight - b - y - h) / 2;
			}
		} else {
			// サイズ無し
			y = 0;
			h = 0;
		}
		return new Rect().locate(x, y, w, h);
	}

	protected get innerWidth(): number {
		let r = this.getRect();
		let s = this.style.getEffectiveStyle(this);
		let left = s.borderLeftAsLength.toPixel(() => r.width);
		let right = s.borderRightAsLength.toPixel(() => r.width);
		return r.width - left - right;
	}

	protected get innerHeight(): number {
		let r = this.getRect();
		let s = this.style.getEffectiveStyle(this);
		let top = s.borderTopAsLength.toPixel(() => r.height);
		let bottom = s.borderBottomAsLength.toPixel(() => r.height);
		return r.height - top - bottom;
	}

	public getRectOnRoot():Rect {
		return this.getRectOn(null);
	}

	public getRectOn(a:UiNode|null):Rect {
		let result = new Rect(this.getRect());
		return this.translateOn(result, a);
	}

	public translateOn(result:Rect, a:UiNode|null):Rect {
		let p = this.parent;
		while (p != null && p != a) {
			p.translate(result, +1);
			p = p.parent;
		}
		return result;
	}

	/**
	 * 非矩形形状のノードの場合、指定位置が自ノードに含まれているかを判定する
	 * 
	 * @param x X位置（自ノード座標系[但し、ボーダー含む]）
	 * @param y Y位置（自ノード座標系[但し、ボーダー含む]）
	 * @returns 指定位置が自ノードに含まれている場合、真
	 */
	protected hitTest(x:number, y:number):boolean {
		return true;
	}

	/**
	 * 座標基準位置の変換
	 * 
	 * @param result 座標
	 * @param sig 変換方向（-1:末端方向、+1:ルート方向）
	 * @returns 座標（変換後）
	 */
	public translate(result:Rect, sig:number):Rect {
		let r = this.getRect();
		let s = this.style.getEffectiveStyle(this);
		let leftBorder = s.borderLeftAsLength.toPixel(() => r.width );
		let topBorder  = s.borderTopAsLength .toPixel(() => r.height);
		let v = this.getViewRect();
		result.move(+sig * r.left    , +sig * r.top    );
		result.move(+sig * leftBorder, +sig * topBorder);
		result.move(-sig * v.left    , -sig * v.top    );
		return result;
	}

	public getViewRect():Rect {
		let rect = new Rect();
		rect.width = this.innerWidth;
		rect.height = this.innerHeight;
		rect.x = (this._scrollLeft != null ? this._scrollLeft.toPixel(() => rect.width ) : 0);
		rect.y = (this._scrollTop != null  ? this._scrollTop.toPixel (() => rect.height) : 0); 
		return rect;
	}

	public get visible():boolean {
		return this.getFlag(Flags.VISIBLE);
	}

	public set visible(on:boolean) {
		if (this.setFlag(Flags.VISIBLE, on)) {
			this.setChanged(Changed.DISPLAY, true);
		}
	}

	public get enable():boolean {
		return this.getFlag(Flags.ENABLE);
	}

	public set enable(on:boolean) {
		if (this.setFlag(Flags.ENABLE, on)) {
			this.setChanged(Changed.DISPLAY, true);
		}
	}

	public get clicking():boolean {
		return this.getFlag(Flags.CLICKING);
	}

	public set clicking(on:boolean) {
		if (this.setFlag(Flags.CLICKING, on)) {
			this.setChanged(Changed.DISPLAY, true);
		}
	}

	public get deleted():boolean {
		return this.getFlag(Flags.DELETED);
	}

	public set deleted(on:boolean) {
		if (this.setFlag(Flags.DELETED, on)) {
			this.setChanged(Changed.DISPLAY, true);
		}
	}

	public get focusable():boolean {
		return this.getFlag(Flags.FOCUSABLE);
	}

	public set focusable(on:boolean) {
		this.setFlag(Flags.FOCUSABLE, on);
	}

	public get editable():boolean {
		return this.getFlag(Flags.EDITABLE);
	}

	public set editable(on:boolean) {
		this.setFlag(Flags.EDITABLE, on);
	}

	public hasFocus():boolean {
		let focusNode = this.application.getFocus();
		if (focusNode == null) {
			return false;
		}
		return this == focusNode || this.isAncestorOf(focusNode);
	}

	protected getFlag(bit:Flags):boolean {
		return !!(this._flags & bit);
	}

	protected setFlag(bit:Flags, on:boolean):boolean {
		let changed:boolean = (this.getFlag(bit) != on);
		if (changed) {
			if (on) {
				this._flags |= bit;
			} else {
				this._flags &= ~bit;
			}
		}
		return changed;

	}

	protected isChanged(bit:Changed):boolean {
		return !!(this._changed & bit);
	}

	protected setChanged(bit:Changed, on:boolean):void {
		if (on) {
			this._changed |= bit;
		} else {
			this._changed &= ~bit;
		}
	}

	public onMount():void {
		this.setFlag(Flags.MOUNTED, true);
		for (let c of this._children) {
			c.onMount();
		}
	}

	public onUnmount():void {
		for (let c of this._children) {
			c.onUnmount();
		}
		this.setFlag(Flags.MOUNTED, false);
	}

	public isAncestorOf(other:UiNode):boolean {
		return other.getAncestorsIf((e) => e == this, [], 1).length == 1;
	}

	public getAncestorsIf(filter:(e:UiNode)=>boolean, list:UiNode[], limit:number = Number.MAX_SAFE_INTEGER):UiNode[] {
		let p:UiNode|null = this.parent;
		while (p != null) {
			if (filter(p)) {
				list.push(p);
				if (list.length >= limit) {
					return list;
				}
			}
			p = p.parent;
		}
		return list;
	}

	public getDescendantsIf(filter:(e:UiNode)=>boolean, list:UiNode[], limit:number = Number.MAX_SAFE_INTEGER):UiNode[] {
		if (filter(this)) {
			list.push(this);
			if (list.length >= limit) {
				return list;
			}
		}
		for (let c of this._children) {
			c.getDescendantsIf(filter, list);
			if (list.length >= limit) {
				break;
			}
		}
		return list;
	}

	public getBlockerNode():UiNode|null {
		let anc:UiNode|null = this.parent;
		let r:Rect = new Rect(this.getRect());
		while (anc != null && anc.getViewRect().contains(r)) {
			anc.translate(r, -1);
			anc = anc.parent;
		}
		return anc;
	}

	/**
	 * 最終共通祖先(Last Universal Common Ancestor)を取得する。
	 * 
	 * @param other 比較対象ノード
	 * @returns 最終共通祖先ノード。但し、両者が上下関係の場合、上位側ノードを返す。
	 */
	public getLucaNodeWith(other:UiNode):UiNode {
		let tList = this.getAncestorsIf(e => true, []).reverse();
		let oList = other.getAncestorsIf(e => true, []).reverse();
		tList.push(this);
		oList.push(other);
		let n = Math.min(tList.length, oList.length);
		Asserts.assume(tList[0] == oList[0]);
		for (let i = 1; i < n; i++) {
			if (tList[i] != oList[i]) {
				return tList[i - 1];
			}
		}
		let luca = tList.length < oList.length ? tList[n - 1] : oList[n - 1];
		console.log("getLucaNodeWith " + this._id + " and " + other._id + " is " + luca._id);
		return luca;
	}

	public getVisibleChildAt(x:number, y:number):UiNode|null {
		for (let i = this._children.length - 1; i >= 0; i--) {
			let child = this._children[i];
			if (child.visible && !child.deleted) {
				let cRect = child.getRect();
				if (cRect.containsPoint(x, y) && child.hitTest(x - cRect.x, y - cRect.y)) {
					return child;
				}
			}
		}
		return null;
	}

	public getDegree(ancestor:UiNode|null):number {
		let node:UiNode|null = this;
		let number = 0;
		while (node != null && node != ancestor) {
			number++;
			node = node.parent;
		}
		return node != null ? number : -1;
	}

	public onFocus(target:UiNode|null, gained:boolean, other:UiNode|null):UiResult {
		return (this == target) ? UiResult.AFFECTED : UiResult.IGNORED;
	}

	public onKeyDown(target:UiNode|null, key:number, ch:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onKeyPress(target:UiNode|null, key:number, ch:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onKeyUp(target:UiNode|null, key:number, ch:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onMouseMove(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onMouseDown(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onMouseUp(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onMouseClick(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onMouseDoubleClick(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public onMouseWheel(target:UiNode, x:number, y:number, dx:number, dy:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	public sync():void {
		let dom = this.ensureDomElement();
		if (dom != null) {
			this.syncStyle();
			this.syncStyleClass();
			this.syncLocation();
			this.syncContent();
		}
		for (let c of this._children) {
			c.sync();
		}
		if (dom != null) {
			this.syncHierarchy();
			this.syncScroll();
		}
	}

	protected ensureDomElement():HTMLElement|null {
		if (!this.getFlag(Flags.BINDED)) {
			this._domElement = this.createDomElement("div");
			this._domElement.id = "" + this._id;
			this.setFlag(Flags.BINDED, true);
		}
		return this._domElement;
	}

	protected createDomElement(tag:string):HTMLElement {
		return (this.parent as UiNode).createDomElement(tag);
	}

	protected syncStyle():void {
		this.setChanged(Changed.STYLE, false);
	}

	protected setStyleNode(nodeId:string, content:string):void {
		let node = document.getElementById(nodeId);
		if (node == null) {
			node = document.createElement("style");
			node.setAttribute("id", nodeId);
			document.head.appendChild(node);
		}
		node.textContent = content;
	}

	protected collectStyle(prefix:string, styles:Set<UiStyle>):Set<UiStyle> {
		this._style.collect(styles);
		this._stylePrefix = prefix;
		for (let c of this._children) {
			c.collectStyle(prefix, styles);
		}
		return styles;
	}

	protected syncStyleClass():void {
		let s:UiStyle = this._style.getEffectiveStyle(this);
		let styleClassName = this._stylePrefix + s.id;
		if (this._styleClassName == styleClassName) {
			return;
		}
		let dom = this._domElement as HTMLElement;
		dom.setAttribute("class", styleClassName);
		this._styleClassName = styleClassName;
	}

	protected syncLocation():void {
		if (!this.isChanged(Changed.LOCATION)) {
			return;
		}
		let dom = this._domElement as HTMLElement;
		let style = dom.style;
		style.position = "absolute";
		style.margin = "auto";
		style.overflow = "hidden";
		style.left = this.left as string;
		style.top = this.top as string;
		style.right = this.right as string;
		style.bottom = this.bottom as string;
		style.width = this.width as string;
		style.height = this.height as string;
		this.setChanged(Changed.LOCATION, false);
	}

	protected syncScroll():void {
		if (!this.isChanged(Changed.SCROLL)) {
			return;
		}
		//処理準備
		let viewWidth = this.innerWidth;
		let viewHeight = this.innerHeight;
		let surround:Rect;
		if (this._scrollWidth == null || this._scrollHeight == null) {
			surround = this.getSurroundRect();
		} else {
			surround = new Rect();
		}
		//水平方向のスクロール位置計算
		let scrollLeft = (this._scrollLeft != null ? this._scrollLeft.toPixel(() => viewWidth) : 0); 
		let scrollWidth:number;
		if (this._scrollWidth != null) {
			scrollWidth = this._scrollWidth.toPixel(() => viewWidth);
		} else {
			scrollWidth = surround.right > viewWidth ? surround.left + surround.right : viewWidth;
		}
		scrollWidth = Math.max(scrollWidth, viewWidth);
		scrollLeft = Math.min(Math.max(0, scrollLeft), scrollWidth - viewWidth);
		//垂直方向のスクロール位置計算
		let scrollTop = (this._scrollTop != null ? this._scrollTop.toPixel(() => viewWidth) : 0); 
		let scrollHeight = 0;
		if (this._scrollHeight != null) {
			scrollHeight = this._scrollHeight.toPixel(() => viewHeight);
		} else {
			scrollHeight = surround.bottom > viewHeight ? surround.top + surround.bottom : viewHeight;
		}
		scrollHeight = Math.max(scrollHeight, viewHeight);
		scrollTop = Math.min(Math.max(0, scrollTop), scrollHeight - viewHeight);
		//スクロール領域設定
		this.setScrollBounds(scrollLeft, scrollTop, scrollWidth, scrollHeight);
		this.setChanged(Changed.LOCATION, false);
	}

	protected getSurroundRect():Rect {
		let childrenRect = new Rect();
		for (let c of this._children) {
			childrenRect = childrenRect.union(c.getRect());
		}
		return childrenRect;
	}

	protected setScrollBounds(scrollLeft:number, scrollTop:number, scrollWidth:number, scrollHeight:number):void {
		let dom = this._domElement as HTMLElement;
		let viewWidth = this.innerWidth;
		let viewHeight = this.innerHeight;
		if (scrollWidth > viewWidth || scrollHeight > viewHeight) {
			if (this._endElement == null) {
				this._endElement = document.createElement("div"); 
				dom.appendChild(this._endElement);
			}
			let style = this._endElement.style;
			style.position = "absolute";
			style.left = `${scrollWidth - 1}px`;
			style.top = `${scrollHeight - 1}px`;
			style.width = "1px";
			style.height = "1px";
		} else {
			if (this._endElement != null) {
				dom.removeChild(this._endElement);
				this._endElement = null;
			}
		}
		dom.scrollLeft = scrollLeft;
		dom.scrollTop = scrollTop;
	}

	protected syncContent():void {
		if (!this.isChanged(Changed.CONTENT)) {
			return;
		}
		let dom = this._domElement as HTMLElement;
		dom.innerText = this._content;
		this.setChanged(Changed.CONTENT, false);
	}

	protected syncHierarchy():void {
		if (!this.isChanged(Changed.HIERARCHY)) {
			return;
		}
		let dom = this._domElement as HTMLElement;
		Asserts.assume(dom.parentElement == null);
		let parent = this.parent as UiNode;
		if (parent._domElement != null) {
			parent._domElement.appendChild(dom);
		} else {
			Asserts.ensure(false);
		}
		this.setChanged(Changed.HIERARCHY, false);
	}

	public toString():string {
		return JSON.stringify(this.toJson());
	}

	public toJson():any {
		return {
			name: this._name,
			left: this.left,
			top: this.top,
			right: this.right,
			bottom: this.bottom,
			width: this.width,
			height: this.height,
			rect: this.getRect().toJson(),
			flags: this._flags,
			changed: this._changed,
			children: this.toJsonChildren(),
		}
	}

	private toJsonChildren():Object[] {
		let result:Object[] = [];
		for (let c of this._children) {
			result.push(c.toJson());
		}
		return result;
	}

}
