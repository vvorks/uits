import { Asserts } from '../lang';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';
import { Flags, UiNode, UiNodeSetter, UiResult } from '~/lib/ui/UiNode';

export class UiScrollNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiScrollNodeSetter();
  public focusLock(on: boolean): this {
    let node = this.node as UiScrollNode;
    node.focusLock = on;
    return this;
  }
}

export class UiScrollNode extends UiNode implements HasSetter<UiScrollNodeSetter> {
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

  public getSetter(): UiScrollNodeSetter {
    return UiScrollNodeSetter.INSTANCE;
  }

  public get focusLock(): boolean {
    return this.getFlag(Flags.FOCUS_LOCK);
  }

  public set focusLock(on: boolean) {
    this.setFlag(Flags.FOCUS_LOCK, on);
  }

  protected afterMount(): void {
    let rect = this.getChildrenRect();
    this._lockX = rect.x;
    this._lockY = rect.y;
  }

  public scrollFor(target: UiNode, animationTime?: number): UiResult {
    Asserts.require(target.parent == this);
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
    let time = animationTime !== undefined ? animationTime : app.animationTime;
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
        return UiResult.AFFECTED | (step >= 1.0 ? UiResult.EXIT : 0);
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
