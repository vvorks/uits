import { CssLength } from '~/lib/ui/CssLength';
import { Color, Colors } from '~/lib/ui/Colors';
import { UiNode } from '~/lib/ui/UiNode';

export type UiStyleCondition = 'NAMED' | 'CLICKING' | 'FOCUS' | 'ENABLE' | 'DISABLE' | 'OTHERWISE';
export type TextAlign = 'left' | 'right' | 'center' | 'justify';
export type VerticalAlign = 'top' | 'bottom' | 'middle';

/**
 * UiStyle
 */
export class UiStyle {
  private static readonly EMPTY_STYLE_ID = 0;

  private static readonly CONDITION_ORDERS = {
    NONE: 0,
    NAMED: 1,
    CLICKING: 2,
    FOCUS: 3,
    ENABLE: 4,
    DISABLE: 5,
    OTHERWISE: 6,
  };

  private static readonly CONDITION_FUNCS: ((node: UiNode, param: string | null) => boolean)[] = [
    (node: UiNode, param: string | null) => false, //BASED
    (node: UiNode, param: string | null) => node.name == param, //NAMED
    (node: UiNode, param: string | null) => node.clicking, //CLICKING
    (node: UiNode, param: string | null) => node.hasFocus(), //FOCUS
    (node: UiNode, param: string | null) => node.enable, //ENABLE
    (node: UiNode, param: string | null) => !node.enable, //DISABLE
    (node: UiNode, param: string | null) => true, //OTHERWISE
  ];

  /** デフォルトフォントサイズ */
  private static readonly DEFAULT_FONT_SIZE = new CssLength(10.5, 'pt');

  /** デフォルトフォントファミリー名 */
  private static readonly DEFAULT_FONT_FAMILY = 'sans-serif';

  /** デフォルト行間 */
  private static readonly DEFAULT_LINE_HEIGHT = new CssLength('1.5', '');

  /** ID */
  private _id: number;

  /** 基底スタイル */
  private _basedOn: UiStyle | null;

  /** 派生スタイル */
  private _inherits: UiStyle[];

  private _childrenOrdered: boolean;

  private _conditionName: UiStyleCondition | null;

  private _conditionParam: string | null;

  /** 前景色 */
  private _textColor: Color | null;

  /** 背景色 */
  private _backgroundColor: Color | null;

  /** 背景画像URL */
  private _backgroundImage: string | null;

  /** ボーダーサイズ(Length)（左） */
  private _borderLeft: CssLength | null;

  /** ボーダーサイズ(Length)（上） */
  private _borderTop: CssLength | null;

  /** ボーダーサイズ(Length)（右） */
  private _borderRight: CssLength | null;

  /** ボーダーサイズ(Length)（下） */
  private _borderBottom: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（左上） */
  private _borderRadiusTopLeft: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（右上） */
  private _borderRadiusTopRight: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（左下） */
  private _borderRadiusBottomLeft: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（右下） */
  private _borderRadiusBottomRight: CssLength | null;

  /** ボーダー色 */
  private _borderColor: Color | null;

  /** ボーダー画像URL */
  private _borderImage: string | null;

  /** フォントサイズ(Length) */
  private _fontSize: CssLength | null;

  /** フォントの種類 */
  private _fontFamily: string | null;

  /** 行の高さ(Length) */
  private _lineHeight: CssLength | null;

  /** 行の揃え位置 */
  private _textAlign: TextAlign | null;

  /** 縦方向の揃え位置 */
  private _verticalAlign: VerticalAlign | null;

  private static _counter: number = 0;

  /** 空スタイル */
  public static EMPTY: UiStyle = new UiStyle();

  public constructor(builder?: UiStyleBuilder) {
    if (builder == undefined) {
      this._id = UiStyle.EMPTY_STYLE_ID;
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
      this._borderRadiusTopLeft = null;
      this._borderRadiusTopRight = null;
      this._borderRadiusBottomLeft = null;
      this._borderRadiusBottomRight = null;
      this._borderColor = null;
      this._borderImage = null;
      this._fontSize = null;
      this._fontFamily = null;
      this._lineHeight = null;
      this._textAlign = null;
      this._verticalAlign = null;
    } else {
      UiStyle._counter++;
      this._id = UiStyle._counter;
      this._basedOn = null;
      this._inherits = [];
      this._childrenOrdered = false;
      this._conditionName = builder.getConditionName();
      this._conditionParam = builder.getConditionParam();
      this._textColor = builder.getTextColor();
      this._backgroundColor = builder.getBackgroundColor();
      this._backgroundImage = builder.getBackgroundImage();
      this._borderLeft = builder.getBorderLeft();
      this._borderTop = builder.getBorderTop();
      this._borderRight = builder.getBorderRight();
      this._borderBottom = builder.getBorderBottom();
      this._borderRadiusTopLeft = builder.getBorderRadiusTopLeft();
      this._borderRadiusTopRight = builder.getBorderRadiusTopRight();
      this._borderRadiusBottomLeft = builder.getBorderRadiusBottomLeft();
      this._borderRadiusBottomRight = builder.getBorderRadiusBottomRight();
      this._borderColor = builder.getBorderColor();
      this._borderImage = builder.getBorderImage();
      this._fontSize = builder.getFontSize();
      this._fontFamily = builder.getFontFamily();
      this._lineHeight = builder.getLineHeight();
      this._textAlign = builder.getTextAlign();
      this._verticalAlign = builder.getVerticalAlign();
      this.setBasedOn(builder.getBasedOn());
    }
  }

  private setBasedOn(parent: UiStyle | null): void {
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

  private appendInherits(child: UiStyle): void {
    this._inherits.push(child);
    this._childrenOrdered = false;
  }

  private removeInherits(child: UiStyle): void {
    let index = this._inherits.indexOf(child);
    this._inherits.splice(index, 1);
  }

  public get id(): number {
    return this._id;
  }

  public get basedOn(): UiStyle | null {
    return this._basedOn;
  }

  public getEffectiveStyle(node: UiNode): UiStyle {
    let effective: UiStyle = this;
    let found: UiStyle | null = effective.findMatchedChild(node);
    while (found != null) {
      effective = found;
      found = effective.findMatchedChild(node);
    }
    return effective;
  }

  private findMatchedChild(node: UiNode): UiStyle | null {
    this.ensureChildrenOrder();
    for (let c of this._inherits) {
      if (c.isConditionMatches(node)) {
        return c;
      }
    }
    return null;
  }

  private isConditionMatches(node: UiNode): boolean {
    let func = UiStyle.CONDITION_FUNCS[this.conditionOrder];
    return func(node, this._conditionParam);
  }

  private ensureChildrenOrder(): void {
    if (!this._childrenOrdered) {
      this._inherits.sort((a: UiStyle, b: UiStyle) => {
        return a.conditionOrder - b.conditionOrder;
      });
      this._childrenOrdered = true;
    }
  }

  private get conditionOrder(): number {
    if (this._conditionName != null) {
      return UiStyle.CONDITION_ORDERS[this._conditionName];
    } else {
      return UiStyle.CONDITION_ORDERS.NONE;
    }
  }

  public getConditionalStyle(cond: UiStyleCondition, param?: string | null): UiStyle | null {
    if (this.conditionName == cond && (param === undefined || this.conditionParam == param)) {
      return this;
    }
    this.ensureChildrenOrder();
    for (let c of this._inherits) {
      if (c.conditionName != null) {
        let result = c.getConditionalStyle(cond, param);
        if (result != null) {
          return result;
        }
      }
    }
    return null;
  }

  public get conditionName(): UiStyleCondition | null {
    return this._conditionName;
  }

  public get conditionParam(): string | null {
    return this._conditionParam;
  }

  public get textColor(): Color {
    return this.getProperty((s) => s._textColor, Colors.BLACK) as Color;
  }

  public get backgroundColor(): Color {
    return this.getProperty((s) => s._backgroundColor, Colors.WHITE) as Color;
  }

  public get backgroundImage(): string | null {
    return this.getProperty((s) => s._backgroundImage, null);
  }

  public get borderLeftAsLength(): CssLength {
    return this.getProperty((s) => s._borderLeft, CssLength.ZERO) as CssLength;
  }

  public get borderLeft(): string {
    return this.borderLeftAsLength.toString();
  }

  public get borderTopAsLength(): CssLength {
    return this.getProperty((s) => s._borderTop, CssLength.ZERO) as CssLength;
  }

  public get borderTop(): string {
    return this.borderTopAsLength.toString();
  }

  public get borderRightAsLength(): CssLength {
    return this.getProperty((s) => s._borderRight, CssLength.ZERO) as CssLength;
  }

  public get borderRight(): string {
    return this.borderRightAsLength.toString();
  }

  public get borderBottomAsLength(): CssLength {
    return this.getProperty((s) => s._borderBottom, CssLength.ZERO) as CssLength;
  }

  public get borderBottom(): string {
    return this.borderBottomAsLength.toString();
  }

  public get borderRadiusTopLeftAsLength(): CssLength {
    return this.getProperty((s) => s._borderRadiusTopLeft, CssLength.ZERO) as CssLength;
  }

  public get borderRadiusTopLeft(): string {
    return this.borderRadiusTopLeftAsLength.toString();
  }

  public get borderRadiusTopRightAsLength(): CssLength {
    return this.getProperty((s) => s._borderRadiusTopRight, CssLength.ZERO) as CssLength;
  }

  public get borderRadiusTopRight(): string {
    return this.borderRadiusTopRightAsLength.toString();
  }

  public get borderRadiusBottomLeftAsLength(): CssLength {
    return this.getProperty((s) => s._borderRadiusBottomLeft, CssLength.ZERO) as CssLength;
  }

  public get borderRadiusBottomLeft(): string {
    return this.borderRadiusBottomLeftAsLength.toString();
  }

  public get borderRadiusBottomRightAsLength(): CssLength {
    return this.getProperty((s) => s._borderRadiusBottomRight, CssLength.ZERO) as CssLength;
  }

  public get borderRadiusBottomRight(): string {
    return this.borderRadiusBottomRightAsLength.toString();
  }

  public get borderColor(): Color {
    return this.getProperty((s) => s._borderColor, Colors.BLACK) as Color;
  }

  public get borderImage(): string | null {
    return this.getProperty((s) => s._borderImage, null);
  }

  public get fontSizeAsLength(): CssLength {
    return this.getProperty((s) => s._fontSize, UiStyle.DEFAULT_FONT_SIZE) as CssLength;
  }

  public get fontSize(): string {
    return this.fontSizeAsLength.toString();
  }

  public get fontFamily(): string {
    return this.getProperty((s) => s._fontFamily, UiStyle.DEFAULT_FONT_FAMILY) as string;
  }

  public get lineHeight(): string {
    return (
      this.getProperty((s) => s._lineHeight, UiStyle.DEFAULT_LINE_HEIGHT) as CssLength
    ).toString();
  }

  public get textAlign(): TextAlign {
    return this.getProperty((s) => s._textAlign, 'justify') as TextAlign;
  }

  public get verticalAlign(): VerticalAlign {
    return this.getProperty((s) => s._verticalAlign, 'top') as VerticalAlign;
  }

  private getProperty<R>(func: (s: UiStyle) => R | null, defaultValue: R | null): R | null {
    let s: UiStyle | null = this;
    while (s != null) {
      let r: R | null = func(s);
      if (r != null) {
        return r;
      }
      s = s._basedOn;
    }
    return defaultValue;
  }

  public collect(styles: Set<UiStyle>): void {
    if (this._id == UiStyle.EMPTY_STYLE_ID) {
      return;
    }
    styles.add(this);
    for (let c of this._inherits) {
      c.collect(styles);
    }
  }

  public toCssString(): string {
    let sb = '';
    sb += '{';
    sb += this.getColorProperty('color', this.textColor);
    sb += this.getColorProperty('background', this.backgroundColor);
    sb += this.getStringProperty('background-image', this.backgroundImage);
    sb += this.getStringProperty('border-left-width', this.borderLeft);
    sb += this.getStringProperty('border-top-width', this.borderTop);
    sb += this.getStringProperty('border-right-width', this.borderRight);
    sb += this.getStringProperty('border-bottom-width', this.borderBottom);
    sb += this.getStringProperty('border-top-left-radius', this.borderRadiusTopLeft);
    sb += this.getStringProperty('border-top-right-radius', this.borderRadiusTopRight);
    sb += this.getStringProperty('border-bottom-left-radius', this.borderRadiusBottomLeft);
    sb += this.getStringProperty('border-bottom-right-radius', this.borderRadiusBottomRight);
    sb += this.getColorProperty('border-color', this.borderColor);
    sb += this.getStringProperty('border-image', this.borderImage);
    sb += this.getStringProperty('font-size', this.fontSize);
    sb += this.getStringProperty('font-family', this.fontFamily);
    sb += this.getStringProperty('line-height', this.lineHeight);
    sb += '}';
    return sb;
  }

  private getColorProperty(cssName: string, color: Color | null): string {
    if (color == null) {
      return '';
    }
    return cssName + ':' + color + ';';
  }

  private getStringProperty(cssName: string, str: string | null): string {
    if (str == null) {
      return '';
    }
    return cssName + ':' + str.toString() + ';';
  }
}

export class UiStyleBuilder {
  /** 基底スタイル */
  private _basedOn: UiStyle | null;

  private _childrenOrdered: boolean;

  private _conditionName: UiStyleCondition | null;

  private _conditionParam: string | null;

  /** 前景色 */
  private _textColor: Color | null;

  /** 背景色 */
  private _backgroundColor: Color | null;

  /** 背景画像URL */
  private _backgroundImage: string | null;

  /** ボーダーサイズ(Length)（左） */
  private _borderLeft: CssLength | null;

  /** ボーダーサイズ(Length)（上） */
  private _borderTop: CssLength | null;

  /** ボーダーサイズ(Length)（右） */
  private _borderRight: CssLength | null;

  /** ボーダーサイズ(Length)（下） */
  private _borderBottom: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（左上） */
  private _borderRadiusTopLeft: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（右上） */
  private _borderRadiusTopRight: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（左下） */
  private _borderRadiusBottomLeft: CssLength | null;

  /** ボーダー角丸めサイズ（Length）（右下） */
  private _borderRadiusBottomRight: CssLength | null;

  /** ボーダー色 */
  private _borderColor: Color | null;

  /** ボーダー画像URL */
  private _borderImage: string | null;

  /** フォントサイズ(Length) */
  private _fontSize: CssLength | null;

  /** フォントの種類 */
  private _fontFamily: string | null;

  /** 行の高さ(Length) */
  private _lineHeight: CssLength | null;

  /** 行の揃え位置 */
  private _textAlign: TextAlign | null;

  /** 縦方向の揃え位置 */
  private _verticalAlign: VerticalAlign | null;

  private static _counter: number = 0;

  public constructor() {
    this._basedOn = null;
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
    this._borderRadiusTopLeft = null;
    this._borderRadiusTopRight = null;
    this._borderRadiusBottomLeft = null;
    this._borderRadiusBottomRight = null;
    this._borderColor = null;
    this._borderImage = null;
    this._fontSize = null;
    this._fontFamily = null;
    this._lineHeight = null;
    this._textAlign = null;
    this._verticalAlign = null;
  }

  public basedOn(parent: UiStyle | null): UiStyleBuilder {
    this._basedOn = parent;
    return this;
  }

  public condition(name: UiStyleCondition | null, param: string | null = null): UiStyleBuilder {
    this._conditionName = name;
    this._conditionParam = param;
    return this;
  }

  public textColor(value: Color | null): UiStyleBuilder {
    this._textColor = value;
    return this;
  }

  public backgroundColor(value: Color | null): UiStyleBuilder {
    this._backgroundColor = value;
    return this;
  }

  public backgroundImage(value: string | null): UiStyleBuilder {
    if (value == null || value == 'none') {
      this._backgroundImage = null;
    } else {
      this._backgroundImage = value;
    }
    return this;
  }

  public borderSize(str: string | null): UiStyleBuilder {
    let value: CssLength | null = str == null ? null : new CssLength(str);
    this._borderLeft = value;
    this._borderTop = value;
    this._borderRight = value;
    this._borderBottom = value;
    return this;
  }

  private getOnlyBorderWidth(borderStyle: string): CssLength | null {
    for (let e of borderStyle.split(' ')) {
      if ('0123456789'.indexOf(e.charAt(0)) >= 0) {
        return new CssLength(e);
      }
    }
    return null;
  }

  private getBorder(str: string | null): CssLength | null {
    if (str == null) {
      return null;
    } else if (str.indexOf(' ') >= 0) {
      return this.getOnlyBorderWidth(str);
    } else {
      return new CssLength(str);
    }
  }

  public borderLeft(str: string | null): UiStyleBuilder {
    this._borderLeft = this.getBorder(str);
    return this;
  }

  public borderTop(str: string | null): UiStyleBuilder {
    this._borderTop = this.getBorder(str);
    return this;
  }

  public borderRight(str: string | null): UiStyleBuilder {
    this._borderRight = this.getBorder(str);
    return this;
  }

  public borderBottom(str: string | null): UiStyleBuilder {
    this._borderBottom = this.getBorder(str);
    return this;
  }

  public borderRadius(str: string | null): UiStyleBuilder {
    let value: CssLength | null = str == null ? null : new CssLength(str);
    this._borderRadiusTopLeft = value;
    this._borderRadiusTopRight = value;
    this._borderRadiusBottomLeft = value;
    this._borderRadiusBottomRight = value;
    return this;
  }

  public borderRadiusLeft(str: string | null): UiStyleBuilder {
    let value: CssLength | null = str == null ? null : new CssLength(str);
    this._borderRadiusTopLeft = value;
    this._borderRadiusBottomLeft = value;
    return this;
  }

  public borderRadiusRight(str: string | null): UiStyleBuilder {
    let value: CssLength | null = str == null ? null : new CssLength(str);
    this._borderRadiusTopRight = value;
    this._borderRadiusBottomRight = value;
    return this;
  }

  public borderRadiusTop(str: string | null): UiStyleBuilder {
    let value: CssLength | null = str == null ? null : new CssLength(str);
    this._borderRadiusTopLeft = value;
    this._borderRadiusTopRight = value;
    return this;
  }

  public borderRadiusBottom(str: string | null): UiStyleBuilder {
    let value: CssLength | null = str == null ? null : new CssLength(str);
    this._borderRadiusBottomLeft = value;
    this._borderRadiusBottomRight = value;
    return this;
  }

  public borderRadiusTopLeft(str: string | null): UiStyleBuilder {
    this._borderRadiusTopLeft = str == null ? null : new CssLength(str);
    return this;
  }

  public borderRadiusTopRight(str: string | null): UiStyleBuilder {
    this._borderRadiusTopRight = str == null ? null : new CssLength(str);
    return this;
  }

  public borderRadiusBottomLeft(str: string | null): UiStyleBuilder {
    this._borderRadiusBottomLeft = str == null ? null : new CssLength(str);
    return this;
  }

  public borderRadiusBottomRight(str: string | null): UiStyleBuilder {
    this._borderRadiusBottomRight = str == null ? null : new CssLength(str);
    return this;
  }

  public borderColor(value: Color | null): UiStyleBuilder {
    this._borderColor = value;
    return this;
  }

  public borderImage(value: string | null): UiStyleBuilder {
    this._borderImage = value;
    return this;
  }

  public fontSize(str: string | null): UiStyleBuilder {
    this._fontSize = str == null ? null : new CssLength(str);
    return this;
  }

  public fontFamily(value: string | null): UiStyleBuilder {
    this._fontFamily = value;
    return this;
  }

  public lineHeight(str: string | null): UiStyleBuilder {
    if (str == 'normal') {
      str = '1.2';
    }
    this._lineHeight = str == null ? null : new CssLength(str, '');
    return this;
  }

  public textAlign(value: TextAlign | null): UiStyleBuilder {
    this._textAlign = value;
    return this;
  }

  public verticalAlign(value: VerticalAlign | null): UiStyleBuilder {
    this._verticalAlign = value;
    return this;
  }

  public build(): UiStyle {
    return new UiStyle(this);
  }

  public getBasedOn(): UiStyle | null {
    return this._basedOn;
  }

  public getConditionName(): UiStyleCondition | null {
    return this._conditionName;
  }

  public getConditionParam(): string | null {
    return this._conditionParam;
  }

  public getTextColor(): Color | null {
    return this._textColor;
  }

  public getBackgroundColor(): Color | null {
    return this._backgroundColor;
  }

  public getBackgroundImage(): string | null {
    return this._backgroundImage;
  }

  public getBorderLeft(): CssLength | null {
    return this._borderLeft;
  }

  public getBorderTop(): CssLength | null {
    return this._borderTop;
  }

  public getBorderRight(): CssLength | null {
    return this._borderRight;
  }

  public getBorderBottom(): CssLength | null {
    return this._borderBottom;
  }

  public getBorderRadiusTopLeft(): CssLength | null {
    return this._borderRadiusTopLeft;
  }

  public getBorderRadiusTopRight(): CssLength | null {
    return this._borderRadiusTopRight;
  }

  public getBorderRadiusBottomLeft(): CssLength | null {
    return this._borderRadiusBottomLeft;
  }

  public getBorderRadiusBottomRight(): CssLength | null {
    return this._borderRadiusBottomRight;
  }

  public getBorderColor(): Color | null {
    return this._borderColor;
  }

  public getBorderImage(): string | null {
    return this._borderImage;
  }

  public getFontSize(): CssLength | null {
    return this._fontSize;
  }

  public getFontFamily(): string | null {
    return this._fontFamily;
  }

  public getLineHeight(): CssLength | null {
    return this._lineHeight;
  }

  public getTextAlign(): TextAlign | null {
    return this._textAlign;
  }

  public getVerticalAlign(): VerticalAlign | null {
    return this._verticalAlign;
  }
}
