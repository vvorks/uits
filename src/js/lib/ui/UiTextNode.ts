import { Logs, Value, Values } from '~/lib/lang';
import { Color } from '~/lib/ui/Colors';
import { UiNode, UiNodeSetter } from '~/lib/ui/UiNode';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';
import { UiStyle } from '~/lib/ui/UiStyle';

const RESOURCE_HEAD_MARKER = '{{';
const RESOURCE_TAIL_MARKER = '}}';

const VALIGN_TRANSFORM = false;

export class UiTextNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiTextNodeSetter();
  public textContent(value: Value): this {
    let node = this.node as UiTextNode;
    node.textContent = value;
    return this;
  }
}

export class UiTextNode extends UiNode implements HasSetter<UiTextNodeSetter> {
  private _textContent: Value;

  private _textColor: Color | null;

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
    } else {
      super(param as UiApplication, name as string);
      this._textContent = null;
      this._textColor = null;
    }
  }

  public getSetter(): UiTextNodeSetter {
    return UiTextNodeSetter.INSTANCE;
  }

  public get textContent(): Value {
    return this._textContent;
  }

  public set textContent(value: Value) {
    if (this._textContent != value) {
      this._textContent = value;
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

  protected createDomElement(target: UiNode, tag: string): HTMLElement {
    let border = this.getBorderSize();
    let dom = super.createDomElement(target, tag);
    if (VALIGN_TRANSFORM) {
      let div = document.createElement('div');
      let style = div.style;
      style.position = 'absolute';
      style.left = `${border.left}px`;
      style.right = `${border.right}px`;
      dom.appendChild(div);
    } else {
      let tb = document.createElement('div');
      let style = tb.style;
      style.display = 'table';
      style.width = '100%';
      style.height = '100%';
      let td = document.createElement('div');
      let tdStyle = td.style;
      tdStyle.display = 'table-cell';
      tdStyle.width = '100%';
      tdStyle.height = '100%';
      tb.appendChild(td);
      dom.appendChild(tb);
    }
    return dom;
  }

  protected renderContent(): void {
    let app = this.application;
    let border = this.getBorderSize();
    let dom = this.domElement as HTMLElement;
    let uiStyle = this.style.getEffectiveStyle(this);
    let align = uiStyle.textAlign;
    let valign = uiStyle.verticalAlign;
    if (VALIGN_TRANSFORM) {
      let div = dom.firstChild as HTMLDivElement;
      let divStyle = div.style;
      divStyle.textAlign = align;
      if (valign == 'top') {
        divStyle.top = `${border.top}px`;
      } else if (valign == 'bottom') {
        divStyle.bottom = `${border.bottom}px`;
      } else {
        divStyle.top = '50%';
        divStyle.transform = 'translate(0,-50%)';
      }
      if (this._textColor != null) {
        divStyle.color = this._textColor;
      } else {
        divStyle.removeProperty('color');
      }
      this.addPaddingForRadius(divStyle, uiStyle);
      let text = this.retrieveTextResource(Values.asString(this.textContent)).trimRight();
      div.innerText = text;
      let ellipsis = '・・・';
      app.runFinally(() => this.addEllipsis(text, ellipsis, dom, div));
    } else {
      let tb = dom.firstChild as HTMLTableElement;
      let td = tb.firstChild as HTMLTableCellElement;
      let tdStyle = td.style;
      tdStyle.textAlign = align;
      if (valign == 'top') {
        tdStyle.verticalAlign = 'top';
      } else if (valign == 'bottom') {
        tdStyle.verticalAlign = 'bottom';
      } else {
        tdStyle.verticalAlign = 'middle';
      }
      if (this._textColor != null) {
        tdStyle.color = this._textColor;
      } else {
        tdStyle.removeProperty('color');
      }
      this.addPaddingForRadius(tdStyle, uiStyle);
      let text = this.retrieveTextResource(Values.asString(this.textContent)).trimRight();
      td.innerText = text;
      let ellipsis = '・・・';
      app.runFinally(() => this.addEllipsis(text, ellipsis, dom, td));
    }
  }

  private addEllipsis(
    text: string,
    ellipsis: string,
    outer: HTMLElement,
    inner: HTMLElement
  ): void {
    if (outer.offsetHeight < outer.scrollHeight) {
      let low = 0;
      let high = text.length;
      let mid = 0;
      while (low < high) {
        mid = Math.floor((low + high) / 2);
        let str = text.substring(0, mid) + ellipsis;
        inner.innerText = str;
        if (outer.offsetHeight < outer.scrollHeight) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      while (outer.offsetHeight == outer.scrollHeight) {
        mid++;
        let str = text.substring(0, mid) + ellipsis;
        inner.innerText = str;
      }
      while (outer.offsetHeight < outer.scrollHeight) {
        mid--;
        let str = text.substring(0, mid) + ellipsis;
        inner.innerText = str;
      }
    }
  }

  addPaddingForRadius(style: CSSStyleDeclaration, uiStyle: UiStyle) {
    let rect = this.getRect();
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
}
