import { CssLength } from '~/lib/ui/CssLength';
import { Color, Colors } from '~/lib/ui/Colors';
import { UiNode } from '~/lib/ui/UiNode';
import { Rect } from './Rect';

export type UiStyleCondition =
  | 'NAMED'
  | 'CLICKING'
  | 'FOCUS'
  | 'EMPHASIS'
  | 'ENABLE'
  | 'DISABLE'
  | 'OTHERWISE';
export type TextAlign = 'left' | 'right' | 'center' | 'justify';
export type VerticalAlign = 'top' | 'bottom' | 'middle';
export type Visibility = 'visible' | 'hidden';

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
    EMPHASIS: 4,
    ENABLE: 5,
    DISABLE: 6,
    OTHERWISE: 7,
  };

  private static readonly CONDITION_FUNCS: ((node: UiNode, param: string | null) => boolean)[] = [
    (node: UiNode, param: string | null) => false, //BASED
    (node: UiNode, param: string | null) => node.dataFieldName == param, //NAMED
    (node: UiNode, param: string | null) => node.clicking, //CLICKING
    (node: UiNode, param: string | null) => node.hasFocus(), //FOCUS
    (node: UiNode, param: string | null) => node.emphasis, //EMPHASIS
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

  /** visibility */
  private _visibility: Visibility | null;

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

  /** パディングサイズ(Length)（左） */
  private _paddingLeft: CssLength | null;

  /** パディングサイズ(Length)（上） */
  private _paddingTop: CssLength | null;

  /** パディングサイズ(Length)（右） */
  private _paddingRight: CssLength | null;

  /** パディングサイズ(Length)（下） */
  private _paddingBottom: CssLength | null;

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
      this._visibility = null;
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
      this._paddingLeft = null;
      this._paddingTop = null;
      this._paddingRight = null;
      this._paddingBottom = null;
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
      this._visibility = builder.getVisibility();
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
      this._paddingLeft = builder.getPaddingLeft();
      this._paddingTop = builder.getPaddingTop();
      this._paddingRight = builder.getPaddingRight();
      this._paddingBottom = builder.getPaddingBottom();
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

  public get visibility(): Visibility {
    return this.getProperty((s) => s._visibility, 'visible') as Visibility;
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

  public hasPadding(): boolean {
    return (
      this.getProperty((s) => s._paddingLeft, null) != null ||
      this.getProperty((s) => s._paddingTop, null) != null ||
      this.getProperty((s) => s._paddingRight, null) != null ||
      this.getProperty((s) => s._paddingBottom, null) != null
    );
  }

  public get paddingLeftAsLength(): CssLength {
    return this.getProperty((s) => s._paddingLeft, CssLength.ZERO) as CssLength;
  }

  public get paddingLeft(): string {
    return this.paddingLeftAsLength.toString();
  }

  public get paddingTopAsLength(): CssLength {
    return this.getProperty((s) => s._paddingTop, CssLength.ZERO) as CssLength;
  }

  public get paddingTop(): string {
    return this.paddingTopAsLength.toString();
  }

  public get paddingRightAsLength(): CssLength {
    return this.getProperty((s) => s._paddingRight, CssLength.ZERO) as CssLength;
  }

  public get paddingRight(): string {
    return this.paddingRightAsLength.toString();
  }

  public get paddingBottomAsLength(): CssLength {
    return this.getProperty((s) => s._paddingBottom, CssLength.ZERO) as CssLength;
  }

  public get paddingBottom(): string {
    return this.paddingBottomAsLength.toString();
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

  public get lineHeightAsLength(): CssLength {
    return this.getProperty((s) => s._lineHeight, UiStyle.DEFAULT_LINE_HEIGHT) as CssLength;
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
    let parent = this.basedOn;
    while (parent != null) {
      styles.add(parent);
      parent = parent.basedOn;
    }
    styles.add(this);
    for (let c of this._inherits) {
      c.collect(styles);
    }
  }

  public toCssString(): string {
    if (this._basedOn == null) {
      return this.makeFullStyle();
    } else {
      return this.makeDeltaStyle();
    }
  }

  private makeFullStyle(): string {
    let sb = '';
    sb += '{';
    sb += this.getStringProperty('visibility', this.visibility);
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

  private makeDeltaStyle(): string {
    let sb = '';
    sb += '{';
    if (this._visibility != null) {
      sb += this.getStringProperty('visibility', this.visibility);
    }
    if (this._textColor != null) {
      sb += this.getColorProperty('color', this.textColor);
    }
    if (this._backgroundColor != null) {
      sb += this.getColorProperty('background', this.backgroundColor);
    }
    if (this._backgroundImage != null) {
      sb += this.getStringProperty('background-image', this.backgroundImage);
    }
    if (this._borderLeft != null) {
      sb += this.getStringProperty('border-left-width', this.borderLeft);
    }
    if (this._borderTop != null) {
      sb += this.getStringProperty('border-top-width', this.borderTop);
    }
    if (this._borderRight != null) {
      sb += this.getStringProperty('border-right-width', this.borderRight);
    }
    if (this._borderBottom != null) {
      sb += this.getStringProperty('border-bottom-width', this.borderBottom);
    }
    if (this._borderRadiusTopLeft != null) {
      sb += this.getStringProperty('border-top-left-radius', this.borderRadiusTopLeft);
    }
    if (this._borderRadiusTopRight != null) {
      sb += this.getStringProperty('border-top-right-radius', this.borderRadiusTopRight);
    }
    if (this._borderRadiusBottomLeft != null) {
      sb += this.getStringProperty('border-bottom-left-radius', this.borderRadiusBottomLeft);
    }
    if (this._borderRadiusBottomRight != null) {
      sb += this.getStringProperty('border-bottom-right-radius', this.borderRadiusBottomRight);
    }
    if (this._borderColor != null) {
      sb += this.getColorProperty('border-color', this.borderColor);
    }
    if (this._borderImage != null) {
      sb += this.getStringProperty('border-image', this.borderImage);
    }
    if (this._fontSize != null) {
      sb += this.getStringProperty('font-size', this.fontSize);
    }
    if (this._fontFamily != null) {
      sb += this.getStringProperty('font-family', this.fontFamily);
    }
    if (this._lineHeight != null) {
      sb += this.getStringProperty('line-height', this.lineHeight);
    }
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

  public getClassList(prefix: string): string[] {
    let s: UiStyle | null = this;
    let result: string[] = [];
    result.push(prefix + s.id);
    while (s.basedOn != null) {
      s = s.basedOn;
      result.push(prefix + s.id);
    }
    return result;
  }

  public static addPadding(
    style: CSSStyleDeclaration,
    uiStyle: UiStyle,
    rect: Rect
  ): CSSStyleDeclaration {
    if (uiStyle.hasPadding()) {
      style.paddingLeft = uiStyle.paddingLeft;
      style.paddingTop = uiStyle.paddingTop;
      style.paddingRight = uiStyle.paddingRight;
      style.paddingBottom = uiStyle.paddingBottom;
    } else {
      let topLeftW = uiStyle.borderRadiusTopLeftAsLength.toPixel(() => rect.width);
      let topLeftH = uiStyle.borderRadiusTopLeftAsLength.toPixel(() => rect.height);
      let bottomLeftW = uiStyle.borderRadiusBottomLeftAsLength.toPixel(() => rect.width);
      let bottomLeftH = uiStyle.borderRadiusBottomLeftAsLength.toPixel(() => rect.height);
      let topRightW = uiStyle.borderRadiusTopRightAsLength.toPixel(() => rect.width);
      let topRightH = uiStyle.borderRadiusTopRightAsLength.toPixel(() => rect.height);
      let bottomRightW = uiStyle.borderRadiusBottomRightAsLength.toPixel(() => rect.width);
      let bottomRightH = uiStyle.borderRadiusBottomRightAsLength.toPixel(() => rect.height);
      if (rect.width > rect.height * 2) {
        //横長矩形の場合
        style.paddingLeft = `${Math.max(topLeftW, bottomLeftW)}px`;
        style.paddingRight = `${Math.max(topRightW, bottomRightW)}px`;
        style.paddingTop = '0px';
        style.paddingBottom = '0px';
      } else if (rect.height > rect.width * 2) {
        //縦長矩形の場合
        style.paddingLeft = '0px';
        style.paddingRight = '0px';
        style.paddingTop = `${Math.max(topLeftH, topRightH)}px`;
        style.paddingBottom = `${Math.max(bottomLeftH, bottomRightH)}px`;
      } else {
        //一般矩形の場合
        let ratio = 1.0 - 1 / Math.sqrt(2);
        style.paddingLeft = `${Math.max(topLeftW, bottomLeftW) * ratio}px`;
        style.paddingRight = `${Math.max(topRightW, bottomRightW) * ratio}px`;
        style.paddingTop = `${Math.max(topLeftH, topRightH) * ratio}px`;
        style.paddingBottom = `${Math.max(bottomLeftH, bottomRightH) * ratio}px`;
      }
    }
    return style;
  }
}

export class UiStyleBuilder {
  /** 基底スタイル */
  private _basedOn: UiStyle | null;

  private _childrenOrdered: boolean;

  private _conditionName: UiStyleCondition | null;

  private _conditionParam: string | null;

  /** visibility */
  private _visibility: Visibility | null;

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

  /** パディングサイズ(Length)（左） */
  private _paddingLeft: CssLength | null;

  /** パディングサイズ(Length)（上） */
  private _paddingTop: CssLength | null;

  /** パディングサイズ(Length)（右） */
  private _paddingRight: CssLength | null;

  /** パディングサイズ(Length)（下） */
  private _paddingBottom: CssLength | null;

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

  public constructor(baseStyle?: UiStyle) {
    if (baseStyle === undefined) {
      this._basedOn = null;
      this._childrenOrdered = false;
      this._conditionName = null;
      this._conditionParam = null;
      this._visibility = null;
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
      this._paddingLeft = null;
      this._paddingTop = null;
      this._paddingRight = null;
      this._paddingBottom = null;
      this._fontSize = null;
      this._fontFamily = null;
      this._lineHeight = null;
      this._textAlign = null;
      this._verticalAlign = null;
    } else {
      this._basedOn = baseStyle.basedOn;
      this._childrenOrdered = false;
      this._conditionName = baseStyle.conditionName;
      this._conditionParam = baseStyle.conditionParam;
      this._visibility = baseStyle.visibility;
      this._textColor = baseStyle.textColor;
      this._backgroundColor = baseStyle.backgroundColor;
      this._backgroundImage = baseStyle.backgroundImage;
      this._borderLeft = baseStyle.borderLeftAsLength;
      this._borderTop = baseStyle.borderTopAsLength;
      this._borderRight = baseStyle.borderRightAsLength;
      this._borderBottom = baseStyle.borderBottomAsLength;
      this._borderRadiusTopLeft = baseStyle.borderRadiusTopLeftAsLength;
      this._borderRadiusTopRight = baseStyle.borderRadiusTopRightAsLength;
      this._borderRadiusBottomLeft = baseStyle.borderRadiusBottomLeftAsLength;
      this._borderRadiusBottomRight = baseStyle.borderRadiusBottomRightAsLength;
      this._borderColor = baseStyle.borderColor;
      this._borderImage = baseStyle.borderImage;
      this._paddingLeft = baseStyle.paddingLeftAsLength;
      this._paddingTop = baseStyle.paddingTopAsLength;
      this._paddingRight = baseStyle.paddingRightAsLength;
      this._paddingBottom = baseStyle.paddingBottomAsLength;
      this._fontSize = baseStyle.fontSizeAsLength;
      this._fontFamily = baseStyle.fontFamily;
      this._lineHeight = baseStyle.lineHeightAsLength;
      this._textAlign = baseStyle.textAlign;
      this._verticalAlign = baseStyle.verticalAlign;
    }
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

  public visibility(value: Visibility | null): UiStyleBuilder {
    this._visibility = value;
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

  public paddingLeft(str: string | null): UiStyleBuilder {
    this._paddingLeft = str == null ? null : new CssLength(str);
    return this;
  }

  public paddingTop(str: string | null): UiStyleBuilder {
    this._paddingTop = str == null ? null : new CssLength(str);
    return this;
  }

  public paddingRight(str: string | null): UiStyleBuilder {
    this._paddingRight = str == null ? null : new CssLength(str);
    return this;
  }

  public paddingBottom(str: string | null): UiStyleBuilder {
    this._paddingBottom = str == null ? null : new CssLength(str);
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

  public getVisibility(): Visibility | null {
    return this._visibility;
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

  public getPaddingLeft(): CssLength | null {
    return this._paddingLeft;
  }

  public getPaddingTop(): CssLength | null {
    return this._paddingTop;
  }

  public getPaddingRight(): CssLength | null {
    return this._paddingRight;
  }

  public getPaddingBottom(): CssLength | null {
    return this._paddingBottom;
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
