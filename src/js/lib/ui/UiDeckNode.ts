import { Arrays, Asserts, Logs, Properties } from '~/lib/lang';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { UiNode, UiResult } from '~/lib/ui/UiNode';

export class UiDeckNode extends UiNode {
  private _selected: string | null;
  private _selectedBefore: string | null;
  private _backNode: UiNode | null;
  private _savedFocusNodes: Properties<UiNode>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiDeckNode {
    return new UiDeckNode(this);
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
  constructor(src: UiDeckNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiDeckNode) {
      super(param as UiDeckNode);
      let src = param as UiDeckNode;
      this._selected = src._selected;
      this._selectedBefore = src._selectedBefore;
      this._backNode = src._backNode;
      this._savedFocusNodes = {};
    } else {
      super(param as UiApplication, name as string);
      this._selected = null;
      this._selectedBefore = null;
      this._backNode = null;
      this._savedFocusNodes = {};
    }
  }

  protected afterMount(): void {
    this.initSavedFocusNodes();
    if (this._selected == null && this._children.length > 0) {
      this.hidePieces();
      let piece = this._children[0];
      this.select(piece.name);
    }
  }

  private initSavedFocusNodes(): void {
    let app = this.application;
    for (let piece of this._children) {
      let list = piece.getDescendantsIf((e) => app.isAppearedFocusable(e), 1);
      if (list.length > 0) {
        this._savedFocusNodes[piece.name] = list[0];
      }
    }
  }

  private hidePieces(): void {
    for (let piece of this._children) {
      piece.visible = false;
    }
  }

  /**
   * piece切り替え
   *
   * @param name piece名
   */
  public select(name: string): void {
    if (this._selected == name) {
      return;
    }
    let app = this.application;
    let focusNode = app.getFocusOf(this);
    let focusLost = false;
    for (let piece of this._children) {
      if (piece.name == name) {
        piece.visible = true;
      } else if (piece.visible) {
        if (focusNode != null && piece.isAncestorOf(focusNode)) {
          this._savedFocusNodes[piece.name] = focusNode;
          focusLost = true;
        }
        piece.visible = false;
      }
    }
    if (focusLost) {
      let saved = this._savedFocusNodes[name];
      if (saved !== undefined) {
        app.setFocus(saved);
      }
    }
    this._selected = name;
  }

  public selectWithBack(name: string, backNode: UiNode | null): void {
    if (this._selected == name) {
      return;
    }
    this.select(name);
    this._backNode = backNode;
  }

  /**
   * このDeckNodeにFocusが当たる場合の処理
   *
   * @param prev 以前のfocus node
   * @returns 補正されたフォーカス候補ノード
   */
  public adjustFocus(prev: UiNode, key: number): UiNode {
    Logs.debug('adjustFocus');
    Asserts.assume(this._selected != null);
    {
      let saved = this._savedFocusNodes[this._selected];
      if (saved !== undefined) {
        this._selectedBefore = null;
        return saved;
      }
    }
    for (let piece of this._children) {
      let saved = this._savedFocusNodes[piece.name];
      if (saved !== undefined) {
        this._selectedBefore = null;
        return saved;
      }
    }
    return this;
  }

  public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
    let result = UiResult.IGNORED;
    if (gained) {
      let piece = Arrays.first(target.getAncestorsIf((e) => e.parent == this, 1));
      if (piece != null) {
        //TODO 様子見。問題なければ _selectedBeforeフィールドを削除
        //this._selectedBefore = this._selected;
        // DeckNode内子ノードでの画面切り替え時は select()を実行しない
        if (
          piece.name != this._selected &&
          (other == null || other.getLucaNodeWith(target) != this)
        ) {
          this.select(piece.name);
        }
        result |= UiResult.AFFECTED;
      }
    } else {
      this.saveFocusInSelected();
      if (this._backNode != null) {
        // DeckNode内子ノードでの画面切り替え時は フォーカス処理をしない
        if (this._backNode != other && (other == null || other.getLucaNodeWith(target) != this)) {
          //TODO otherとbackNodeの方向まで確認するべき？
          this.application.postResetFocus(this._backNode);
          this._backNode = null;
        }
      }
      if (this._selectedBefore != null) {
        this.select(this._selectedBefore);
        this._selectedBefore = null;
        result |= UiResult.AFFECTED;
      }
    }
    return result | super.onFocus(target, gained, other);
  }

  private saveFocusInSelected(): void {
    Asserts.assume(this._selected != null);
    let app = this.application;
    let focusNode = app.getFocusOf(this);
    if (focusNode != null) {
      this._savedFocusNodes[this._selected] = focusNode;
    }
  }
}
