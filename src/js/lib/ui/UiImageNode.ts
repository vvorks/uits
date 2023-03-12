import { CssLength } from '~/lib/ui/CssLength';
import { Flags, Size, UiNode, UiNodeSetter } from '~/lib/ui/UiNode';
import { TextAlign, VerticalAlign } from '~/lib/ui/UiStyle';
import { Logs, Value } from '../lang';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';
import { UiCanvas } from './UiCanvas';

export class UiImageNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiImageNodeSetter();
  public imageContent(value: Value): this {
    let node = this.node as UiImageNode;
    node.imageContent = value;
    return this;
  }

  public imageSize(width: Size | null, height: Size | null): this {
    let node = this.node as UiImageNode;
    node.imageWidth = width;
    node.imageHeight = height;
    return this;
  }

  public variable(on: boolean): this {
    let node = this.node as UiImageNode;
    node.variable = on;
    return this;
  }
}

export class UiImageNode extends UiNode implements HasSetter<UiImageNodeSetter> {
  private _imageContent: any;

  private _imageWidth: CssLength | null;

  private _imageHeight: CssLength | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiImageNode {
    return new UiImageNode(this);
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
  constructor(src: UiImageNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiImageNode) {
      super(param as UiImageNode);
      let src = param as UiImageNode;
      this._imageContent = src._imageContent;
      this._imageWidth = src._imageWidth;
      this._imageHeight = src._imageHeight;
    } else {
      super(param as UiApplication, name as string);
      this._imageContent = null;
      this._imageWidth = null;
      this._imageHeight = null;
    }
  }

  public getSetter(): UiImageNodeSetter {
    return UiImageNodeSetter.INSTANCE;
  }

  public get imageContent(): any {
    return this._imageContent;
  }

  public set imageContent(value: any) {
    if (this._imageContent != value) {
      this._imageContent = value;
      this.onContentChanged();
    }
  }

  public get imageWidth(): Size | null {
    return this._imageWidth == null ? null : this._imageWidth.toString();
  }

  public get imageWidthAsLength(): CssLength | null {
    return this._imageWidth == null ? null : this._imageWidth;
  }

  public set imageWidth(size: Size | null) {
    this._imageWidth = size == null ? null : new CssLength(size);
  }

  public get imageHeight(): Size | null {
    return this._imageHeight == null ? null : this._imageHeight.toString();
  }

  public get imageHeightAsLength(): CssLength | null {
    return this._imageHeight == null ? null : this._imageHeight;
  }

  public set imageHeight(size: Size | null) {
    this._imageHeight = size == null ? null : new CssLength(size);
  }

  public get variable(): boolean {
    return this.getFlag(Flags.VARIABLE);
  }

  public set variable(on: boolean) {
    if (this.setFlag(Flags.VARIABLE, on)) {
      //nop
    }
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement | null {
    let dom = super.createDomElement(target, tag);
    if (dom == null) {
      return null;
    }
    let img = document.createElement('img');
    let style = img.style;
    style.position = 'absolute';
    style.display = 'block';
    dom.appendChild(img);
    img.addEventListener('load', () => this.onLoadImage());
    return dom;
  }

  protected renderContent(): void {
    const app = this.application;
    if (this.domElement == null) {
      return;
    }
    const dom = this.domElement as HTMLElement;
    const img = dom.firstChild as HTMLImageElement;
    if (this._imageContent === undefined || this._imageContent == null) {
      img.src = '';
      return;
    }
    const cssStyle = img.style;
    const uiStyle = this.style.getEffectiveStyle(this);
    const align: TextAlign = uiStyle.textAlign;
    const valign: VerticalAlign = uiStyle.verticalAlign;
    if (this._imageWidth != null || this._imageHeight != null) {
      cssStyle.width = this._imageWidth != null ? this._imageWidth.toString() : 'auto';
      cssStyle.height = this._imageHeight != null ? this._imageHeight.toString() : 'auto';
    } else if (this.variable) {
      cssStyle.width = 'auto';
      cssStyle.height = 'auto';
    } else {
      cssStyle.width = '100%';
      cssStyle.height = 'auto';
    }
    if (align == 'left' || align == 'justify') {
      cssStyle.left = '0px';
    } else if (align == 'right') {
      cssStyle.right = '0px';
    } else {
      cssStyle.left = '0px';
      cssStyle.right = '0px';
      cssStyle.margin = 'auto';
    }
    if (valign == 'top') {
      cssStyle.top = '0px';
    } else if (valign == 'bottom') {
      cssStyle.bottom = '0px';
    } else {
      cssStyle.top = '0px'; //暫定値
    }
    img.src = this._imageContent;
  }

  private onLoadImage(): void {
    const app = this.application;
    const dom = this.domElement as HTMLElement;
    const img = dom.firstChild as HTMLImageElement;
    const cssStyle = img.style;
    const uiStyle = this.style.getEffectiveStyle(this);
    const valign: VerticalAlign = uiStyle.verticalAlign;
    if (this.variable) {
      this.width = `${img.clientWidth}px`;
      this.height = `${img.clientHeight}px`;
      cssStyle.left = '0px';
      cssStyle.top = '0px';
      cssStyle.width = `${img.clientWidth}px`;
      cssStyle.height = `${img.clientHeight}px`;
    } else if (valign == 'middle') {
      cssStyle.height = `${img.clientHeight}px`;
      cssStyle.top = '0px';
      cssStyle.bottom = '0px';
    }
    if (this.parent != null) {
      this.parent.onLayoutChanged();
    }
    app.syncAfterFinally();
  }

  public repaintImage(): void {
    this.onContentChanged();
  }

  protected paintContent(canvas: UiCanvas): void {
    let style = this.style.getEffectiveStyle(this);
    let w = this.innerWidth;
    let h = this.innerHeight;
    canvas.drawImage(this, 0, 0, w, h, style);
  }
}
