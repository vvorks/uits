import { Asserts, Properties, Logs, Arrays, Value, Types, Predicate } from '~/lib/lang';
import { Metrics } from '~/lib/ui/Metrics';
import { UiResult } from '~/lib/ui/UiNode';
import { UiNode } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiRootNode } from '~/lib/ui/UiRootNode';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import type { DataSource } from '~/lib/ui/DataSource';
import { HistoryManager, HistoryState } from '~/lib/ui/HistoryManager';
import { PageLayer, PageLayers } from '~/lib/ui/PageLayer';
import { UiAxis } from '~/lib/ui/UiAxis';
import { UiStyle, UiStyleBuilder } from './UiStyle';
import { Colors } from './Colors';
import { KeyLogger } from './KeyLogger';

/** システムWheel調整比の既定値  */
const DEFAULT_WHEEL_SCALE = 0.5;

/** 周期タスクの分解能の既定値 */
const DEFAULT_INTERVAL_PRECISION = 500;

/** アニメーション時間の既定値 */
const DEFAULT_ANIMATION_TIME = 100;

/** キー長押し判定閾値の既定値 */
const DEFAULT_LONG_PRESS_TIME = 1000;

/** リソース読み込み時のセパレータ */
const RESOURCE_NAME_SEPARATOR = '.';

export const GROUP_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.SILVER)
  .borderSize('0px')
  .build();

export const FIELD_STYLE: UiStyle = new UiStyleBuilder()
  .textColor(Colors.BLACK)
  .backgroundColor(Colors.WHITE)
  .borderSize('2px')
  .borderColor(Colors.BLUE)
  .fontSize('12pt')
  .textAlign('center')
  .verticalAlign('middle')
  .build();

export const FIELD_STYLE_IN_FOCUS: UiStyle = new UiStyleBuilder()
  .basedOn(FIELD_STYLE)
  .condition('FOCUS')
  .borderColor(Colors.RED)
  .build();

export const FIELD_STYLE_IN_CLICKING: UiStyle = new UiStyleBuilder()
  .basedOn(FIELD_STYLE_IN_FOCUS)
  .condition('CLICKING')
  .backgroundColor(Colors.LEMON_CHIFFON)
  .build();

type RunFinallyTask = () => void;

type RunAfterTask = () => UiResult;

type AnimationTask = (step: number) => UiResult;

type PageFactory = (tag: string) => UiPageNode;

type Resource = Properties<Value | Resource>;

/**
 * 表示中ページ情報
 */
class LivePage {
  private _pageNode: UiPageNode;
  private _layer: PageLayer;
  private _xAxis: number;
  private _yAxis: number;
  private _focusNode: UiNode | null;
  private _clickNode: UiNode | null;
  private _lastAxis: UiAxis;

  public constructor(pageNode: UiPageNode, layer: PageLayer) {
    this._pageNode = pageNode;
    this._layer = layer;
    this._xAxis = 0;
    this._yAxis = 0;
    this._focusNode = null;
    this._clickNode = null;
    this._lastAxis = UiAxis.NONE;
  }

  public get pageNode(): UiPageNode {
    return this._pageNode;
  }

  public get layer(): PageLayer {
    return this._layer;
  }

  public get xAxis(): number {
    return this._xAxis;
  }

  public set xAxis(value: number) {
    this._xAxis = value;
  }

  public get yAxis(): number {
    return this._yAxis;
  }

  public set yAxis(value: number) {
    this._yAxis = value;
  }

  public get focusNode(): UiNode | null {
    return this._focusNode;
  }

  public get focusOrPage(): UiNode {
    return this._focusNode != null ? this._focusNode : this._pageNode;
  }

  public doFocus(newNode: UiNode, axis: UiAxis = UiAxis.XY): UiResult {
    let oldNode: UiNode | null = this._focusNode;
    if (oldNode == newNode) {
      return UiResult.IGNORED;
    }
    let result = UiResult.IGNORED;
    let luca: UiNode | null =
      oldNode != null && newNode != null ? oldNode.getLucaNodeWith(newNode) : null;
    let lucaParent = luca != null ? luca.parent : null;

    Logs.info(
      'FOCUS %s -> %s',
      oldNode != null ? oldNode.getNodePath() : 'null',
      newNode != null ? newNode.getNodePath() : 'null'
    );
    if (oldNode != null) {
      let node: UiNode | null = oldNode;
      while (node != null && node != lucaParent) {
        result |= node.onFocus(oldNode, false, newNode);
        node = node.parent;
      }
    }
    this._focusNode = newNode;
    if (newNode != null) {
      let node: UiNode | null = newNode;
      while (node != null && node != lucaParent) {
        result |= node.onFocus(newNode, true, oldNode);
        node = node.parent;
      }
    }
    //AXIS更新
    this._lastAxis = axis;
    let rect = newNode.getRectOnRoot();
    if (axis & UiAxis.X) {
      this.xAxis = rect.centerX;
    }
    if (axis & UiAxis.Y) {
      this.yAxis = rect.top;
    }
    return result;
  }

  public updateAxis(): void {
    let node = this._focusNode;
    if (node != null) {
      let axis = this._lastAxis;
      let rect = node.getRectOnRoot();
      if (axis & UiAxis.X) {
        this.xAxis = rect.centerX;
      }
      if (axis & UiAxis.Y) {
        this.yAxis = rect.top;
      }
      Logs.info('update axis %d,%d', this.xAxis, this.yAxis);
    }
  }

  public get clickNode(): UiNode | null {
    return this._clickNode;
  }

  public click(node: UiNode | null): UiResult {
    let result = UiResult.IGNORED;
    if (this._clickNode != node) {
      if (this._clickNode != null) {
        if (this._clickNode.clicking) {
          this._clickNode.clicking = false;
          result |= UiResult.AFFECTED;
        }
      }
      this._clickNode = node;
      if (this._clickNode != null) {
        if (!this._clickNode.clicking) {
          this._clickNode.clicking = true;
          result |= UiResult.AFFECTED;
        }
      }
    }
    return result;
  }
}

/**
 * データソース管理項目
 */
class DataSourceEntry {
  private _tag: string;

  private _dataSource: DataSource | null;

  private _attaches: UiNode[];

  public constructor(tag: string) {
    this._tag = tag;
    this._dataSource = null;
    this._attaches = [];
  }

  public get dataSource(): DataSource | null {
    return this._dataSource;
  }

  public set dataSource(ds: DataSource | null) {
    this._dataSource = ds;
  }

  public attach(node: UiNode) {
    this._attaches.push(node);
  }

  public detach(node: UiNode) {
    let index = this._attaches.indexOf(node);
    if (index >= 0) {
      this._attaches.splice(index, 1);
    }
  }
  public onDataSourceChanged(at: number): UiResult {
    let result: UiResult = UiResult.IGNORED;
    for (let node of this._attaches) {
      result |= node.onDataSourceChanged(this._tag, this._dataSource as DataSource, at);
    }
    return result;
  }
}

/**
 * 実行状態
 */
enum RunFlags {
  NONE = 0,
  EXIT = 1,
  REPEAT = 2,
}

/**
 * 実行タスク管理項目
 */
class RunEntry<T> {
  private _node: UiNode;

  private _id: number;

  private _task: T;

  public constructor(node: UiNode, id: number, task: T) {
    this._node = node;
    this._id = id;
    this._task = task;
  }

  public get node(): UiNode {
    return this._node;
  }

  public match(node: UiNode, id: number): boolean {
    return this._node.id == node.id && this._id == id;
  }

  protected get task(): T {
    return this._task;
  }
}

/**
 * 後処理実行タスク管理項目
 */
class RunAfterEntry extends RunEntry<RunAfterTask> {
  private _timeoutId: number;

  public constructor(node: UiNode, id: number, timeoutId: number, task: RunAfterTask) {
    super(node, id, task);
    this._timeoutId = timeoutId;
  }

  public get timeoutId(): number {
    return this._timeoutId;
  }

  public run(): UiResult {
    return this.task();
  }
}

/**
 * 周期実行タスク管理項目
 */
class RunIntervalEntry extends RunEntry<RunAfterTask> {
  private _cycle: number;

  private _lastTime: number;

  private _flags: RunFlags;

  public constructor(node: UiNode, id: number, cycle: number, task: RunAfterTask) {
    super(node, id, task);
    this._cycle = cycle;
    this._lastTime = new Date().getTime();
    this._flags = RunFlags.NONE;
  }

  public get exit(): boolean {
    return !!(this._flags & RunFlags.EXIT);
  }

  public run(now: number): UiResult {
    let result = UiResult.IGNORED;
    if (Math.floor(this._lastTime / this._cycle) != Math.floor(now / this._cycle)) {
      result = this.task();
      if (result & UiResult.EXIT) {
        this._flags |= RunFlags.EXIT; //終了要求が来た場合、その情報を一旦保持
        result &= UiResult.EXIT; //上位レベルに対する応答にはEXITフラグは不要なので落とす
      }
      this._lastTime = now;
    }
    return result;
  }
}

/**
 * アニメーション実行タスク管理項目
 */
class RunAnimationEntry extends RunEntry<AnimationTask> {
  private _limit: number;

  private _baseTime: number;

  private _flags: RunFlags;

  public constructor(
    node: UiNode,
    id: number,
    limit: number,
    repeat: boolean,
    task: AnimationTask
  ) {
    super(node, id, task);
    this._limit = limit;
    this._baseTime = 0;
    this._flags = repeat ? RunFlags.REPEAT : RunFlags.NONE;
  }

  public get exit(): boolean {
    return !!(this._flags & RunFlags.EXIT);
  }

  public get repeat(): boolean {
    return !!(this._flags & RunFlags.REPEAT);
  }

  public run(now: number): UiResult {
    if (this._baseTime == 0) {
      this._baseTime = now;
    }
    let step = (now - this._baseTime) / this._limit;
    let result = this.task(step);
    if (result & UiResult.EXIT || (!this.repeat && step >= 1.0)) {
      this._flags |= RunFlags.EXIT;
    }
    result &= UiResult.EXIT;
    return result;
  }
}

/**
 * UiApplication
 *
 * 実アプリケーションの基底クラス
 */
export class UiApplication {
  /** 描画対象要素を検索するためのセレクタ（通常はBODY） */
  private _selector: string;

  /** 描画対象要素 */
  private _rootElement: HTMLElement | null;

  /** ルートノード */
  private _rootNode: UiRootNode | null;

  /** ページファクトリーリスト */
  private _pageFactories: Properties<PageFactory>;

  /** データソースリスト */
  private _dataSources: Properties<DataSourceEntry>;

  /** ページスタック */
  private _pageStack: LivePage[];

  /** マウスキャプチャ中ノード */
  private _captureNode: UiNode | null;

  /** ドキュメント全体幅 */
  private _clientWidth: number;

  /** ドキュメント全体高 */
  private _clientHeight: number;

  /** ビジーフラグ */
  private _busy: boolean;

  /** ビジーで保留になったResizeイベント */
  private _savedResizeEvent: UIEvent | null;

  /** システムWheel調整比  */
  private _wheelScale: number;

  /** 周期タスクの分解能（単位：ミリ秒） */
  private _intervalPrecision: number;

  /** アニメーション時間（単位：ミリ秒） */
  private _animationTime: number;

  /** キー長押し判定閾値（単位：ミリ秒） */
  private _longPressTime: number;

  /** イベント処理終了後に実行するタスクのリスト */
  private _finallyTasks: RunFinallyTask[];

  /** 指定時間後にワンショットで実行するタスクのリスト */
  private _afterTasks: RunAfterEntry[];

  /** 定期的に実行するタスクのリスト */
  private _intervalTasks: RunIntervalEntry[];

  /** アニメーション用タスクのリスト */
  private _animationTasks: RunAnimationEntry[];

  /** テキストリソースURL */
  private _textResourceUrl: string | null;

  /** テキストリソース */
  private _textResource: Resource;

  /** ページ履歴 */
  private _history: HistoryManager;

  /** キー履歴 */
  private _keyLogger: KeyLogger;

  private static _launchCounter: number = 0;
  public constructor(selector: string) {
    Logs.info('UiApplication start');
    this._selector = selector;
    this._rootElement = null;
    this._rootNode = null;
    this._pageFactories = {};
    this._dataSources = {};
    this._pageStack = [];
    this._captureNode = null;
    this._clientWidth = 0;
    this._clientHeight = 0;
    this._busy = false;
    this._savedResizeEvent = null;
    this._wheelScale = DEFAULT_WHEEL_SCALE;
    this._intervalPrecision = DEFAULT_INTERVAL_PRECISION;
    this._animationTime = DEFAULT_ANIMATION_TIME;
    this._longPressTime = DEFAULT_LONG_PRESS_TIME;
    this._finallyTasks = [];
    this._afterTasks = [];
    this._intervalTasks = [];
    this._animationTasks = [];
    this._textResourceUrl = null;
    this._textResource = {};
    this._history = new HistoryManager();
    this._keyLogger = new KeyLogger();
    if (UiApplication._launchCounter > 0) {
      return;
    }
    UiApplication._launchCounter = 1;
    if (document !== undefined && document.querySelector(this._selector) != null) {
      Logs.info('onLoad now');
      this.onLoad();
    } else {
      Logs.info('onLoad later');
      window.onload = (evt: Event) => {
        this.onLoad();
      };
    }
  }

  public get rootNode(): UiRootNode {
    Asserts.assume(this._rootNode != null);
    return this._rootNode as UiRootNode;
  }

  public get rootElement(): HTMLElement {
    Asserts.assume(this._rootElement != null);
    return this._rootElement as HTMLElement;
  }

  public get clientWidth(): number {
    return this._clientWidth;
  }

  public get clientHeight(): number {
    return this._clientHeight;
  }

  public getClientRect(): Rect {
    return new Rect().locate(0, 0, this._clientWidth, this._clientHeight);
  }

  public get wheelScale(): number {
    return this._wheelScale;
  }

  public set wheelScale(scale: number) {
    this._wheelScale = scale;
  }

  public get intervalPrecision(): number {
    return this._intervalPrecision;
  }

  public set intervalPrecision(precision: number) {
    this._intervalPrecision = precision;
  }

  public get animationTime(): number {
    return this._animationTime;
  }

  public set animationTime(time: number) {
    this._animationTime = time;
  }

  public async onLoad(): Promise<void> {
    //root準備
    let now = this.newTimestamp();
    this._rootNode = new UiRootNode(this, 'root');
    this._rootNode.inset = '0px';
    this._rootElement = document.querySelector(this._selector);
    if (this._rootElement == null) {
      this._rootElement = document.body;
    }
    let root = this._rootElement;
    //メトリックス計測
    Metrics.getInstance().measure(root);
    let docElement = document.documentElement;
    this._clientWidth = docElement.clientWidth;
    this._clientHeight = docElement.clientHeight;
    //イベントハンドラ設定
    root.addEventListener('keydown', (evt) => {
      this.processKeyDown(evt);
    });
    root.addEventListener('keypress', (evt) => {
      this.processKeyPress(evt);
    });
    root.addEventListener('keyup', (evt) => {
      this.processKeyUp(evt);
    });
    root.focus();
    root.addEventListener('mousemove', (evt) => {
      this.processMouseMove(evt);
    });
    root.addEventListener('mousedown', (evt) => {
      this.processMouseDown(evt);
    });
    root.addEventListener('mouseup', (evt) => {
      this.processMouseUp(evt);
    });
    root.addEventListener('click', (evt) => {
      this.processMouseClick(evt);
    });
    root.addEventListener('dblclick', (evt) => {
      this.processMouseDoubleClick(evt);
    });
    root.addEventListener('wheel', (evt) => {
      this.processMouseWheel(evt);
    });
    window.addEventListener('resize', (evt) => {
      this.processResize(evt);
    });
    window.addEventListener('popstate', (evt) => {
      this._history.popState(evt.state);
    });
    window.addEventListener('hashchange', (evt) => {
      this.processHashChanged();
    });
    window.setTimeout(() => {
      this.processIntervalTasks();
    }, this.getNextInterval());
    if (!!window.requestAnimationFrame) {
      const aniFunc = (at: number) => {
        this.processAnimationFrame(at);
        window.requestAnimationFrame(aniFunc);
      };
      window.requestAnimationFrame(aniFunc);
    } else {
      const aniFunc = () => {
        let at = this.newTimestamp();
        this.processAnimationFrame(at);
        window.setTimeout(aniFunc, 16);
      };
      window.setTimeout(aniFunc, 16);
    }
    //派生クラス初期化
    this.initialize(now);
    //リソース読み込み
    if (this._textResourceUrl != null) {
      this._textResource = await this.loadTextResource(this._textResourceUrl);
    }
    //初回のロード処理
    this.processHashChanged();
  }

  protected initialize(at: number): void {}

  public addPageFactory(tag: string, func: PageFactory): void {
    this._pageFactories[tag] = func;
  }

  public removePageFactory(tag: string): void {
    delete this._pageFactories[tag];
  }

  public getPageFactory(tag: string): PageFactory | undefined {
    return this._pageFactories[tag];
  }

  /**
   * 全ファクトリを取得する（UiLaunchPage用）
   *
   * @returns ページファクトリーリスト
   */
  public getPageFactries(): Properties<PageFactory> {
    return this._pageFactories;
  }

  public addDataSource(tag: string, ds: DataSource): void {
    let entry = this._dataSources[tag];
    if (entry === undefined) {
      entry = new DataSourceEntry(tag);
      entry.dataSource = ds;
      this._dataSources[tag] = entry;
      ds.addApplication(this);
    }
  }

  public removeDataSource(tag: string): void {
    let entry = this._dataSources[tag];
    if (entry !== undefined) {
      let ds = entry.dataSource;
      Asserts.require(ds != null);
      ds.removeAppliation(this);
      entry.dataSource = null;
    }
  }

  public getDataSource(tag: string): DataSource | null {
    let entry = this._dataSources[tag];
    return entry !== undefined ? entry.dataSource : null;
  }

  public attachIntoDataSource(tag: string, node: UiNode) {
    let entry = this._dataSources[tag];
    if (entry === undefined) {
      entry = new DataSourceEntry(tag);
      this._dataSources[tag] = entry;
    }
    entry.attach(node);
  }

  public detachFromDataSource(tag: string, node: UiNode) {
    let entry = this._dataSources[tag];
    if (entry !== undefined) {
      entry.detach(node);
    }
  }

  public setTextResource(resourceUrl: string): void {
    this._textResourceUrl = resourceUrl;
  }

  private async loadTextResource(url: string): Promise<Resource> {
    let resp = await fetch(url);
    let json = await resp.json();
    return json;
  }

  public findTextResourceAsString(path: string, defaultValue: string): string {
    let ret = this.findTextResource(path, defaultValue);
    return Types.isString(ret) ? (ret as string) : defaultValue;
  }

  public findTextResourceAsNumber(path: string, defaultValue: number): number {
    let ret = this.findTextResource(path, defaultValue);
    return Types.isNumber(ret) ? (ret as number) : defaultValue;
  }

  public findTextResourceAsBoolean(path: string, defaultValue: boolean): boolean {
    let ret = this.findTextResource(path, defaultValue);
    return Types.isBoolean(ret) ? (ret as boolean) : defaultValue;
  }

  public findTextResource(path: string, defaultValue: Value): Value {
    let array = path.split(RESOURCE_NAME_SEPARATOR);
    let node = this._textResource;
    for (let i = 0; i < array.length - 1; i++) {
      let name = array[i];
      let t = node[name];
      if (!Types.isObject(t)) {
        return defaultValue;
      }
      node = t as Resource;
    }
    let lastName = array[array.length - 1];
    let result = node[lastName];
    if (result === undefined || Types.isObject(result)) {
      return defaultValue;
    }
    return result as Value;
  }

  public transit(state: HistoryState, layer: PageLayer = PageLayers.NORMAL): UiPageNode | null {
    let factory: PageFactory | undefined = this._pageFactories[state.tag];
    if (factory == null) {
      Logs.error("page '%s' not found", state.tag);
      return null;
    }
    this.unmountLayerPages(layer);
    let newPage = factory(state.tag);
    this.call(newPage, state, layer);
    return newPage;
  }

  /**
   * 現在ページ上にPOPUPページを表示する。
   *
   * @param state 履歴情報（タグ、引数）
   * @param layer 表示レイヤー（オプション）
   * @returns 成功の場合、表示されたページオブジェクトを返却（失敗の場合、null）
   */
  public popup(state: HistoryState, layer: PageLayer = PageLayers.NORMAL): UiPageNode | null {
    let factory: PageFactory | undefined = this._pageFactories[state.tag];
    if (factory == null) {
      Logs.error("page '%s' not found", state.tag);
      return null;
    }
    let newPage = factory(state.tag);
    this.call(newPage, state, layer);
    return newPage;
  }

  private getHistoryStates(): HistoryState[] | null {
    let layer = PageLayers.NORMAL;
    let firstIndex = this._pageStack.findIndex((e) => e.layer == layer);
    if (firstIndex == -1) {
      return null;
    }
    let result: HistoryState[] = [];
    for (let i = firstIndex; i < this._pageStack.length; i++) {
      let page = this._pageStack[i];
      if (page.layer != layer) {
        break;
      }
      let pageNode = page.pageNode;
      result.push(pageNode.getHistoryState());
    }
    return result;
  }

  private unmountLayerPages(layer: PageLayer): void {
    let nextIndex = this._pageStack.findIndex((e) => e.layer > layer);
    if (nextIndex == -1) {
      nextIndex = this._pageStack.length;
    }
    let firstIndex = 0;
    for (let i = nextIndex - 1; i >= firstIndex; i--) {
      let page = this._pageStack[i];
      if (page.layer < layer) {
        firstIndex = i + 1;
        break;
      }
      let pageNode = page.pageNode;
      pageNode.onUnmount();
      this.rootNode.removeChild(pageNode);
      this.cancelAfterTasksIn(pageNode);
      this.cancelIntervalTasksIn(pageNode);
      this.cancelAnimationTasksIn(pageNode);
    }
    let count = nextIndex - firstIndex;
    if (count > 0) {
      this._pageStack.splice(firstIndex, count);
    }
  }

  public call(
    pageNode: UiPageNode,
    state: HistoryState,
    layer: PageLayer = PageLayers.NORMAL
  ): void {
    let page = new LivePage(pageNode, layer);
    let biggerIndex = this._pageStack.findIndex((e) => e.layer > layer);
    if (biggerIndex >= 0) {
      let afterNode = this._pageStack[biggerIndex].pageNode;
      this._pageStack.splice(biggerIndex, 0, page);
      this.rootNode.insertChild(pageNode, afterNode);
    } else {
      this._pageStack.push(page);
      this.rootNode.appendChild(pageNode);
    }
    pageNode.onMount();
    pageNode.setHistoryState(state);
    if (layer == PageLayers.NORMAL) {
      if (page.focusNode == null || !this.isAppearedFocusable(page.focusNode)) {
        if (!this.resetFocus(pageNode)) {
          Logs.error('LOST FOCUS!');
        }
      }
    }
  }

  public dispose(pageNode: UiPageNode): void {
    let index = this.getLivePageIndex(pageNode);
    if (index < 0) {
      return;
    }
    this._pageStack.splice(index, 1);
    pageNode.onUnmount();
    this.rootNode.removeChild(pageNode);
    this.cancelAfterTasksIn(pageNode);
    this.cancelIntervalTasksIn(pageNode);
    this.cancelAnimationTasksIn(pageNode);
  }

  public isFocusable(e: UiNode): boolean {
    return !e.deleted && e.visible && e.enable && e.focusable;
  }

  public isAppearedFocusable(e: UiNode): boolean {
    return this.isFocusable(e) && e.getBlockerNode() == null;
  }

  public isAppearedFocusableAll(e: UiNode): boolean {
    if (!this.isAppearedFocusable(e)) {
      return false;
    }
    let node: UiNode | null = e.parent;
    while (node != null) {
      if (!(!node.deleted && node.visible)) {
        return false;
      }
      node = node.parent;
    }
    return true;
  }

  public resetFocus(node: UiNode): boolean {
    let page = this.getLivePageOf(node);
    Asserts.require(page != null);
    let newFocus = Arrays.first(
      node.getFocusableDescendantsIf((e) => this.isAppearedFocusable(e), 1)
    );
    if (newFocus != null) {
      newFocus = newFocus.adjustFocus(newFocus);
      page.doFocus(newFocus);
    }
    return newFocus != null;
  }

  public setFocus(node: UiNode, axis: UiAxis = UiAxis.XY): UiResult {
    let page = this.getLivePageOf(node);
    let result = UiResult.IGNORED;
    if (page != null) {
      page.doFocus(node, axis);
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  public updateAxis(node: UiNode): UiResult {
    let page = this.getLivePageOf(node);
    let result = UiResult.IGNORED;
    if (page != null) {
      page.updateAxis();
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  private getLastPage(layer: PageLayer): LivePage | null {
    let nextIndex = this._pageStack.findIndex((e) => e.layer > layer);
    if (nextIndex == -1) {
      nextIndex = this._pageStack.length;
    }
    for (let i = nextIndex - 1; i >= 0; i--) {
      let page = this._pageStack[i];
      if (page.layer == layer) {
        return page;
      }
    }
    return null;
  }

  public getFocus(): UiNode | null {
    let lastPage = this.getLastPage(PageLayers.NORMAL);
    return lastPage != null ? lastPage.focusNode : null;
  }

  public getFocusOf(node: UiNode): UiNode | null {
    let page = this.getLivePageOf(node);
    if (page != null) {
      return page.focusNode;
    }
    return null;
  }

  protected getTopmostLivePage(): LivePage | null {
    let len = this._pageStack.length;
    return len == 0 ? null : this._pageStack[len - 1];
  }

  protected getLivePageOf(node: UiNode): LivePage | null {
    let pageNode: UiPageNode | null = node.getPageNode() as UiPageNode;
    if (pageNode == null) {
      return null;
    }
    let index = this.getLivePageIndex(pageNode);
    if (index < 0) {
      return null;
    }
    return this._pageStack[index];
  }

  private getLivePageIndex(pageNode: UiPageNode): number {
    let len = this._pageStack.length;
    for (let i = len - 1; i >= 0; i--) {
      let page = this._pageStack[i];
      if (pageNode == page.pageNode) {
        return i;
      }
    }
    return -1;
  }

  private recoverFocus(): UiResult {
    let result = UiResult.IGNORED;
    let lastPage = this.getLastPage(PageLayers.NORMAL);
    if (lastPage != null) {
      if (lastPage.focusNode == null || !this.isAppearedFocusableAll(lastPage.focusNode)) {
        if (!this.resetFocus(lastPage.pageNode)) {
          Logs.error('LOST FOCUS!');
        } else {
          Logs.warn('RECOVER FOCUS!');
          result |= UiResult.AFFECTED;
        }
      }
    }
    return result;
  }

  public sync() {
    this.rootNode.sync();
    this._busy = true;
  }

  public runFinally(task: RunFinallyTask): void {
    this._finallyTasks.push(task);
  }

  protected flushFinally(): void {
    if (this._finallyTasks.length > 0) {
      let tasks = this._finallyTasks;
      this._finallyTasks = [];
      for (let task of tasks) {
        task();
      }
    }
  }

  public runAfter(node: UiNode, id: number, msec: number, task: RunAfterTask): void {
    this.cancelAfter(node, id);
    let timeoutId = window.setTimeout(() => this.processAfterTasks(node, id), msec);
    let entry = new RunAfterEntry(node, id, timeoutId, task);
    this._afterTasks.push(entry);
  }

  public cancelAfter(node: UiNode, id: number) {
    let divided = Arrays.divide(this._afterTasks, (e) => e.match(node, id));
    this._afterTasks = divided[1];
    for (let e of divided[0]) {
      window.clearTimeout(e.timeoutId);
    }
  }

  private cancelAfterTasksIn(page: UiPageNode) {
    let divided = Arrays.divide(this._afterTasks, (e) => page.isAncestorOf(e.node));
    this._afterTasks = divided[1];
    for (let e of divided[0]) {
      window.clearTimeout(e.timeoutId);
    }
  }

  private processAfterTasks(node: UiNode, id: number): void {
    let divided = Arrays.divide(this._afterTasks, (e) => e.match(node, id));
    this._afterTasks = divided[1];
    let result: UiResult = UiResult.IGNORED;
    try {
      for (let e of divided[0]) {
        result |= e.run();
      }
      //後処理
      this.postProcessEvent(null, result);
    } finally {
      this.flushFinally();
    }
  }

  public runInterval(node: UiNode, id: number, cycle: number, task: RunAfterTask) {
    let entry = new RunIntervalEntry(node, id, cycle, task);
    this._intervalTasks.push(entry);
  }

  public cancelInterval(node: UiNode, id: number) {
    let divided = Arrays.divide(this._intervalTasks, (e) => e.match(node, id));
    this._intervalTasks = divided[1];
  }

  private cancelIntervalTasksIfExit() {
    let divided = Arrays.divide(this._intervalTasks, (e) => e.exit);
    this._intervalTasks = divided[1];
  }

  private cancelIntervalTasksIn(page: UiPageNode) {
    let divided = Arrays.divide(this._intervalTasks, (e) => page.isAncestorOf(e.node));
    this._intervalTasks = divided[1];
  }

  private processIntervalTasks(): void {
    let result: UiResult = UiResult.IGNORED;
    try {
      let now = new Date().getTime();
      for (let e of this._intervalTasks) {
        result |= e.run(now);
      }
      //後処理
      this.postProcessEvent(null, result);
      this.cancelIntervalTasksIfExit();
    } finally {
      this.flushFinally();
    }
    window.setTimeout(() => {
      this.processIntervalTasks();
    }, this.getNextInterval());
  }

  private getNextInterval(): number {
    let now = new Date().getTime();
    let unit = this._intervalPrecision;
    let next = Math.floor((now + unit) / unit) * unit;
    return next - now;
  }

  public runAnimation(
    node: UiNode,
    id: number,
    limit: number,
    repeat: boolean,
    task: AnimationTask
  ) {
    let entry = new RunAnimationEntry(node, id, limit, repeat, task);
    this._animationTasks.push(entry);
  }

  public cancelAnimation(node: UiNode, id: number) {
    let divided = Arrays.divide(this._animationTasks, (e) => e.match(node, id));
    this._animationTasks = divided[1];
  }

  private cancelAnimationTasksIfExit() {
    let divided = Arrays.divide(this._animationTasks, (e) => e.exit);
    this._animationTasks = divided[1];
  }

  private cancelAnimationTasksIn(page: UiPageNode) {
    let divided = Arrays.divide(this._animationTasks, (e) => page.isAncestorOf(e.node));
    this._animationTasks = divided[1];
  }

  private hasOneshotAnimation(): boolean {
    let divided = Arrays.divide(this._animationTasks, (e) => e.repeat);
    return divided[1].length > 0;
  }

  private processAnimationFrame(at: number): void {
    let result: UiResult = UiResult.AFFECTED;
    let hadAnimation = this.hasOneshotAnimation();
    let hasAnimation = false;
    try {
      for (let e of this._animationTasks) {
        result |= e.run(at);
      }
      this.cancelAnimationTasksIfExit();
      let hasAnimation = this.hasOneshotAnimation();
      if (hadAnimation && !hasAnimation) {
        result |= this.recoverFocus();
      }
      //後処理
      this.postProcessEvent(null, result);
    } finally {
      this.flushFinally();
    }
    this._busy = hasAnimation;
    if (!this._busy && this._savedResizeEvent != null) {
      let evt = this._savedResizeEvent;
      this._savedResizeEvent = null;
      this.processResize(evt);
    }
  }

  private processKeyDown(evt: KeyboardEvent): void {
    try {
      //busyチェック
      if (this._busy) {
        Logs.warn('BUSY');
        this.postProcessEvent(evt, UiResult.CONSUMED);
        return;
      }
      //イベント情報取得
      let key = evt.keyCode;
      let ch = evt.charCode;
      let mod = this.getKeyModifier(evt);
      let at = evt.timeStamp;
      Logs.info('keyDown key=0x%x ch=0x%x mod=0x%x', key, ch, mod);
      this._keyLogger.logKeyDown(key, at);
      if (at - this._keyLogger.getLastDownAt(key) > this._longPressTime) {
        mod |= KeyCodes.MOD_LONG_PRESS;
      }
      //UINodeへのキーディスパッチ
      let result: UiResult = UiResult.IGNORED;
      let depth = this._pageStack.length;
      for (let i = depth - 1; i >= 0; i--) {
        let page = this._pageStack[i];
        let target = page.focusOrPage;
        let node: UiNode | null = target;
        while (node != null) {
          result = node.onKeyDown(target, key, ch, mod, at);
          if (result & UiResult.CONSUMED) {
            break;
          }
          node = node.parent;
        }
        if (result & UiResult.CONSUMED || page.layer == PageLayers.NORMAL) {
          break;
        }
      }
      //UiApplicationのデフォルト処理呼び出し
      if (!(result & UiResult.CONSUMED)) {
        //UiNode側の処理でフォーカスが変化している場合があるので、再取得
        let target = this.getFocus();
        if (target != null) {
          result = this.onKeyDown(target, key, ch, mod, at);
        }
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processKeyPress(evt: KeyboardEvent): void {
    try {
      //イベント情報取得
      let key = evt.keyCode;
      let ch = evt.charCode;
      let mod = this.getKeyModifier(evt);
      let at = evt.timeStamp;
      Logs.info('keyPress key=0x%x ch=0x%x mod=0x%x', key, ch, mod);
      //UINodeへのキーディスパッチ
      let result: UiResult = UiResult.IGNORED;
      let depth = this._pageStack.length;
      for (let i = depth - 1; i >= 0; i--) {
        let page = this._pageStack[i];
        let target = page.focusOrPage;
        let node: UiNode | null = target;
        while (node != null) {
          result = node.onKeyPress(target, key, ch, mod, at);
          if (result & UiResult.CONSUMED) {
            break;
          }
          node = node.parent;
        }
        if (result & UiResult.CONSUMED || page.layer == PageLayers.NORMAL) {
          break;
        }
      }
      //UiApplicationのデフォルト処理呼び出し
      if (!(result & UiResult.CONSUMED)) {
        //UiNode側の処理でフォーカスが変化している場合があるので、再取得
        let target = this.getFocus();
        if (target != null) {
          result = this.onKeyPress(target, key, ch, mod, at);
        }
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processKeyUp(evt: KeyboardEvent): void {
    try {
      //イベント情報取得
      let key = evt.keyCode;
      let ch = evt.charCode;
      let mod = this.getKeyModifier(evt);
      let at = evt.timeStamp;
      Logs.info('keyUp key=0x%x ch=0x%x mod=0x%x', key, ch, mod);
      this._keyLogger.logKeyUp(key, at);
      //UINodeへのキーディスパッチ
      let result: UiResult = UiResult.IGNORED;
      let depth = this._pageStack.length;
      for (let i = depth - 1; i >= 0; i--) {
        let page = this._pageStack[i];
        let target = page.focusOrPage;
        let node: UiNode | null = target;
        while (node != null) {
          result = node.onKeyUp(target, key, ch, mod, at);
          if (result & UiResult.CONSUMED) {
            break;
          }
          node = node.parent;
        }
        if (result & UiResult.CONSUMED || page.layer == PageLayers.NORMAL) {
          break;
        }
      }
      //UiApplicationのデフォルト処理呼び出し
      if (!(result & UiResult.CONSUMED)) {
        //UiNode側の処理でフォーカスが変化している場合があるので、再取得
        let target = this.getFocus();
        if (target != null) {
          result = this.onKeyUp(target, key, ch, mod, at);
        }
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private getKeyModifier(evt: KeyboardEvent): number {
    return (
      (evt.shiftKey ? KeyCodes.MOD_SHIFT : 0) |
      (evt.ctrlKey ? KeyCodes.MOD_CTRL : 0) |
      (evt.altKey ? KeyCodes.MOD_ALT : 0) |
      (evt.metaKey ? KeyCodes.MOD_META : 0) |
      (evt.repeat ? KeyCodes.MOD_REPEAT : 0)
    );
  }

  private processMouseMove(evt: MouseEvent): void {
    try {
      //busyチェック
      if (this._busy) {
        Logs.warn('BUSY');
        this.postProcessEvent(evt, UiResult.CONSUMED);
        return;
      }
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      //Logs.info("mouseMove x=%d y=%d mod=0x%x", x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      let result = node.onMouseMove(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseMove(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseMove(target, pt.x, pt.y, mod, at);
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processMouseDown(evt: MouseEvent): void {
    try {
      //busyチェック
      if (this._busy) {
        Logs.warn('BUSY');
        this.postProcessEvent(evt, UiResult.CONSUMED);
        return;
      }
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      Logs.info('mouseDown x=%d y=%d mod=0x%x', x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      let result = node.onMouseDown(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseDown(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseDown(target, pt.x, pt.y, mod, at);
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processMouseUp(evt: MouseEvent): void {
    try {
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      Logs.info('mouseUp x=%d y=%d mod=0x%x', x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      let result = node.onMouseUp(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseUp(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseUp(target, pt.x, pt.y, mod, at);
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processMouseClick(evt: MouseEvent): void {
    try {
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      Logs.info('mouseClick x=%d y=%d mod=0x%x', x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      let result = node.onMouseClick(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseClick(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseClick(target, pt.x, pt.y, mod, at);
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processMouseDoubleClick(evt: MouseEvent): void {
    try {
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      Logs.info('mouseDoubleClick x=%d y=%d mod=0x%x', x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      let result = node.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processMouseWheel(evt: WheelEvent): void {
    try {
      let x = evt.clientX;
      let y = evt.clientY;
      let dx = evt.deltaX * this.wheelScale;
      let dy = evt.deltaY * this.wheelScale;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      Logs.info('mouseWheel x=%d y=%d dx=%d dy=%d mod=0x%x', x, y, dx, dy, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      let result = node.onMouseWheel(target, pt.x, pt.y, dx, dy, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseWheel(target, pt.x, pt.y, dx, dy, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseWheel(target, pt.x, pt.y, dx, dy, mod, at);
      }
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private getMouseModifier(evt: MouseEvent): number {
    //TODO ボタン情報付与
    return (
      (evt.shiftKey ? KeyCodes.MOD_SHIFT : 0) |
      (evt.ctrlKey ? KeyCodes.MOD_CTRL : 0) |
      (evt.altKey ? KeyCodes.MOD_ALT : 0) |
      (evt.metaKey ? KeyCodes.MOD_META : 0)
    );
  }

  /**
   * 指定位置に存在するノードを探索する
   *
   * @param pt 指定位置
   * @returns 指定位置に存在するノード。また、副次的ptは返却するノードの座標系に変更される
   */
  private getMouseTarget(pt: Rect): UiNode {
    let node: UiNode;
    if (this._pageStack.length == 0) {
      node = this.rootNode;
    } else if (this._captureNode == null) {
      node = this.rootNode;
      let child: UiNode | null = node.getVisibleChildAt(pt.x, pt.y);
      while (child != null) {
        node = child;
        node.translate(pt, -1);
        child = node.getVisibleChildAt(pt.x, pt.y);
      }
    } else {
      let curr: UiNode | null = this._captureNode;
      while (curr != null) {
        curr.translate(pt, -1);
        curr = curr.parent;
      }
      node = this._captureNode;
    }
    return node;
  }

  private processResize(evt: UIEvent): void {
    try {
      //busyチェック
      if (this._busy) {
        Logs.warn('BUSY');
        this.postProcessEvent(evt, UiResult.CONSUMED);
        this._savedResizeEvent = evt;
        return;
      }
      let at = evt.timeStamp;
      let docElement = document.documentElement;
      let w = docElement.clientWidth;
      let h = docElement.clientHeight;
      Logs.info('resize width=%d height=%d at %d', w, h, at);
      this._clientWidth = w;
      this._clientHeight = h;
      let result = this.rootNode.onResize(at);
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processHashChanged(): void {
    try {
      let hash = window.location.hash;
      Logs.info('processHashChanged hash %s', hash);
      let oldStates = this.getHistoryStates();
      if (oldStates != null) {
        this._history.saveHistoryStates(oldStates);
      }
      let newStates = this._history.loadHistoryStates(hash);
      this.transit(newStates[0]); //仮
      //後処理
      this.postProcessEvent(null, UiResult.AFFECTED);
    } finally {
      this.flushFinally();
    }
  }

  /**
   * 戻る（ブラウザの戻ると同じ）
   */
  public back(): void {
    this._history.back();
  }

  /**
   * 進む（ブラウザの進むと同じ）
   */
  public forward(): void {
    this._history.forward();
  }

  /**
   * 次ページに進む
   *
   * @param newTag ページハッシュ名
   * @param args 引数
   * @returns 結果（現状は常に正常終了）
   */
  public forwardTo(newTag: string, args: Properties<string>): UiResult {
    this._history.forwardTo(newTag, args);
    return UiResult.AFFECTED;
  }

  /**
   * 先頭ページから指定ページをリロード
   *
   * @param newTag
   * @param args
   * @returns
   */
  public restartTo(newTag: string, args: Properties<string>): UiResult {
    this._history.restartTo(newTag, args);
    return UiResult.AFFECTED;
  }

  public processDataSourceChanged(ds: DataSource): void {
    let at = this.newTimestamp();
    try {
      let result: UiResult = UiResult.IGNORED;
      for (const [tag, entry] of Object.entries(this._dataSources)) {
        if (entry !== undefined) {
          if (ds == entry.dataSource) {
            Logs.info('onDataSourceChanged %s %d', tag, ds.count());
            result |= entry.onDataSourceChanged(at);
          }
        }
      }
      //後処理
      this.postProcessEvent(null, result);
    } finally {
      this.flushFinally();
    }
  }

  private postProcessEvent(evt: Event | null, result: UiResult): void {
    if (result & UiResult.AFFECTED) {
      this.sync();
    }
    if (result & UiResult.CONSUMED) {
      if (evt != null && !(evt instanceof WheelEvent)) {
        evt.preventDefault();
      }
    }
  }

  private newTimestamp(): number {
    return document.createEvent('Event').timeStamp;
  }

  protected onKeyDown(curr: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result: UiResult = UiResult.IGNORED;
    let tRect = curr.getRectOnRoot();
    let next: UiNode | null = null;
    let axis = UiAxis.NONE;
    let page = this.getLivePageOf(curr) as LivePage;
    let from = page.pageNode;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.LEFT:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().right <= tRect.left);
        axis = UiAxis.X;
        break;
      case KeyCodes.RIGHT:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().left >= tRect.right);
        axis = UiAxis.X;
        break;
      case KeyCodes.UP:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().bottom <= tRect.top);
        axis = UiAxis.Y;
        break;
      case KeyCodes.DOWN:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().top >= tRect.bottom);
        axis = UiAxis.Y;
        break;
      case KeyCodes.TAB:
        next = this.getAdjacentNode(curr, from, +1);
        axis = UiAxis.XY;
        result |= UiResult.CONSUMED;
        break;
      case KeyCodes.TAB | KeyCodes.MOD_SHIFT:
        next = this.getAdjacentNode(curr, from, -1);
        axis = UiAxis.XY;
        result |= UiResult.CONSUMED;
        break;
      case KeyCodes.ENTER:
        result |= (this.getLivePageOf(curr) as LivePage).click(curr);
        break;
      case KeyCodes.KEY_Q | KeyCodes.MOD_CTRL:
        //debug print
        let met = Metrics.getInstance();
        Logs.debug('emSize %d exSize %d inSize %d', met.emSize, met.exSize, met.inSize);
        let nodes = this.rootNode.getDescendantsIf(() => true);
        for (let node of nodes) {
          let rect = node.getRect();
          let dom = node.domElement;
          Logs.debug('%s rect %4d,%4d,%4d,%4d', node.name, rect.x, rect.y, rect.width, rect.height);
          if (dom != null) {
            Logs.debug(
              '%s dom  %4d,%4d,%4d,%4d',
              node.name,
              dom.offsetLeft,
              dom.offsetTop,
              dom.offsetWidth,
              dom.offsetHeight
            );
          }
        }
      default:
        break;
    }
    if (next != null) {
      next.focusing = true;
      let adjusted = next.adjustFocus(curr);
      if (next != adjusted) {
        next.focusing = false;
        next = adjusted;
        next.focusing = true;
        axis |= UiAxis.XY;
      }
      result |= this.scrollFor(next);
      result |= this.setFocus(next, axis);
      next.focusing = false;
    }
    return result;
  }

  public scrollFor(next: UiNode, animationTime?: number): UiResult {
    let result = UiResult.IGNORED;
    let target = next;
    let parent = target.parent;
    while (parent != null) {
      result |= parent.scrollFor(target, animationTime);
      target = parent;
      parent = target.parent;
    }
    return result;
  }

  protected onKeyPress(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    return result;
  }

  protected onKeyUp(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        result |= (this.getLivePageOf(target) as LivePage).click(null);
        break;
    }
    return result;
  }

  public getNearestNode(curr: UiNode, from: UiNode, filter: Predicate<UiNode>): UiNode | null {
    let page = this.getLivePageOf(curr) as LivePage;
    let next: UiNode | null = null;
    let minDegree = 0;
    let minDistance = 0;
    let candidates = from.getFocusableDescendantsIf((c) => {
      let result = false;
      if (c != curr && this.isFocusable(c) && filter(c) && curr.canMoveFocus(c)) {
        let blocker = c.getBlockerNode();
        let luca = c.getLucaNodeWith(curr);
        result = blocker == null || blocker == luca || blocker.isAncestorOf(luca);
      }
      return result;
    });
    for (let c of candidates) {
      let luca = c.getLucaNodeWith(curr);
      let degree: number = curr.getDegree(luca);
      let cRect = c.getRectOnRoot();
      let distance = cRect.distance(page.xAxis, page.yAxis);
      if (next == null || degree < minDegree || (degree == minDegree && distance < minDistance)) {
        next = c;
        minDegree = degree;
        minDistance = distance;
      }
    }
    return next;
  }

  public getAdjacentNode(curr: UiNode, from: UiNode, dir: number): UiNode | null {
    let candidates = from.getFocusableDescendantsIf((c) => {
      let result = false;
      if (this.isFocusable(c) && curr.canMoveFocus(c)) {
        let blocker = c.getBlockerNode();
        let luca = c.getLucaNodeWith(curr);
        result = blocker == null || blocker == luca || blocker.isAncestorOf(luca);
      }
      return result;
    });
    let index = candidates.indexOf(curr);
    let n = candidates.length;
    return index == -1 ? null : candidates[(index + dir + n) % n];
  }

  protected onMouseMove(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return UiResult.IGNORED;
  }

  protected onMouseDown(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    if (this.isFocusable(target)) {
      result |= (this.getLivePageOf(target) as LivePage).click(target);
    }
    return result;
  }

  protected onMouseUp(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    if (this.isFocusable(target)) {
      result |= (this.getLivePageOf(target) as LivePage).click(null);
    }
    return result;
  }

  protected onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    if (this.isFocusable(target)) {
      this.setFocus(target);
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  protected onMouseDoubleClick(
    target: UiNode,
    x: number,
    y: number,
    mod: number,
    at: number
  ): UiResult {
    return UiResult.IGNORED;
  }

  protected onMouseWheel(
    target: UiNode,
    x: number,
    y: number,
    dx: number,
    dy: number,
    mod: number,
    at: number
  ): UiResult {
    return UiResult.IGNORED;
  }
}
