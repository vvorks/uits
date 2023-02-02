import type { UiApplication } from './UiApplication';
import { UiNode } from './UiNode';

export class UiVideo extends UiNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiVideo {
    return new UiVideo(this);
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
  constructor(src: UiVideo);

  /**
   * コンストラクタ実装
   *
   * @param param 第一引数
   * @param name 第二引数
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiVideo) {
      super(param as UiVideo);
      let src = param as UiVideo;
    } else {
      super(param as UiApplication, name as string);
    }
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement {
    let video = document.createElement('video');
    return video;
  }
}
