import { CssLength } from './CssLength';
import { Scrollable } from './Scrollable';
import type { UiApplication } from './UiApplication';
import { UiIndicatorNode } from './UiIndicatorNode';
import { Flags, Size, UiNode, UiNodeSetter, UiResult } from './UiNode';

/** 現在コンテンツを示すIndicatorの倍率既定値 */
const DEFAULT_ZOOM_RATIO = 2.0;

export class UiIndicatorListSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiIndicatorListSetter();
  public margin(value: Size): this {
    let node = this.node as UiIndicatorList;
    node.margin = value;
    return this;
  }
  public zoomRatio(ratio: number): this {
    let node = this.node as UiIndicatorList;
    node.zoomRatio = ratio;
    return this;
  }
  public outerMargin(on: boolean): this {
    let node = this.node as UiIndicatorList;
    node.outerMargin = on;
    return this;
  }
}

export class UiIndicatorList extends UiNode {
  public static readonly INDICATOR_NAME = 'indicator';

  /** 現在拡大表示中のIndicator Index */
  private _currentIndex: number;

  /** 直前に拡大表示中だったIndicatorのIndex */
  private _previousIndex: number;

  /** 現在拡大表示中のシーク時間 */
  private _currentTime: number;

  /** Indicator間の余白 */
  private _margin: CssLength;

  /** 拡大表示比率 */
  private _zoomRatio: number;

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
      this._previousIndex = src._previousIndex;
      this._currentTime = src._currentTime;
      this._margin = src._margin;
      this._zoomRatio = src._zoomRatio;
    } else {
      super(param as UiApplication, name as string);
      this._currentIndex = 0;
      this._previousIndex = 0;
      this._currentTime = 0;
      this._margin = CssLength.ZERO;
      this._zoomRatio = DEFAULT_ZOOM_RATIO;
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
   *  ズーム比率取得
   */
  public get zoomRatio(): number {
    return this._zoomRatio;
  }

  /**
   * ズーム比率設定
   */
  public set zoomRatio(ratio: number) {
    if (this._zoomRatio != ratio) {
      this._zoomRatio = ratio;
      this.onContentChanged();
    }
  }

  public get outerMargin(): boolean {
    return this.getFlag(Flags.OUTER_MARGIN);
  }

  public set outerMargin(on: boolean) {
    this.setFlag(Flags.OUTER_MARGIN, on);
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
    let logicalIndex = Math.floor((offset * 1) / limit);
    let logicalCount = Math.floor((count * 1) / limit);
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
      this._previousIndex = logicalIndex;
      this._currentIndex = logicalIndex;
      this.resetIndicator();
      this.onContentChanged();
    } else if (this._currentIndex != logicalIndex) {
      this._previousIndex = this._currentIndex;
      this._currentIndex = logicalIndex;
      this.resetIndicator();
      this.onContentChanged();
    }
  }

  private resetIndicator(): void {
    for (let i = 0; i < this._children.length; i++) {
      let c = this._children[i] as UiIndicatorNode;
      c.onTScroll(c, 0, 0, 1);
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
    const count = this._children.length;
    if (count == 0) {
      return;
    }
    const app = this.application;
    const time = app.animationTime;
    const width = this.innerWidth;
    const margin = this._margin.toPixel(() => width);
    const netWidth = width - margin * (count + (this.outerMargin ? +1 : -1));
    const div = count == 1 ? 1 : count + (this._zoomRatio - 1);
    const unitWidth = Math.floor(netWidth / div);
    const fullExt = netWidth - unitWidth * count;
    const outerMarginPx = this.outerMargin ? margin : 0;
    if (this._previousIndex == this._currentIndex || time == 0) {
      let x = this.outerMargin ? margin : 0;
      for (let i = 0; i < count; i++) {
        let c = this._children[i] as UiIndicatorNode;
        let w = unitWidth + (i == this._currentIndex ? fullExt : 0);
        c.position(`${x}px`, `${outerMarginPx}px`, null, `${outerMarginPx}px`, `${w}px`, null);
        x += w + margin;
      }
    } else {
      app.runAnimation(this, 1, time, false, (step: number) => {
        let ratio = Math.min(Math.max(0, step), 1);
        let currExt = fullExt * ratio;
        let prevExt = fullExt - currExt;
        let x = this.outerMargin ? margin : 0;
        for (let i = 0; i < count; i++) {
          let c = this._children[i] as UiIndicatorNode;
          let w = unitWidth;
          w += i == this._currentIndex ? currExt : 0;
          w += i == this._previousIndex ? prevExt : 0;
          c.position(`${x}px`, `${outerMarginPx}px`, null, `${outerMarginPx}px`, `${w}px`, null);
          x += w + margin;
        }
        return UiResult.AFFECTED;
      });
    }
  }

  /** 本ノードはpassiveであり、自らのscrollイベントは行わない */
  public fireVScroll(): void {}

  /** 本ノードはpassiveであり、自らのscrollイベントは行わない */
  public fireHScroll(): void {}

  /** 本ノードはpassiveであり、自らのscrollイベントは行わない */
  public fireTScroll(): void {}
}
