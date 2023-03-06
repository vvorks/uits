import { Logs } from '../lang';
import { DataRecord, DataSource } from './DataSource';
import { Scrollable } from './Scrollable';
import type { UiApplication } from './UiApplication';
import { HasSetter } from './UiBuilder';
import { UiNode, UiNodeSetter, UiResult } from './UiNode';
import { UiPageNode } from './UiPageNode';
import { UiPhantomNode } from './UiPhantomNode';
import { UiVideo } from './UiVideo';

export class UiPlayListSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiPlayListSetter();
  public video(path: string): this {
    let node = this.node as UiPlayList;
    node.videoNodeName = path;
    return this;
  }
}
export class UiPlayList extends UiPhantomNode implements HasSetter<UiPlayListSetter> {
  private _dataSource: DataSource | null;

  private _playingIndex: number;

  private _videoNodeName: string | null;

  private _videoNode: UiVideo | null;

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
      this._videoNodeName = src._videoNodeName;
      this._videoNode = src._videoNode;
    } else {
      super(param as UiApplication, name as string);
      this._dataSource = null;
      this._playingIndex = 0;
      this._videoNodeName = null;
      this._videoNode = null;
    }
  }

  public getSetter(): UiPlayListSetter {
    return UiPlayListSetter.INSTANCE;
  }

  public count(): number {
    return this._dataSource != null ? this._dataSource.count() : -1;
  }

  public getRecord(index: number): DataRecord | null {
    return this._dataSource != null ? this._dataSource.getRecord(index) : null;
  }

  public get videoNodeName(): string | null {
    return this._videoNodeName;
  }

  public set videoNodeName(path: string | null) {
    this._videoNodeName = path;
  }

  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    if (tag != this.dataSourceName) {
      return UiResult.IGNORED;
    }
    let count = this.count();
    if (count < 0) {
      this._dataSource = ds;
      this._playingIndex = Math.max(0, ds.attention());
      if (this._videoNodeName != null) {
        let node = this.findNodeByPath(this._videoNodeName);
        if (node != null && node instanceof UiVideo) {
          this._videoNode = node as UiVideo;
          count = this.count();
        } else {
          Logs.error('VIDEO NODE %s IS INVALID', this._videoNodeName);
        }
      } else {
        Logs.error('VIDEO NODE NAME UNDEFINED');
      }
    } else if (count > 0) {
      this._playingIndex = Math.max(Math.min(this._playingIndex, count - 1), 0);
    }
    if (count > 0) {
      this.play(this._playingIndex, count);
    }
    return UiResult.AFFECTED;
  }

  public onTScroll(
    source: Scrollable,
    currentTime: number,
    unused: number,
    duration: number
  ): void {
    Logs.debug('onTScroll %d/%d', currentTime, duration);
    if (currentTime >= duration && this.count() > 0) {
      this._playingIndex = (this._playingIndex + 1) % this.count();
      this.play(this._playingIndex, this.count());
    }
  }

  private play(index: number, count: number): void {
    if (this._videoNode != null) {
      let rec = this.getRecord(index) as DataRecord;
      let url = rec['contentUrl'] as string;
      this._videoNode.createPlayer(url);
    }
    let page = this.getPageNode() as UiPageNode;
    if (this.hScrollName != null) {
      page.dispatchHScroll(this.hScrollName, this, index, 1, count);
    }
  }

  protected preUnmount(): void {
    if (this._videoNode != null) {
      this._videoNode.videoPause();
    }
  }
}
