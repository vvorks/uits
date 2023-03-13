import { LayoutManager } from './LayoutManager';
import { UiNode, UiResult } from './UiNode';

export class BoxLayout implements LayoutManager {
  private _vertical: boolean;

  public constructor(vertical: boolean) {
    this._vertical = vertical;
  }

  public layout(node: UiNode): UiResult {
    if (this._vertical) {
      return this.layoutVertical(node);
    } else {
      return this.layoutHorizontal(node);
    }
  }

  protected layoutVertical(node: UiNode): UiResult {
    let y = 0;
    let result = UiResult.IGNORED;
    for (let c of node.getChildIf((e) => true)) {
      let rect = c.getRect();
      let newY = `${y}px`;
      if (c.top != newY) {
        c.top = newY;
        result |= UiResult.AFFECTED;
      }
      y += rect.height;
    }
    return result;
  }

  protected layoutHorizontal(node: UiNode): UiResult {
    let x = 0;
    let result = UiResult.IGNORED;
    for (let c of node.getChildIf((e) => e.visible)) {
      let rect = c.getRect();
      let newX = `${x}px`;
      if (c.left != newX) {
        c.left = newX;
        result |= UiResult.AFFECTED;
      }
      x += rect.width;
    }
    return result;
  }
}
