import {CssLength} from "./CssLength"
import {Color, Colors} from "./Colors"
import {UiNode} from "./UiNode"

export type UiStyleCondition = "NAMED"|"CLICKING"|"FOCUS"|"ENABLE"|"DISABLE";
export type TextAlign = "left"|"right"|"center"|"justify";
export type VerticalAlign = "top"|"bottom"|"middle";

/**
 * UiStyle
 * 
 * TODO Immutableにする
 */
export class UiStyle {

	private static readonly EMPTY_STYLE_ID = 0;

	private static readonly CONDITION_ORDERS = {
		"DEFAULT":0,
		"NAMED": 1,
		"CLICKING": 2,
		"FOCUS": 3,
		"ENABLE": 4,
		"DISABLE": 5
	};

	private static readonly CONDITION_FUNCS:((node:UiNode, param:string|null)=>boolean)[] = [
		(node:UiNode, param:string|null) => true,					//DEFAULT
		(node:UiNode, param:string|null) => node.name == param,		//NAMED
		(node:UiNode, param:string|null) => node.clicking,			//CLICKING
		(node:UiNode, param:string|null) => node.hasFocus(),		//FOCUS
		(node:UiNode, param:string|null) => node.enable,			//ENABLE
		(node:UiNode, param:string|null) => !node.enable,			//DISABLE
	];

	/** デフォルトフォントサイズ */
	private static readonly DEFAULT_FONT_SIZE = new CssLength("10.5pt");

	/** デフォルトフォントファミリー名 */
	private static readonly DEFAULT_FONT_FAMILY = "sans-serif";

	/** ID */
	private _id:number;

	/** 基底スタイル */
	private _basedOn: UiStyle|null;

	/** 派生スタイル */
	private _inherits: UiStyle[];

	private _childrenOrdered: boolean;

	private _conditionName: UiStyleCondition|null;

	private _conditionParam: string|null;

	/** 前景色 */
	private _textColor: Color|null;

	/** 背景色 */
	private _backgroundColor: Color|null;

	/** 背景画像URL */
	private _backgroundImage: string|null;

	/** ボーダーサイズ(Length)（左） */
	private _borderLeft: CssLength|null;

	/** ボーダーサイズ(Length)（上） */
	private _borderTop: CssLength|null;

	/** ボーダーサイズ(Length)（右） */
	private _borderRight: CssLength|null;

	/** ボーダーサイズ(Length)（下） */
	private _borderBottom: CssLength|null;

	/** ボーダー色 */
	private _borderColor: Color|null;

	/** ボーダー画像URL */
	private _borderImage: string|null;

	/** フォントサイズ(Length) */
	private _fontSize: CssLength|null;

	/** フォントの種類 */
	private _fontFamily: string|null;

	/** 行の高さ(Length) */
	private _lineHeight: CssLength|null;

	/** 行の揃え位置 */
	private _textAlign: TextAlign|null;

	/** 縦方向の揃え位置 */
	private _verticalAlign: VerticalAlign|null;

	private static _counter:number = 0;

	/** 空スタイル */
	public static EMPTY:UiStyle = new UiStyle(UiStyle.EMPTY_STYLE_ID);

	public constructor(specialId?:number) {
		if (specialId != undefined) {
			this._id = specialId;
		} else {
			UiStyle._counter++;
			this._id = UiStyle._counter;
		}
		this._basedOn = null;
		this._inherits = [];
		this._childrenOrdered = false;
		this._conditionName = null;
		this._conditionParam = null;
		this._textColor = null;
		this._backgroundColor = null;
		this._backgroundImage = null;
		this._borderLeft = null;
		this._borderTop = null;
		this._borderRight = null;
		this._borderBottom = null;
		this._borderColor = null;
		this._borderImage = null;
		this._fontSize = null;
		this._fontFamily = null;
		this._lineHeight = null;
		this._textAlign = null;
		this._verticalAlign = null;
	}

	public get id():number {
		return this._id;
	}

	public get basedOn():UiStyle|null {
		return this._basedOn;	
	}

	public set basedOn(parent:UiStyle|null) {
		if (this._basedOn != parent) {
			if (this._basedOn != null) {
				this._basedOn.removeInherits(this);
			}
			this._basedOn = parent;
			if (this._basedOn != null) {
				this._basedOn.appendInherits(this);
			}
		}
	}

	private appendInherits(child:UiStyle):void {
		this._inherits.push(child);
		this._childrenOrdered = false;
	}

	private removeInherits(child:UiStyle):void {
		let index = this._inherits.indexOf(child);
		this._inherits.splice(index, 1);
	}

	public getEffectiveStyle(node:UiNode):UiStyle {
		let effective:UiStyle = this;
		let found:UiStyle|null = effective.findChild(node);
		while (found != null) {
			effective = found;
			found = effective.findChild(node);
		}
		return effective;
	}

	private findChild(node:UiNode):UiStyle|null {
		this.ensureChildrenOrder();
		for (let c of this._inherits) {
			if (c.isConditionMatches(node)) {
				return c;
			}
		}
		return null;
	}

	private isConditionMatches(node:UiNode):boolean {
		if (this._conditionName != null) {
			let func = UiStyle.CONDITION_FUNCS[this.conditionOrder];
			return func(node, this._conditionParam);
		} else {
			return true;
		}
	}

	private ensureChildrenOrder():void {
		if (!this._childrenOrdered) {
			this._inherits.sort((a:UiStyle, b:UiStyle) => {
				return a.conditionOrder - b.conditionOrder;
			});
			this._childrenOrdered = true;
		}
	}

	private get conditionOrder():number {
		if (this._conditionName != null) {
			return UiStyle.CONDITION_ORDERS[this._conditionName];
		} else {
			return 0;
		}
	}

	public get conditionName():UiStyleCondition|null {
		return this._conditionName;
	}

	public get conditionParam():string|null {
		return this._conditionParam;
	}

	public get textColor():Color {
		return this.getProperty((s) => s._textColor, Colors.BLACK) as Color;
	}

	public get backgroundColor():Color {
		return this.getProperty((s) => s._backgroundColor, Colors.WHITE) as Color;
	}

	public get backgroundImage():string|null {
		return this.getProperty((s) => s._backgroundImage, null);
	}

	public get borderLeftAsLength():CssLength {
		return this.getProperty((s) => s._borderLeft, CssLength.ZERO) as CssLength;
	}

	public get borderLeft():string {
		return this.borderLeftAsLength.toString();
	}

	public get borderTopAsLength():CssLength {
		return this.getProperty((s) => s._borderTop, CssLength.ZERO) as CssLength;
	}

	public get borderTop():string {
		return this.borderTopAsLength.toString();
	}

	public get borderRightAsLength():CssLength {
		return this.getProperty((s) => s._borderRight, CssLength.ZERO) as CssLength;
	}

	public get borderRight():string {
		return this.borderRightAsLength.toString();
	}

	public get borderBottomAsLength():CssLength {
		return this.getProperty((s) => s._borderBottom, CssLength.ZERO) as CssLength;
	}

	public get borderBottom():string {
		return this.borderBottomAsLength.toString();
	}

	public get borderColor():Color {
		return this.getProperty((s) => s._borderColor, Colors.BLACK) as Color;
	}

	public get borderImage():string|null {
		return this.getProperty((s) => s._borderImage, null);
	}

	public get fontSizeAsLength():CssLength {
		return this.getProperty((s) => s._fontSize, UiStyle.DEFAULT_FONT_SIZE) as CssLength;
	}

	public get fontSize():string {
		return this.fontSizeAsLength.toString();
	}

	public get fontFamily():string {
		return this.getProperty((s) => s._fontFamily, UiStyle.DEFAULT_FONT_FAMILY) as string;
	}

	public get lineHeight():string {
		let prop:CssLength|null = this.getProperty((s) => s._lineHeight, null);
		return (prop == null ? this.fontSize : prop.toString());
	}

	public get textAlign():TextAlign {
		return this.getProperty((s) => s._textAlign, "justify") as TextAlign;
	}

	public get verticalAlign():VerticalAlign {
		return this.getProperty((s) => s._verticalAlign, "top") as VerticalAlign;
	}

	private getProperty<R>(func:(s:UiStyle)=>R|null, defaultValue:R|null):R|null {
		let s:UiStyle|null = this;
		while (s != null) {
			let r:R|null = func(s);
			if (r != null) {
				return r;
			}
			s = s._basedOn;
		}
		return defaultValue;
	}

	public collect(styles:Set<UiStyle>):void {
		if (this._id == UiStyle.EMPTY_STYLE_ID) {
			return;
		}
		styles.add(this);
		for (let c of this._inherits) {
			c.collect(styles);
		}
	}

	public toCssString():string {
		let sb = "";
		sb += "{"
		sb += this.getColorProperty ("color", this.textColor);
		sb += this.getColorProperty ("background-color", this.backgroundColor);
		sb += this.getStringProperty("background-image", this.backgroundImage);
		sb += this.getStringProperty("border-left-width", this.borderLeft);
		sb += this.getStringProperty("border-top-width", this.borderTop);
		sb += this.getStringProperty("border-right-width", this.borderRight);
		sb += this.getStringProperty("border-bottom-width", this.borderBottom);
		sb += this.getColorProperty ("border-color", this.borderColor);
		sb += this.getStringProperty("border-image", this.borderImage);
		sb += this.getStringProperty("font-size", this.fontSize);
		sb += this.getStringProperty("font-family", this.fontFamily);
		sb += this.getStringProperty("line-height", this.lineHeight);
		sb += "}";
		return sb;
	}

	private getColorProperty(cssName:string, color:Color|null):string {
		if (color == null) {
			return "";
		}
		return cssName + ":" + Colors.toCssColor(color) + ";";
	}

	private getStringProperty(cssName:string, str:string|null):string {
		if (str == null) {
			return "";
		}
		return cssName + ":" + str.toString() + ";";
	}

	public set conditionName(value:UiStyleCondition|null) {
		this._conditionName = value;
	}

	public set conditionParam(value:string|null) {
		this._conditionParam = value;
	}

	public set textColor(value:Color|null) {
		this._textColor = value;
	}

	public set backgroundColor(value:Color|null) {
		this._backgroundColor = value;
	}

	public set backgroundImage(value:string|null) {
		this._backgroundImage = value;
	}

	public set borderLeft(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		this._borderLeft = value;
	}

	public set borderTop(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		this._borderTop = value;
	}

	public set borderRight(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		this._borderRight = value;
	}

	public set borderBottom(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		this._borderBottom = value;
	}

	public set borderColor(value:Color|null) {
		this._borderColor = value;
	}

	public set borderImage(value:string|null) {
		this._borderImage = value;
	}

	public set fontSize(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		this._fontSize = value;
	}

	public set fontFamily(value:string|null) {
		this._fontFamily = value;
	}

	public set lineHeight(str:string|null) {
		let value:CssLength|null = (str == null ? null : new CssLength(str));
		this._lineHeight = value;
	}

	public set textAlign(value:TextAlign|null) {
		this._textAlign = value;
	}

	public set verticalAlign(value:VerticalAlign|null) {
		this._verticalAlign = value;
	}

}

export class UiStyleBuilder {

	private _style:UiStyle;

	public constructor() {
		this._style = new UiStyle();
	}

	public basedOn(parent:UiStyle|null):UiStyleBuilder {
		this._style.basedOn = parent;
		return this;
	}

	public condition(name:UiStyleCondition|null, param:string|null = null):UiStyleBuilder {
		this._style.conditionName = name;
		this._style.conditionParam = param;
		return this;
	}

	public textColor(value:Color|null):UiStyleBuilder {
		this._style.textColor = value;
		return this;
	}

	public backgroundColor(value:Color|null):UiStyleBuilder {
		this._style.backgroundColor = value;
		return this;
	}

	public backgroundImage(value:string|null):UiStyleBuilder {
		this._style.backgroundImage = value;
		return this;
	}
	public borderSize(value:string|null):UiStyleBuilder {
		this._style.borderLeft = value;
		this._style.borderTop = value;
		this._style.borderRight = value;
		this._style.borderBottom = value;
		return this;
	}

	public borderLeft(value:string|null):UiStyleBuilder {
		this._style.borderLeft = value;
		return this;
	}

	public borderTop(value:string|null):UiStyleBuilder {
		this._style.borderTop = value;
		return this;
	}

	public borderRight(value:string|null):UiStyleBuilder {
		this._style.borderRight = value;
		return this;
	}

	public borderBottom(value:string|null):UiStyleBuilder {
		this._style.borderBottom = value;
		return this;
	}

	public borderColor(value:Color|null):UiStyleBuilder {
		this._style.borderColor = value;
		return this;
	}

	public borderImage(value:string|null):UiStyleBuilder {
		this._style.borderImage = value;
		return this;
	}

	public fontSize(value:string|null):UiStyleBuilder {
		this._style.fontSize = value;
		return this;
	}

	public fontFamily(value:string|null):UiStyleBuilder {
		this._style.fontFamily = value;
		return this;
	}

	public lineHeight(value:string|null):UiStyleBuilder {
		this._style.lineHeight = value;
		return this;
	}

	public textAlign(value:TextAlign|null):UiStyleBuilder {
		this._style.textAlign = value;
		return this;
	}

	public verticalAlign(value:VerticalAlign|null):UiStyleBuilder {
		this._style.verticalAlign = value;
		return this;
	}

	public build():UiStyle {
		return this._style;
	}

}
