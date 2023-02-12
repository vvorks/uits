import Lottie, { RendererType } from 'lottie-web';
import type { UiApplication } from './UiApplication';
import { UiNode, UiNodeSetter } from './UiNode';

export class UiLottieNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiLottieNodeSetter();
}

export class UiLottieNode extends UiNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiLottieNode {
    return new UiLottieNode(this);
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
  constructor(src: UiLottieNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一引数
   * @param name 第二引数
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiLottieNode) {
      super(param as UiLottieNode);
      let src = param as UiLottieNode;
    } else {
      super(param as UiApplication, name as string);
    }
  }

  public getSetter(): UiLottieNodeSetter {
    return UiLottieNodeSetter.INSTANCE;
  }

  protected afterMount(): void {
    let dom = this.ensureDomElement() as HTMLElement;
    let type: RendererType = this.name.startsWith('svg') ? 'svg' : 'canvas'; //仮
    Lottie.loadAnimation({
      container: dom, // the dom element that will contain the animation
      renderer: type,
      loop: true,
      autoplay: true,
      path: 'data.json', // the path to the animation json
    });
  }
}
