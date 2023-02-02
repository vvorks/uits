import { Rect } from '~/lib/ui/Rect';
import { Changed, UiNode } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

export class UiRootNode extends UiNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiRootNode {
    return new UiRootNode(this);
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
  constructor(src: UiRootNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiRootNode) {
      super(param as UiRootNode);
    } else {
      super(param as UiApplication, name as string);
    }
  }

  public getPageNode(): UiPageNode | null {
    return null;
  }

  protected calcRect(): Rect {
    let rect = new Rect();
    rect.locate(0, 0, this.application.clientWidth, this.application.clientHeight);
    return rect;
  }

  public get innerWidth(): number {
    return this.application.clientWidth;
  }

  public get innerHeight(): number {
    return this.application.clientHeight;
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement {
    return target == this ? this.application.rootElement : document.createElement(tag);
  }

  protected getWrappedRect(): Rect {
    return new Rect(this.getRect());
  }

  protected syncStyle(): void {
    if (!this.isChanged(Changed.STYLE)) {
      return;
    }
    let sb = '';
    sb += 'BODY {user-select:none;}\n';
    sb += 'BODY,DIV {';
    sb += 'box-sizing:border-box;';
    sb += 'margin:auto;';
    sb += 'border-width:0px;';
    sb += 'padding:0px;';
    sb += 'overflow:hidden;';
    sb += 'border-style:solid;';
    sb += '}\n';
    this.setStyleNode('COMMON', sb);
    this.setChanged(Changed.STYLE, false);
  }

  protected syncStyleClass(): void {
    return;
  }

  protected syncHierarchy(): void {
    this.setChanged(Changed.HIERARCHY, false);
  }
}
