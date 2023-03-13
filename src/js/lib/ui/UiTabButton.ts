import { HasSetter } from './UiBuilder';
import { UiDeckNode } from './UiDeckNode';
import { UiNode, UiResult } from './UiNode';
import { UiTextButton } from './UiTextButton';
import { UiTextNodeSetter } from './UiTextNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

export class UiTabButtonSetter extends UiTextNodeSetter {
  public static readonly INSTANCE = new UiTabButtonSetter();

  public tabContent(title: string, selectNode: string) {
    let node = this.node as UiTabButton;
    node.textContent = title;
    node.selectNode = selectNode;
    return this;
  }
}

/**
 * タブボタン
 */
export class UiTabButton extends UiTextButton implements HasSetter<UiTabButtonSetter> {
  private _selectNode: any;
  private _actionEventFiring: boolean;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiTabButton {
    return new UiTabButton(this);
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
  constructor(src: UiTabButton);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiTabButton) {
      super(param as UiTabButton);
      let src = param as UiTabButton;
      this._selectNode = src._selectNode;
      this._actionEventFiring = false;
    } else {
      super(param as UiApplication, name as string);
      this._selectNode = null;
      this._actionEventFiring = false;
    }
  }

  public getSetter(): UiTabButtonSetter {
    return UiTabButtonSetter.INSTANCE;
  }

  public set selectNode(value: any) {
    if (this._selectNode != value) {
      this._selectNode = value;
    }
  }

  public get selectNode() {
    return this._selectNode;
  }

  public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
    if (gained) {
      let piece = this.findNodeByPath(this._selectNode);
      while (piece != null && !(piece.parent instanceof UiDeckNode)) {
        piece = piece.parent;
      }
      if (piece != null && piece.parent instanceof UiDeckNode) {
        piece.parent.selectWithBack(piece.name, this);
      }
    } else {
      if (this._actionEventFiring) {
        this._actionEventFiring = false;
      } else if (
        other != null &&
        other.getAncestorsIf((e) => e instanceof UiDeckNode, 1).length > 0
      ) {
        let piece = this.findNodeByPath(this._selectNode);
        if (piece != null) {
          this.application.requestFocus(piece);
        }
      }
    }
    return UiResult.EATEN;
  }

  protected doAction(): UiResult {
    if (!this.hasActionListener()) {
      let piece = this.findNodeByPath(this._selectNode);
      if (piece != null && piece.getAncestorsIf((e) => e instanceof UiDeckNode, 1).length > 0) {
        this._actionEventFiring = true;
        this.application.resetFocus(piece);
      }
    }
    return this.fireActionEvent('click') | UiResult.EATEN;
  }
}
