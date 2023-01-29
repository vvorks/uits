import { Asserts } from '~/lib/lang';
import { CssLength } from '~/lib/ui/CssLength';
import { Inset } from '~/lib/ui/Inset';
import { UiApplication } from '~/lib/ui/UiApplication';
import { UiLocation, UiNode, UiResult } from '~/lib/ui/UiNode';

export class UiPane extends UiNode {
  private _location: UiLocation;

  private _shrinkedSize: CssLength;

  private _expandedSize: CssLength;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiPane {
    return new UiPane(this);
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
  constructor(src: UiPane);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiPane) {
      super(param as UiPane);
      let src = param as UiPane;
      this._location = src._location;
      this._shrinkedSize = src._shrinkedSize;
      this._expandedSize = src._expandedSize;
    } else {
      super(param as UiApplication, name as string);
      this._location = 'center';
      this._shrinkedSize = new CssLength('0px');
      this._expandedSize = new CssLength('0px');
    }
  }

  public get location(): UiLocation {
    return this._location;
  }

  public set location(loc: UiLocation) {
    this._location = loc;
  }

  public get shrinkedSize(): string {
    return this._shrinkedSize.toString();
  }

  public get expandedSize(): string {
    return this._expandedSize.toString();
  }

  public get computedSize(): number {
    let size = this.isExpanded() ? this._expandedSize : this._shrinkedSize;
    return size.toPixel(() => this.parentSize);
  }

  public isExpanded(): boolean {
    let app = this.application;
    let focus = app.getFocusOf(this);
    return focus != null && this.isAncestorOf(focus);
  }

  protected get parentSize(): number {
    if (this._location == 'top' || this._location == 'bottom') {
      return (this.parent as UiNode).innerHeight;
    } else {
      return (this.parent as UiNode).innerWidth;
    }
  }

  public setFlexSize(shrinkedSize: string | number, expandedSize: string | number) {
    let shSize: CssLength = new CssLength(shrinkedSize);
    let exSize: CssLength = new CssLength(expandedSize);
    if (
      !CssLength.equals(this._shrinkedSize, shSize) ||
      !CssLength.equals(this._expandedSize, exSize)
    ) {
      this._shrinkedSize = shSize;
      this._expandedSize = exSize;
      this.onLocationChanged();
    }
  }
}

export class UiDock extends UiNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiDock {
    return new UiDock(this);
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
  constructor(src: UiDock);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiDock) {
      super(param as UiDock);
    } else {
      super(param as UiApplication, name as string);
    }
  }

  public insertChild(child: UiNode, after: UiNode | null): void {
    Asserts.require(child instanceof UiPane);
    super.insertChild(child, after);
  }

  public beforeMount(): void {
    this.relocatePane();
  }

  protected relocatePane(): void {
    let inset: Inset = new Inset(0, 0, 0, 0);
    for (let c of this._children) {
      let p = c as UiPane;
      let size = p.computedSize;
      switch (p.location) {
        case 'left':
          p.position(inset.left, inset.top, null, inset.bottom, size, null);
          inset.left += size;
          break;
        case 'right':
          p.position(null, inset.top, inset.right, inset.bottom, size, null);
          inset.right += size;
          break;
        case 'top':
          p.position(inset.left, inset.top, inset.right, null, null, size);
          inset.top += size;
          break;
        case 'bottom':
          p.position(inset.left, null, inset.right, inset.bottom, null, size);
          inset.bottom += size;
          break;
        case 'center':
          //do nothing here
          break;
      }
    }
    for (let c of this._children) {
      let p = c as UiPane;
      switch (p.location) {
        case 'center':
          p.position(inset.left, inset.top, inset.right, inset.bottom, null, null);
          break;
        default:
          break;
      }
    }
    this.fireActionEvent('relocatePane');
  }

  public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
    if (gained) {
      this.relocatePane();
    }
    return super.onFocus(target, gained, other);
  }
}
