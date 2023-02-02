import { KeyCodes } from '~/lib/ui/KeyCodes';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

/**
 * テキストボタン
 */
export class UiTextButton extends UiTextNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiTextButton {
    return new UiTextButton(this);
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
  constructor(src: UiTextButton);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiTextButton) {
      super(param as UiTextButton);
    } else {
      super(param as UiApplication, name as string);
    }
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
      case KeyCodes.ENTER:
        result |= this.doAction();
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.doAction();
  }

  public doAction(): UiResult {
    this.fireActionEvent('click');
    return UiResult.EATEN;
  }
}
