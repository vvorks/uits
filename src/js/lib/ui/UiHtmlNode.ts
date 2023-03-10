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
    let xhtml = Values.asString(value);
    let parser = new DOMParser();
    let doc = parser.parseFromString('<doc>' + xhtml + '</doc>', 'application/xml');
    let safeHtml = this.toSafetyChildren(doc.firstChild as Node);
    return safeHtml;
  }

  private toSafetyChildren(node: Node): string {
    let b = '';
    let children = node.childNodes;
    let n = children.length;
    for (let i = 0; i < n; i++) {
      let c = children.item(i);
      b += this.toSafetyNode(c);
    }
    return b;
  }

  private toSafetyNode(node: Node): string {
    let b = '';
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        b += this.toSafetyElement(node as Element);
        break;
      case Node.TEXT_NODE:
        b += node.textContent;
        break;
      default:
        break;
    }
    return b;
  }

  private toSafetyElement(e: Element): string {
    let b = '';
    let ns = e.namespaceURI;
    let localName = e.localName;
    let tagName = e.tagName;
    //危険なタグの除去
    if (UiHtmlNode.TRIM_TAGS.indexOf(localName) >= 0) {
      return b;
    }
    b += '<';
    b += tagName;
    let attributes = e.attributes;
    let length = attributes.length;
    for (let i = 0; i < length; i++) {
      let key = attributes[i].name;
      if (!key.startsWith('on')) {
        let value = attributes[i].value;
        //危険な属性の除去
        if (value != null && !value.startsWith('javascript:')) {
          b += ` ${key}="${value}"`;
        }
      }
    }
    b += '>';
    b += this.toSafetyChildren(e);
    b += '</';
    b += tagName;
    b += '>';
    return b;
  }
}
