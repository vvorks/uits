import { Logs, Strings, Value, Values } from '~/lib/lang';
import { Color } from '~/lib/ui/Colors';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';
import { Flags, UiNode, UiNodeSetter } from '~/lib/ui/UiNode';
import { UiStyle, VerticalAlign } from '~/lib/ui/UiStyle';
import { UiCanvas } from './UiCanvas';

const RESOURCE_HEAD_MARKER = '{{';
const RESOURCE_TAIL_MARKER = '}}';

export class UiTextNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiTextNodeSetter();
  public textContent(value: Value): this {
    let node = this.node as UiTextNode;
    node.textContent = value;
    return this;
  }
  public ellipsis(value: string): this {
    let node = this.node as UiTextNode;
    node.ellipsis = value;
    return this;
  }
  public variable(on: boolean): this {
    let node = this.node as UiTextNode;
    node.variable = on;
    return this;
  }
}

export class UiTextNode extends UiNode implements HasSetter<UiTextNodeSetter> {
  private _textContent: Value;

  private _ellipsis: string | null;

  private _textColor: Color | null;

  private _isHtmlContent: boolean;
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiTextNode {
    return new UiTextNode(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiTextNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiTextNode) {
      super(param as UiTextNode);
      let src = param as UiTextNode;
      this._textContent = src._textContent;
      this._textColor = src._textColor;
      this._ellipsis = src._ellipsis;
      this._isHtmlContent = src._isHtmlContent;
    } else {
      super(param as UiApplication, name as string);
      this._textContent = null;
      this._textColor = null;
      this._ellipsis = null;
      this._isHtmlContent = false;
    }
  }

  public getSetter(): UiTextNodeSetter {
    return UiTextNodeSetter.INSTANCE;
  }

  public get textContent(): Value {
    let str = '';
    if (!this._isHtmlContent) {
      str = this._textContent as string;
    }
    return str;
  }

  public set textContent(value: Value) {
    if (this._textContent != value) {
      this._textContent = value;
      this._isHtmlContent = false;
      this.onContentChanged();
    }
  }

  public get textColor(): Color | null {
    return this._textColor;
  }

  public set textColor(value: Color | null) {
    if (this._textColor != value) {
      this._textColor = value;
      this.onContentChanged();
    }
  }

  public get ellipsis(): string | null {
    return this._ellipsis;
  }

  public set ellipsis(value: string | null) {
    if (this._ellipsis != value) {
      this._ellipsis = value;
      this.onContentChanged();
    }
  }
  public get variable(): boolean {
    return this.getFlag(Flags.VARIABLE);
  }

  public set variable(on: boolean) {
    if (this.setFlag(Flags.VARIABLE, on)) {
      //nop
    }
  }
  protected set htmlContent(text: string) {
    if (text != '') {
      this._isHtmlContent = true;
      this._textContent = text;
    }
  }
  protected get htmlContent() {
    let str = '';
    if (this._isHtmlContent) {
      str = this._textContent as string;
      Logs.info(str);
    }
    return str;
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement | null {
    let dom = super.createDomElement(target, tag);
    if (dom == null) {
      return dom;
    }
    let border = this.getBorderSize();
    let div = document.createElement('div');
    let style = div.style;
    style.position = 'absolute';
    style.left = `${border.left}px`;
    style.right = `${border.right}px`;
    dom.appendChild(div);
    return dom;
  }

  protected renderContent(): void {
    let app = this.application;
    let border = this.getBorderSize();
    let dom = this.domElement as HTMLElement;
    let uiStyle = this.style.getEffectiveStyle(this);
    let align = uiStyle.textAlign;
    let valign = uiStyle.verticalAlign;
    let outer = dom;
    let inner: HTMLElement;
    let innerStyle: CSSStyleDeclaration;
    let div = dom.firstChild as HTMLDivElement;
    inner = div;
    innerStyle = inner.style;
    innerStyle.textAlign = align;
    innerStyle.wordBreak = 'break-word';
    if (valign == 'top') {
      innerStyle.top = `${border.top}px`;
      innerStyle.removeProperty('bottom');
      innerStyle.removeProperty('height');
    } else if (valign == 'bottom') {
      innerStyle.removeProperty('top');
      innerStyle.bottom = `${border.bottom}px`;
      innerStyle.removeProperty('height');
    } else if (valign == 'middle') {
      //仮設定
      innerStyle.top = '0px';
      innerStyle.removeProperty('bottom');
      innerStyle.removeProperty('height');
    }
    if (this._textColor != null) {
      innerStyle.color = this._textColor;
    } else {
      innerStyle.removeProperty('color');
    }
    UiStyle.addPadding(innerStyle, uiStyle, this.getRect());
    let text: string;
    if (this._isHtmlContent) {
      text = this.retrieveTextResource(Values.asString(this.htmlContent)).trimRight();
      inner.innerHTML = text;
    } else {
      text = this.retrieveTextResource(Values.asString(this.textContent)).trimRight();
      inner.innerText = text;
    }
    if (this.variable) {
      app.runFinally(() => {
        this.resizeVertical(outer);
      });
    } else if (valign == 'middle' || this._ellipsis != null) {
      app.runFinally(() => this.adjustVertical(text, valign, this.ellipsis, outer, inner));
    }
  }

  private resizeVertical(outer: HTMLElement) {
    let child = outer.firstChild as HTMLElement;
    let newHeight = `${child.offsetHeight}px`;
    if (this.height != newHeight) {
      this.height = newHeight;
      if (this.parent != null) {
        this.parent.onLayoutChanged();
      }
    }
  }

  private adjustVertical(
    text: string,
    valign: VerticalAlign,
    ellipsis: string | null,
    outer: HTMLElement,
    inner: HTMLElement
  ): void {
    if (outer.clientHeight < inner.clientHeight && ellipsis != null) {
      this.addEllipsis(text, ellipsis, outer, inner);
    }
    if (valign == 'middle') {
      let innerStyle = inner.style;
      innerStyle.height = `${inner.clientHeight}px`;
      innerStyle.top = '0px';
      innerStyle.bottom = '0px';
    }
  }

  private addEllipsis(
    text: string,
    ellipsis: string,
    outer: HTMLElement,
    inner: HTMLElement
  ): void {
    let low = 0;
    let high = text.length;
    let mid = 0;
    while (low < high) {
      mid = Math.floor((low + high) / 2);
      if (Strings.isHighSurrogate(text.charCodeAt(mid - 1))) {
        mid--;
      }
      let str = text.substring(0, mid) + ellipsis;
      inner.innerText = str;
      if (outer.clientHeight < inner.clientHeight) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    while (outer.clientHeight >= inner.clientHeight) {
      mid++;
      if (Strings.isHighSurrogate(text.charCodeAt(mid - 1))) {
        mid++;
      }
      let str = text.substring(0, mid) + ellipsis;
      inner.innerText = str;
    }
    while (outer.clientHeight < inner.clientHeight) {
      mid--;
      if (Strings.isHighSurrogate(text.charCodeAt(mid - 1))) {
        mid--;
      }
      let str = text.substring(0, mid) + ellipsis;
      inner.innerText = str;
    }
  }

  protected retrieveTextResource(raw: string): string {
    let str = raw.trim();
    if (str !== raw) {
      return str;
    }
    let len = raw.length;
    if (len <= RESOURCE_HEAD_MARKER.length + RESOURCE_TAIL_MARKER.length) {
      return raw;
    }
    let head = raw.substring(0, RESOURCE_HEAD_MARKER.length);
    let tail = raw.substring(len - RESOURCE_TAIL_MARKER.length);
    if (head != RESOURCE_HEAD_MARKER || tail != RESOURCE_TAIL_MARKER) {
      return raw;
    }
    let tag = raw.substring(RESOURCE_HEAD_MARKER.length, len - RESOURCE_TAIL_MARKER.length);
    let app = this.application;
    let result = app.findTextResourceAsString(tag, raw);
    return result;
  }

  protected paintContent(canvas: UiCanvas): void {
    let style = this.style.getEffectiveStyle(this);
    let w = this.innerWidth;
    let h = this.innerHeight;
    let text = this.retrieveTextResource(Values.asString(this.textContent)).trimRight();
    canvas.drawText(text, 0, 0, w, h, this.ellipsis, style);
  }
}
