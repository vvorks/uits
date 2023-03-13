import { Logs } from '../lang';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';

export class UiBlankPageNode extends UiPageNode {
  protected initialize(): void {
    this.position('0px', '0px', '0px', '0px', null, null);
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    Logs.info('IGNORE KeyDown');
    return UiResult.CONSUMED;
  }

  public onKeyPress(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    Logs.info('IGNORE KeyPress');
    return UiResult.CONSUMED;
  }

  public onKeyUp(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    Logs.info('IGNORE KeyUp');
    return UiResult.CONSUMED;
  }

  public onMouseMove(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return UiResult.CONSUMED;
  }

  public onMouseDown(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    Logs.info('IGNORE MouseDown');
    return UiResult.CONSUMED;
  }

  public onMouseUp(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    Logs.info('IGNORE MouseUp');
    return UiResult.CONSUMED;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    Logs.info('IGNORE MouseClick');
    return UiResult.CONSUMED;
  }

  public onMouseDoubleClick(
    target: UiNode,
    x: number,
    y: number,
    mod: number,
    at: number
  ): UiResult {
    Logs.info('IGNORE MouseDoubleClick');
    return UiResult.CONSUMED;
  }

  public onMouseWheel(
    target: UiNode,
    x: number,
    y: number,
    dx: number,
    dy: number,
    mod: number,
    at: number
  ): UiResult {
    Logs.info('IGNORE MouseWheel');
    return UiResult.CONSUMED;
  }
}
