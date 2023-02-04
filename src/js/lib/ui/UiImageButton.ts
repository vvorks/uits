import { KeyCodes } from './KeyCodes';
import type { UiApplication } from './UiApplication';
import { UiImageNode } from './UiImageNode';
import { UiNode, UiResult } from './UiNode';

export class UiImageButton extends UiImageNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiImageButton {
    return new UiImageButton(this);
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
  constructor(src: UiImageButton);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiImageButton) {
      super(param as UiImageButton);
    } else {
      super(param as UiApplication, name as string);
    }
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        result |= this.doAction();
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.doAction();
  }

  protected doAction(): UiResult {
    return this.fireActionEvent('click') | UiResult.CONSUMED;
  }
}
