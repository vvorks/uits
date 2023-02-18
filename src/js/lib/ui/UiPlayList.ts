import { DataRecord, DataSource } from './DataSource';
import type { UiApplication } from './UiApplication';
import { UiNode, UiResult } from './UiNode';
import { UiPageNode } from './UiPageNode';

export class UiPlayList extends UiNode {
  private _dataSource: DataSource | null;

  private _playingIndex: number;

  private _currentTime: number;

  private _lastTime: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiPlayList {
    return new UiPlayList(this);
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
  constructor(src: UiPlayList);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiPlayList) {
      super(param as UiPlayList);
      let src = param as UiPlayList;
      this._dataSource = src._dataSource;
      this._playingIndex = src._playingIndex;
      this._currentTime = src._currentTime;
      this._lastTime = src._lastTime;
    } else {
      super(param as UiApplication, name as string);
      this._dataSource = null;
      this._playingIndex = 0;
      this._currentTime = 0;
      this._lastTime = 0;
    }
  }

  public count(): number {
    return this._dataSource != null ? this._dataSource.count() : -1;
  }

  public getRecord(index: number): DataRecord | null {
    return this._dataSource != null ? this._dataSource.getRecord(index) : null;
  }

  protected afterMount(): void {
    let app = this.application;
    app.runAnimation(this, 1, 0, true, (t) => {
      let result = UiResult.IGNORED;
      if (this._dataSource != null) {
        result = this.simulateTick(t);
      }
      return result;
    });
  }
  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    if (tag != this.dataSourceName) {
      return UiResult.IGNORED;
    }
    if (this.count() < 0) {
      this._dataSource = ds;
      this._playingIndex = ds.attention();
    } else {
      this._playingIndex = Math.max(Math.min(this._playingIndex, ds.count() - 1), 0);
    }
    this._currentTime = 0;
    this._lastTime = 0;
    return UiResult.AFFECTED;
  }

  private simulateTick(t: number): UiResult {
    let result = UiResult.IGNORED;
    let page = this.getPageNode() as UiPageNode;
    let now = t;
    if (this._lastTime == 0) {
      this._lastTime = now;
    }
    let delta = now - this._lastTime;
    let rec = this.getRecord(this._playingIndex) as DataRecord;
    this._currentTime += delta;
    let duration = rec['duration'] as number;
    let lap = this._currentTime >= duration;
    if (lap) {
      this._playingIndex = (this._playingIndex + 1) % this.count();
      rec = this.getRecord(this._playingIndex) as DataRecord;
      duration = rec['duration'] as number;
      this._currentTime = 0;
    }
    this._lastTime = now;
    if (this.hScrollName != null && lap) {
      page.dispatchHScroll(this.hScrollName, this, this._playingIndex, 1, this.count());
      result |= UiResult.AFFECTED;
    }
    if (this.tScrollName != null) {
      page.dispatchTScroll(this.tScrollName, this, this._currentTime, 1, duration);
      result |= UiResult.AFFECTED;
    }
    return result;
  }
}
