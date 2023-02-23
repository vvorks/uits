import { Asserts, Logs, Value, Values } from '../lang';
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

  // prettier-ignore
  public static readonly SAFE_HTML_TAGS = [
    "h1", "h2", "h3", "h4", "h5", "h6", "hr", "p", "div", "pre", "blockquote",
    "em", "strong", "small", "q", "dfn", "abbr", "samp", "kbd", "sub", "sup",
    "img", "i", "b", "ruby", "rt", "rp", "span", "br", "wbr", "ins", "del",
    "ol", "ul", "li", "dl", "dt", "dd",
    "table", "caption", "colgroup", "col", "tbody", "thead", "tfoot", "tr", "td", "th",
  ];

  // prettier-ignore
  public static readonly SAFE_SVG_TAGS = [
    "svg",
    "circle", "ellipse", "g", "line", "path", "polygon", "polyline", "rect",
    "text", "textPath", "image"
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
      Asserts.require(this.checkSafety(value));
      this._htmlContent = value;
      this.onContentChanged();
    }
  }

  private checkSafety(value: Value): boolean {
    if (value == null) {
      return true;
    }
    let str = Values.asString(value);
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return this.checkSafetyChildren(doc.body);
  }

  private checkSafetyNode(node: Node): boolean {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        return this.checkSafetyElement(node as Element);
      case Node.TEXT_NODE:
        return true;
      default:
        Logs.error('error %d', node.nodeType);
        return false;
    }
  }

  private checkSafetyElement(e: Element): boolean {
    let ns = e.namespaceURI;
    let localName = e.localName;
    if (ns == UiHtmlNode.HTML_NS) {
      if (UiHtmlNode.SAFE_HTML_TAGS.indexOf(localName) == -1) {
        Logs.error('error %s %s', ns, localName);
        return false;
      }
    } else if (ns == UiHtmlNode.SVG_NS) {
      if (UiHtmlNode.SAFE_SVG_TAGS.indexOf(localName) == -1) {
        Logs.error('error %s %s', ns, localName);
        return false;
      }
    }
    return this.checkSafetyChildren(e);
  }

  private checkSafetyChildren(e: Element): boolean {
    let children = e.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (!this.checkSafetyNode(children.item(i))) {
        return false;
      }
    }
    return true;
  }

  protected renderContent(): void {
    let dom = this.domElement as HTMLElement;
    let html = this._htmlContent != null ? Values.asString(this._htmlContent) : '';
    dom.innerHTML = html;
  }
}
