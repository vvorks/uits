import { CssLength } from './CssLength';
import { Scrollable } from './Scrollable';
import type { UiApplication } from './UiApplication';
import { UiIndicatorNode } from './UiIndicatorNode';
import { Size, UiNode, UiNodeSetter } from './UiNode';

/** 現在コンテンツを示すIndicatorの倍率 */
const CURRENT_WIDTH_RATIO = 3.0;

export class UiIndicatorListSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiIndicatorListSetter();
  public margin(value: Size): this {
    let node = this.node as UiIndicatorList;
    node.margin = value;
    return this;
  }
}

export class UiIndicatorList extends UiNode {
  public static readonly INDICATOR_NAME = 'indicator';

  private _currentIndex: number;

  private _currentTime: number;

  private _margin: CssLength;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiIndicatorList {
    return new UiIndicatorList(this);
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
  constructor(src: UiIndicatorList);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiIndicatorList) {
      super(param as UiIndicatorList);
      let src = param as UiIndicatorList;
      this._currentIndex = src._currentIndex;
      this._currentTime = src._currentTime;
      this._margin = src._margin;
    } else {
      super(param as UiApplication, name as string);
      this._currentIndex = 0;
      this._currentTime = 0;
      this._margin = CssLength.ZERO;
    }
  }

  public getSetter(): UiIndicatorListSetter {
    return UiIndicatorListSetter.INSTANCE;
  }

  /**
   *  マージン取得
   */
  public get margin(): string {
    return this._margin.toString();
  }

  /**
   * マージン設定
   */
  public set margin(arg: Size) {
    let value: CssLength = new CssLength(arg);
    if (!CssLength.equals(this._margin, value)) {
      this._margin = value;
      this.onContentChanged();
    }
  }

  /**
   * スタイル変更通知
   */
  protected onStyleChanged(): void {
    let indicatorStyle = this.style.getConditionalStyle('NAMED', UiIndicatorList.INDICATOR_NAME);
    let cStyle = indicatorStyle != null ? indicatorStyle : this.style;
    this._children.forEach((c) => (c.style = cStyle));
  }

  /**
   * コンテンツリストの変更を水平スクロールに見立てて受信
   *
   * @param source コンテンツリスト
   * @param offset 現在位置
   * @param limit 未使用
   * @param count コンテンツリスト数
   */
  public onHScroll(source: Scrollable, offset: number, limit: number, count: number): void {
    if (offset % limit != 0) {
      return;
    }
    offset %= count;
    let logicalIndex = offset / limit;
    let logicalCount = count / limit;
    let app = this.application;
    let childCount = this.getChildCount();
    if (childCount != logicalCount) {
      while (childCount < logicalCount) {
        let newChild = new UiIndicatorNode(app, `${childCount++}`);
        newChild.dataFieldName = UiIndicatorList.INDICATOR_NAME;
        newChild.style = this.style;
        this.appendChild(newChild);
      }
      while (logicalCount < childCount) {
        this.removeChildAt(--childCount);
      }
      this._currentIndex = logicalIndex;
      this.onContentChanged();
    } else if (this._currentIndex != logicalIndex) {
      this._currentIndex = logicalIndex;
      this.onContentChanged();
    }
  }

  /**
   * 対象コンテンツのシーク位置変更通知
   *
   * @param source コンテンツリスト
   * @param offset シーク位置（ミリ秒単位）
   * @param limit 未使用
   * @param count コンテンツ時間（ミリ秒単位）
   */
  public onTScroll(source: Scrollable, offset: number, limit: number, count: number): void {
    if (this._currentTime != offset) {
      this._currentTime = offset;
      for (let i = 0; i < this._children.length; i++) {
        let c = this._children[i] as UiIndicatorNode;
        if (i == this._currentIndex) {
          c.onTScroll(source, offset, limit, count);
        } else {
          c.onTScroll(source, 0, 0, 1);
        }
      }
    }
  }

  protected renderContent(): void {
    let count = this._children.length;
    if (count == 0) {
      return;
    }
    let width = this.innerWidth;
    let margin = this._margin.toPixel(() => width);
    let netWidth = width - margin * (count - 1);
    let div = count == 1 ? 1 : count - 1 + CURRENT_WIDTH_RATIO;
    let unitWidth = netWidth / div;
    let x = 0;
    for (let i = 0; i < count; i++) {
      let c = this._children[i] as UiIndicatorNode;
      let w = i == this._currentIndex ? unitWidth * CURRENT_WIDTH_RATIO : unitWidth;
      c.position(`${x}px`, '0px', null, '0px', `${w}px`, null);
      x += w + margin;
    }
  }

  /** 本ノードはpassiveであり、自らのscrollイベントは行わない */
  public fireVScroll(): void {}

  /** 本ノードはpassiveであり、自らのscrollイベントは行わない */
  public fireHScroll(): void {}

  /** 本ノードはpassiveであり、自らのscrollイベントは行わない */
  public fireTScroll(): void {}
}
