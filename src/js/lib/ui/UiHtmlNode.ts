import { Value, Values } from '../lang';
import type { UiApplication } from './UiApplication';
import { HasSetter } from './UiBuilder';
import { UiNode, UiNodeSetter } from './UiNode';

export class UiHtmlNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiHtmlNodeSetter();
  public htmlContent(value: Value): this {
    let node = this.node as UiHtmlNode;
    node.htmlContent = value;
    return this;
  }
}

export class UiHtmlNode extends UiNode implements HasSetter<UiHtmlNodeSetter> {
  public static readonly HTML_NS = 'http://www.w3.org/1999/xhtml';

  public static readonly SVG_NS = 'http://www.w3.org/2000/svg';

  public static readonly TRIM_TAGS = [
    'html',
    'head',
    'meta',
    'script',
    'body',
    'iframe',
    'plaintext',
    'xmp',
    'form',
  ];

  private _htmlContent: Value;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiHtmlNode {
    return new UiHtmlNode(this);
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
   * @param src コピー元オブジェクト
   */
  constructor(src: UiHtmlNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一引数
   * @param name 第二引数
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiHtmlNode) {
      super(param as UiHtmlNode);
      let src = param as UiHtmlNode;
      this._htmlContent = src._htmlContent;
    } else {
      super(param as UiApplication, name as string);
      this._htmlContent = null;
    }
  }

  public getSetter(): UiHtmlNodeSetter {
    return UiHtmlNodeSetter.INSTANCE;
  }

  public get htmlContent(): Value {
    return this._htmlContent;
  }

  public set htmlContent(value: Value) {
    if (this._htmlContent != value) {
      this._htmlContent = this.toSafety(value);
      this.onContentChanged();
    }
  }
  protected renderContent(): void {
    let dom = this.domElement as HTMLElement;
    let html = this._htmlContent != null ? Values.asString(this._htmlContent) : '';
    dom.innerHTML = html;
  }

  private toSafety(value: Value): Value {
    if (value == null) {
      return value;
    }
    let str = Values.asString(value);
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    let body = doc.body;
    this.toSafetyChildren(body);
    return body.innerHTML;
  }

  private toSafetyChildren(e: Element): void {
    let children = e.childNodes;
    let n = children.length;
    for (let i = n - 1; i >= 0; i--) {
      let c = children.item(i);
      if (!this.toSafetyNode(c)) {
        c.remove();
      }
    }
  }

  private toSafetyNode(node: Node): boolean {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        return this.toSafetyElement(node as Element);
      case Node.TEXT_NODE:
        return true;
      default:
        return false;
    }
  }

  private toSafetyElement(e: Element): boolean {
    let ns = e.namespaceURI;
    let localName = e.localName;
    if (ns == UiHtmlNode.HTML_NS || ns == UiHtmlNode.SVG_NS) {
      if (UiHtmlNode.TRIM_TAGS.indexOf(localName) >= 0) {
        return false;
      }
      if (!this.toSafetyAttributes(e)) {
        return false;
      }
      this.toSafetyChildren(e);
      return true;
    } else {
      return false;
    }
  }

  private toSafetyAttributes(e: Element): boolean {
    for (let key of e.getAttributeNames()) {
      if (key.startsWith('on')) {
        e.removeAttribute(key);
      } else {
        let value = e.getAttribute(key);
        if (value != null && value.startsWith('javascript:')) {
          e.removeAttribute(key);
        }
      }
    }
    return true;
  }
}
