import { CssLength } from '~/lib/ui/CssLength';
import { Size, UiNode, UiNodeSetter } from '~/lib/ui/UiNode';
import { TextAlign, VerticalAlign } from '~/lib/ui/UiStyle';
import { Value } from '../lang';
import { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';

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
      this._imageWidth = new CssLength('100%');
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

  public set imageWidth(size: Size | null) {
    this._imageWidth = size == null ? null : new CssLength(size);
  }

  public get imageHeight(): Size | null {
    return this._imageHeight == null ? null : this._imageHeight.toString();
  }

  public set imageHeight(size: Size | null) {
    this._imageHeight = size == null ? null : new CssLength(size);
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement {
    let dom = super.createDomElement(target, tag);
    let img = document.createElement('img');
    let style = img.style;
    style.position = 'absolute';
    style.display = 'block';
    dom.appendChild(img);
    return dom;
  }

  protected renderContent(): void {
    let dom = this.domElement as HTMLElement;
    let img = dom.firstChild as HTMLImageElement;
    if (this._imageContent === undefined || this._imageContent == null) {
      img.src = '';
      return;
    }
    let cssStyle = img.style;
    let uiStyle = this.style.getEffectiveStyle(this);
    let align: TextAlign = uiStyle.textAlign;
    let valign: VerticalAlign = uiStyle.verticalAlign;
    if (this._imageWidth == null && this._imageHeight == null) {
      cssStyle.width = '100%';
      cssStyle.height = 'auto';
    } else {
      cssStyle.width = this._imageWidth != null ? this._imageWidth.toString() : 'auto';
      cssStyle.height = this._imageHeight != null ? this._imageHeight.toString() : 'auto';
    }
    if (align == 'left') {
      cssStyle.left = '0px';
    } else if (align == 'right') {
      cssStyle.right = '0px';
    } else if (align == 'center') {
      cssStyle.left = '0px';
      cssStyle.right = '0px';
      cssStyle.margin = 'auto';
    }
    if (valign == 'top') {
      cssStyle.top = '0px';
    } else if (valign == 'bottom') {
      cssStyle.bottom = '0px';
    } else {
      cssStyle.top = '50%';
      cssStyle.transform = 'translate(0,-50%)';
    }
    img.src = this._imageContent;
  }
}
