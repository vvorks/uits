import { KeyCodes } from '~/lib/ui/KeyCodes';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';

/**
 * テキストボタン
 */
export class UiTextButton extends UiTextNode {
  public clone(): UiTextButton {
    return new UiTextButton(this);
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
