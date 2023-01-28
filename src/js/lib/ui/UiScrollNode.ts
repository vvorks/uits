import { Logs, ParamError } from '../lang';
import { UiApplication } from './UiApplication';
import { UiNode, UiResult } from './UiNode';

export class UiScrollNode extends UiNode {
  private _lockX: number;

  private _lockY: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiScrollNode {
    return new UiScrollNode(this);
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
  constructor(src: UiScrollNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一引数
   * @param name 第二引数
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiScrollNode) {
      super(param as UiScrollNode);
      let src = param as UiScrollNode;
      this._lockX = src._lockX;
      this._lockY = src._lockY;
    } else {
      super(param as UiApplication, name as string);
      this._lockX = 0;
      this._lockY = 0;
    }
  }

  protected afterMount(): void {
    let rect = this.getChildrenRect();
    this._lockX = rect.x;
    this._lockY = rect.y;
  }

  public scrollFor(target: UiNode, animationTime?: number): UiResult {
    if (target.parent != this) {
      throw new ParamError();
    }
    let result: UiResult = UiResult.IGNORED;
    if (!this.focusLock) {
      result = this.scrollIfNecessary(target, animationTime);
    } else {
      result = this.scrollWithFocusLock(target, animationTime);
    }
    return result;
  }

  protected scrollIfNecessary(target: UiNode, animationTime?: number): UiResult {
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

  protected scrollWithFocusLock(target: UiNode, animationTime?: number): UiResult {
    let result = UiResult.IGNORED;
    let rs = this.getScrollRect();
    let rt = target.getRect();
    let nx = rt.x - this._lockX;
    let ny = rt.y - this._lockY;
    let dx = Math.min(Math.max(0, nx), rs.width - this.innerWidth) - rs.x;
    let dy = Math.min(Math.max(0, ny), rs.height - this.innerHeight) - rs.y;
    if (dx != 0 || dy != 0) {
      result = this.scrollInside(dx, dy, animationTime);
    }
    return result;
  }

  protected scrollInside(dx: number, dy: number, animationTime?: number): UiResult {
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
