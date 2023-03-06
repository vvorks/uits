import type { UiApplication } from './UiApplication';
import { UiNode } from './UiNode';

/**
 * モデル上には存在するが、実際には表示されないUiNode
 *
 * 制御向けのUiNodeの基底クラスとして使用する。
 */
export class UiPhantomNode extends UiNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiPhantomNode {
    return new UiPhantomNode(this);
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
  constructor(src: UiPhantomNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiPhantomNode) {
      super(param as UiPhantomNode);
      let src = param as UiPhantomNode;
    } else {
      super(param as UiApplication, name as string);
    }
  }

  protected ensureDomElement(): HTMLElement | null {
    return null;
  }
}
