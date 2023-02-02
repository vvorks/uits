import { Properties } from '~/lib/lang';
import { Scrollable } from '~/lib/ui/Scrollable';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { Changed, UiNode, UiNodeSetter } from '~/lib/ui/UiNode';
import { UiStyle } from '~/lib/ui/UiStyle';
import { HistoryState } from '~/lib/ui/HistoryManager';
import { HasSetter } from '~/lib/ui/UiBuilder';

const PARAM_SAVED_FOCUS = '__SAVED_FOCUS__';

export class UiPageNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiPageNodeSetter();
}

export class UiPageNode extends UiNode implements HasSetter<UiPageNodeSetter> {
  private _hScrollables: Properties<Scrollable[]>;

  private _vScrollables: Properties<Scrollable[]>;

  private _lastHistoryState: HistoryState | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiPageNode {
    return new UiPageNode(this);
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
  constructor(src: UiPageNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiPageNode) {
      super(param as UiPageNode);
      let src = param as UiPageNode;
      this._lastHistoryState = src._lastHistoryState;
    } else {
      super(param as UiApplication, name as string);
      this._lastHistoryState = null;
    }
    this._hScrollables = {};
    this._vScrollables = {};
  }

  public getSetter(): UiPageNodeSetter {
    return UiPageNodeSetter.INSTANCE;
  }

  public getHistoryState(): HistoryState {
    let state: HistoryState = new HistoryState(this.name, {});
    let app = this.application;
    let focus = app.getFocusOf(this);
    if (focus != null) {
      let nodePath = focus.getNodePath();
      state.arguments[PARAM_SAVED_FOCUS] = nodePath;
    }
    return state;
  }

  public setHistoryState(state: HistoryState): void {
    let app = this.application;
    let nodePath = state.arguments[PARAM_SAVED_FOCUS];
    if (nodePath !== undefined) {
      let focus = this.findNodeByPath(nodePath);
      if (focus != null) {
        app.scrollFor(focus, 0);
        app.setFocus(focus);
      }
    }
    this._lastHistoryState = state;
  }

  public setHistoryStateAgain(): void {
    if (this._lastHistoryState != null) {
      this.setHistoryState(this._lastHistoryState);
    }
  }

  public getPageNode(): UiPageNode | null {
    return this;
  }

  protected afterMount(): void {
    this.initScroll(this._hScrollables, (s) => s.fireHScroll());
    this.initScroll(this._vScrollables, (s) => s.fireVScroll());
    this.setChanged(Changed.STYLE, true);
    this.resetFocus();
  }

  private initScroll(prop: Properties<Scrollable[]>, func: (s: Scrollable) => void) {
    for (const [k, v] of Object.entries(prop)) {
      let s = v as Scrollable[];
      if (s.length > 1) {
        func(s[0]);
      }
    }
  }

  protected resetFocus(): void {}

  public onUnmount(): void {
    super.onUnmount();
    this.clearStyle();
  }

  protected syncStyle(): void {
    if (!this.isChanged(Changed.STYLE)) {
      return;
    }
    let sb = '';
    let prefix = this.className + this.id + '_';
    let styles: UiStyle[] = Array.from(this.collectStyle(prefix, new Set<UiStyle>()));
    sb = '';
    for (let s of styles) {
      sb += '.' + prefix + s.id + ' ' + s.toCssString() + '\n';
    }
    this.setStyleNode(prefix + 'style', sb);
    this.setChanged(Changed.STYLE, false);
  }

  protected clearStyle(): void {
    let prefix = this.className + this.id + '_';
    let nodeId = prefix + 'style';
    let node = document.getElementById(nodeId);
    if (node != null && node.parentElement != null) {
      node.parentElement.removeChild(node);
    }
  }

  public attachHScroll(name: string, scrollable: Scrollable): void {
    this.attachScroll(this._hScrollables, name, scrollable);
  }

  public detachHScroll(name: string, scrollable: Scrollable): void {
    this.detachScroll(this._hScrollables, name, scrollable);
  }

  public attachVScroll(name: string, scrollable: Scrollable): void {
    this.attachScroll(this._vScrollables, name, scrollable);
  }

  public detachVScroll(name: string, scrollable: Scrollable): void {
    this.detachScroll(this._vScrollables, name, scrollable);
  }

  private attachScroll(prop: Properties<Scrollable[]>, name: string, scrollable: Scrollable): void {
    let array = prop[name];
    if (array !== undefined) {
      let index = array.indexOf(scrollable);
      if (index == -1) {
        array.push(scrollable);
      }
    } else {
      array = [];
      prop[name] = array;
      array.push(scrollable);
    }
  }

  private detachScroll(prop: Properties<Scrollable[]>, name: string, scrollable: Scrollable): void {
    let array = prop[name];
    if (array !== undefined) {
      let index = array.indexOf(scrollable);
      if (index != -1) {
        array.splice(index, 1);
      }
    }
  }

  public dispatchHScroll(
    name: string,
    source: Scrollable,
    offset: number,
    limit: number,
    count: number
  ) {
    let array = this._hScrollables[name];
    if (array !== undefined) {
      for (let s of array) {
        if (s != source) {
          s.onHScroll(source, offset, limit, count);
        }
      }
    }
  }

  public dispatchVScroll(
    name: string,
    source: Scrollable,
    offset: number,
    limit: number,
    count: number
  ) {
    let array = this._vScrollables[name];
    if (array !== undefined) {
      for (let s of array) {
        if (s != source) {
          s.onVScroll(source, offset, limit, count);
        }
      }
    }
  }
}
