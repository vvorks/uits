import { Logs } from '../lang';
import { UiApplication } from './UiApplication';
import { UiNode, UiResult } from './UiNode';

export class UiScrollNode extends UiNode {
  public clone(): UiScrollNode {
    return new UiScrollNode(this);
  }

  constructor(app: UiApplication, name: string);
  constructor(src: UiScrollNode);

  public constructor(param: any, name?: string) {
    if (param instanceof UiScrollNode) {
      super(param as UiScrollNode);
    } else {
      super(param as UiApplication, name as string);
    }
  }

  public scrollFor(prev: UiNode | null, target: UiNode, animationTime?: number): UiResult {
    Logs.debug(
      'scrollFor %s -> %s ON %s lock %s',
      prev == null ? 'null' : prev.getNodePath(),
      target.getNodePath(),
      this.getNodePath(),
      this.focusLock
    );
    if (!this.isAncestorOf(target)) {
      return UiResult.IGNORED;
    }
    let result: UiResult = UiResult.IGNORED;
    if (this.focusLock && prev != null) {
      result = this.scrollWithFocusLock(prev, target, animationTime);
    } else {
      result = this.scrollIfNecessary(prev, target, animationTime);
    }
    return result;
  }

  scrollWithFocusLock(prev: UiNode, target: UiNode, animationTime?: number): UiResult {
    Logs.debug('scrollWithFocusLock');
    let curr: UiNode | null = prev;
    while (curr != null && curr.parent != this) {
      curr = curr.parent;
    }
    if (curr == null) {
      return this.scrollIfNecessary(prev, target, animationTime);
    }
    let r1 = curr.getRect();
    let r2 = target.getRect();
    let rs = this.getScrollRect();
    Logs.debug(
      'curr %s:%s next %s:%s scroll %s',
      curr.getNodePath(),
      r1.toString(),
      target.getNodePath(),
      r2.toString(),
      rs.toString()
    );
    let dx = r2.x - r1.x;
    let dy = r2.y - r1.y;
    if (dx < 0) {
      Logs.debug('move right');
      //move right
    } else if (dx > 0) {
      //move left
      Logs.debug('move left');
    }
    if (dy < 0) {
      //move top
      Logs.debug('move top');
    } else if (dy > 0) {
      //move bottom
      Logs.debug('move bottom');
      rs.y;
    }
    //仮に現状通りで動かす
    return this.scrollIfNecessary(prev, target, animationTime);
  }

  private scrollIfNecessary(prev: UiNode | null, target: UiNode, animationTime?: number): UiResult {
    if (!this.isAncestorOf(target)) {
      return UiResult.IGNORED;
    }
    let result: UiResult = UiResult.IGNORED;
    let r = target.getWrappedRectOn(this);
    let s = this.getViewRect();
    let dx: number;
    let dy: number;
    if (r.left < s.left) {
      dx = -(s.left - r.left);
    } else if (r.right > s.right) {
      dx = +(r.right - s.right);
    } else {
      dx = 0;
    }
    if (r.top < s.top) {
      dy = -(s.top - r.top);
    } else if (r.bottom > s.bottom) {
      dy = +(r.bottom - s.bottom);
    } else {
      dy = 0;
    }
    if (dx != 0 || dy != 0) {
      result |= this.scrollInside(dx, dy, animationTime);
    }
    return result;
  }

  protected scrollInside(dx: number, dy: number, animationTime?: number): UiResult {
    Logs.debug('scrollInside x=%d, y=%d', dx, dy);
    let app = this.application;
    let time = animationTime !== undefined ? animationTime : app.scrollAnimationTime;
    let s = this.getViewRect();
    let result;
    if (time == 0) {
      this.setScroll(s.left + dx, s.top + dy, 1.0);
      result = UiResult.AFFECTED;
    } else {
      app.runAnimation(this, 1, time, false, (step: number) => {
        let sx = s.left + dx * Math.min(step, 1.0);
        let sy = s.top + dy * Math.min(step, 1.0);
        this.setScroll(sx, sy, step);
        return step >= 1.0 ? UiResult.EXIT : UiResult.EATEN;
      });
      result = UiResult.IGNORED;
    }
    return result;
  }

  protected setScroll(x: number, y: number, step: number): void {
    this.scrollLeft = `${x}px`;
    this.scrollTop = `${y}px`;
    if (step >= 1.0) {
      this.application.updateAxis(this);
    }
  }
}
