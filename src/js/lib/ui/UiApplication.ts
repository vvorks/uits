import { Colors } from './Colors';
import { KeyLogger } from './KeyLogger';
import { UiBlankPageNode } from './UiBlankPageNode';
import { UiStyle, UiStyleBuilder } from './UiStyle';
import { Asserts, Properties, Logs, Arrays, Value, Types, Predicate } from '~/lib/lang';
import { DataSource } from '~/lib/ui/DataSource';
import { HistoryManager, HistoryState } from '~/lib/ui/HistoryManager';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Metrics } from '~/lib/ui/Metrics';
import { PageLayer, PageLayers } from '~/lib/ui/PageLayer';
import { Rect } from '~/lib/ui/Rect';
import { UiAxis } from '~/lib/ui/UiAxis';
import { UiResult, UiNode } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiRootNode } from '~/lib/ui/UiRootNode';
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
  .fontSize('12pt')
  .textAlign('center')
  .verticalAlign('middle')
  .build();

export const FIELD_STYLE_ENABLE: UiStyle = new UiStyleBuilder()
  .basedOn(FIELD_STYLE)
  .condition('ENABLE')
  .borderColor(Colors.BLUE)
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

type PurgePageFunc = () => void;

type CallbackTask = () => UiResult;

type FocusQueueItem = {
  node: UiNode;
  axis: UiAxis;
};

/**
 * 表示中ページ情報
 */
class LivePage {
  private _pageNode: UiPageNode;
  private _tag: string;
  private _layer: PageLayer;
  private _xAxis: number;
  private _yAxis: number;
  private _focusNode: UiNode | null;
  private _clickNode: UiNode | null;
  private _lastAxis: UiAxis;

  public constructor(pageNode: UiPageNode, tag: string, layer: PageLayer) {
    this._pageNode = pageNode;
    this._tag = tag;
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

  public get tag(): string {
    return this._tag;
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
    let force = !!(axis & UiAxis.FORCE);
    axis &= UiAxis.XY;
    if (oldNode == newNode && !force) {
      return UiResult.IGNORED;
    }
    let result = UiResult.IGNORED;
    let luca: UiNode | null = null;
    let lucaParent: UiNode | null = null;
    if (oldNode != null && newNode != null && !force) {
      luca = oldNode.getLucaNodeWith(newNode);
      lucaParent = luca.parent;
    }
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

  /**
   * アタッチする
   * @param node 対象ノード
   * @returns プッシュ後のアタッチされている数
   */
  public attach(node: UiNode): number {
    this._attaches.push(node);
    return this._attaches.length;
  }

  /**
   * デタッチする
   * @param node 対象ノード
   * @returns デタッチ後のアタッチされている数
   */
  public detach(node: UiNode): number {
    let index = this._attaches.indexOf(node);
    if (index >= 0) {
      this._attaches.splice(index, 1);
    }
    return this._attaches.length;
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
    result &= ~UiResult.EXIT;
    return result;
  }

  public flush(now: number): UiResult {
    let step = 1.0;
    let result = this.task(step);
    this._flags |= RunFlags.EXIT;
    result |= UiResult.AFFECTED;
    result &= ~UiResult.EXIT;
    return result;
  }
}

class TransitMessage {
  private _tag: string;
  private _content: any;
  private _receiverHash: string | null;
  public constructor(tag: string, content: any, receiverHash: string | null) {
    this._tag = tag;
    this._content = content;
    this._receiverHash = receiverHash;
  }
  public get tag(): string {
    return this._tag;
  }
  public get content(): any {
    return this._content;
  }
  public get receiverHash(): string | null {
    return this._receiverHash;
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

  private _syncAfter: boolean;

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

  /** 画面遷移時の受け渡しメッセージリスト */
  private _transitMessages: TransitMessage[];

  /** テキストリソースURL */
  private _textResourceUrl: string | null;

  /** テキストリソース */
  private _textResource: Resource;

  /** ページ履歴 */
  private _history: HistoryManager;

  /** キー履歴 */
  private _keyLogger: KeyLogger;


  /** resetFocus要求リスト */
  private _resetFocusQueue: UiNode[];

  private static _launchCounter: number = 0;

  private _flushingFocusRequest: boolean = false;
  
  private _focusQueue: FocusQueueItem[];

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
    this._syncAfter = true;
    this._wheelScale = DEFAULT_WHEEL_SCALE;
    this._intervalPrecision = DEFAULT_INTERVAL_PRECISION;
    this._animationTime = DEFAULT_ANIMATION_TIME;
    this._longPressTime = DEFAULT_LONG_PRESS_TIME;
    this._finallyTasks = [];
    this._afterTasks = [];
    this._intervalTasks = [];
    this._animationTasks = [];
    this._transitMessages = [];
    this._textResourceUrl = null;
    this._textResource = {};
    this._history = new HistoryManager();
    this._keyLogger = new KeyLogger();
    this._resetFocusQueue = [];
    this._focusQueue = [];
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
    if (!window.requestAnimationFrame) {
      //attempt replace to vender specific implemantation
      let func = this.findVenderRequestAnimationFrame();
      if (func != null) {
        window.requestAnimationFrame = func;
      }
    }
    if (!!window.requestAnimationFrame) {
      const aniFunc = (at: number) => {
        this.processAnimationFrame(at);
        window.requestAnimationFrame(aniFunc);
      };
      window.requestAnimationFrame(aniFunc);
    } else {
      Logs.error('requestAnimationFrame does not implemented');
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
    Logs.info('browser %s', window.navigator.userAgent);
    //初回のロード処理
    this.processHashChanged();
  }

  private findVenderRequestAnimationFrame(): ((callback: FrameRequestCallback) => number) | null {
    let func =
      window['webkitRequestAnimationFrame' as any] ||
      window['mozRequestAnimationFrame' as any] ||
      window['oRequestAnimationFrame' as any] ||
      window['msRequestAnimationFrame' as any] ||
      null;
    if (func != null) {
      return func as unknown as (callback: FrameRequestCallback) => number;
    }
    return null;
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
    //初めてアタッチされたとき
    if (entry.attach(node) == 1) {
      if (entry.dataSource != undefined) {
        entry.dataSource.attach();
      }
    }
  }

  public detachFromDataSource(tag: string, node: UiNode) {
    let entry = this._dataSources[tag];
    if (entry !== undefined) {
      //誰からもアタッチされていない時
      if (entry.detach(node) == 0) {
        if (entry.dataSource != undefined) {
          entry.dataSource.detach();
        }
      }
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
    this.notifyLayerPages(layer, (page) => page.unmountSoon());
    let newPage = factory(state.tag);
    this.call(newPage, state, layer, true, () => this.unmountLayerPages(layer));
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
    this.call(newPage, state, layer, true);
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
      this.unmountPage(pageNode);
    }
    let count = nextIndex - firstIndex;
    if (count > 0) {
      this._pageStack.splice(firstIndex, count);
    }
  }

  private notifyLayerPages(layer: PageLayer, func: (page: UiPageNode) => void): void {
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
      func(pageNode);
    }
  }

  public call(
    pageNode: UiPageNode,
    state: HistoryState,
    layer: PageLayer = PageLayers.NORMAL,
    addWaiting: boolean = false,
    purgeFunc: PurgePageFunc = () => {}
  ): void {
    if (addWaiting) {
      let waitingNode = this.createWaitingPage();
      let waitingPage = this.pushPage(waitingNode, state, PageLayers.HIGHEST, false);
      this.mountPage(waitingNode, state, PageLayers.HIGHEST, waitingPage);
      pageNode.preInitialize(state).then((errorCode) => {
        this.disposeImpl(waitingNode, false);
        purgeFunc();
        if (errorCode == null) {
          let page = this.pushPage(pageNode, state, layer, true);
          this.mountPage(pageNode, state, layer, page);
        } else {
          this.disposeImpl(pageNode, false);
          Logs.error('FATAL PAGE LOADING ERROR');
        }
        this.sync();
      });
    } else {
      purgeFunc();
      let page = this.pushPage(pageNode, state, layer, true);
      this.mountPage(pageNode, state, layer, page);
    }
  }

  private pushPage(
    pageNode: UiPageNode,
    state: HistoryState,
    layer: PageLayer,
    callPageChanged: boolean
  ): LivePage {
    let page = new LivePage(pageNode, state.tag, layer);
    let biggerIndex = this._pageStack.findIndex((e) => e.layer > layer);
    if (biggerIndex >= 0) {
      let afterNode = this._pageStack[biggerIndex].pageNode;
      this._pageStack.splice(biggerIndex, 0, page);
      this.rootNode.insertChild(pageNode, afterNode);
    } else {
      this._pageStack.push(page);
      this.rootNode.appendChild(pageNode);
    }
    if (callPageChanged) {
      this.onPageChanged(layer);
    }
    return page;
  }

  private mountPage(
    pageNode: UiPageNode,
    state: HistoryState,
    layer: PageLayer,
    page: LivePage
  ): void {
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

  private onPageChanged(layer: PageLayer): UiResult {
    let result = UiResult.IGNORED;
    let lastPage = this.getLastPage(layer);
    if (lastPage != null) {
      Logs.warn('OnPageChanged [%s]', lastPage.tag);
      let firstPage = this.getFirstPage(layer);
      let isFirstPage = lastPage == firstPage;
      result |= this.dispatchTransitMessage(lastPage.tag, lastPage.pageNode, isFirstPage);
    }
    return result;
  }

  /**
   * 画面遷移時に受け渡しを行う情報を登録する
   *
   * @param tag 情報タグ
   * @param params 情報引数
   * @param receiverHash 受け取り先画面ハッシュ名（無指定の場合、次の遷移先画面）
   */
  public addTransitMessage(tag: string, params?: any, receiverHash?: string): void {
    let content: any;
    if (params !== undefined) {
      Asserts.require(JSON.stringify(params).length > 0);
      content = params;
    } else {
      content = null;
    }
    let receiver = receiverHash !== undefined ? receiverHash : null;
    this._transitMessages.push(new TransitMessage(tag, content, receiver));
  }

  private dispatchTransitMessage(
    hash: string,
    pageNode: UiPageNode,
    isFirstPage: boolean
  ): UiResult {
    let result = UiResult.IGNORED;
    let [matched, another] = Arrays.divide(
      this._transitMessages,
      (e) => e.receiverHash == null || e.receiverHash == hash
    );
    for (let m of matched) {
      result |= pageNode.onTransitMessage(m.tag, m.content);
    }
    this._transitMessages.splice(0);
    if (!isFirstPage && another.length > 0) {
      another.forEach((e) => this._transitMessages.push(e));
    }
    return result;
  }

  public dispose(pageNode: UiPageNode): void {
    this.disposeImpl(pageNode, true);
  }

  private disposeImpl(pageNode: UiPageNode, callPageChanged: boolean): void {
    let index = this.getLivePageIndex(pageNode);
    if (index < 0) {
      return;
    }
    let layer = this._pageStack[index].layer;
    this.unmountPage(pageNode);
    this._pageStack.splice(index, 1);
    if (callPageChanged) {
      this.onPageChanged(layer);
    }
  }

  private unmountPage(pageNode: UiPageNode): void {
    pageNode.onUnmount();
    this.rootNode.removeChild(pageNode);
    this.cancelAfterTasksIn(pageNode);
    this.cancelIntervalTasksIn(pageNode);
    this.cancelAnimationTasksIn(pageNode);
  }

  protected createWaitingPage(): UiPageNode {
    return new UiBlankPageNode(this, '__blank__');
  }

  public isFocusable(e: UiNode): boolean {
    return e.visible && e.enable && e.focusable;
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
      if (!node.visible) {
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
      newFocus = newFocus.adjustFocus(newFocus, 0);
      page.doFocus(newFocus);
    }
    return newFocus != null;
  }

  public setFocus(node: UiNode, axis: UiAxis = UiAxis.XY): UiResult {
    let page = this.getLivePageOf(node);
    let result = UiResult.IGNORED;
    if (page != null) {
      this._focusQueue.push({
        node: node,
        axis: axis,
      });
      if (!this._flushingFocusRequest) {
        this._flushingFocusRequest = true;
        while (this._focusQueue.length > 0) {
          let que = this._focusQueue;
          this._focusQueue = [];
          for (let item of que) {
            page.doFocus(item.node, item.axis);
          }
        }
        this._flushingFocusRequest = false;
        result |= UiResult.AFFECTED;
      }
    }
    return result;
  }

  public postResetFocus(node: UiNode) {
    this._resetFocusQueue.push(node);
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

  private getFirstPage(layer: PageLayer): LivePage | null {
    let firstIndex = this._pageStack.findIndex((e) => e.layer == layer);
    if (firstIndex == -1) {
      return null;
    }
    return this._pageStack[firstIndex];
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

  private flushPostedResetFocus() {
    if (this._resetFocusQueue.length > 0) {
      for (let node of this._resetFocusQueue) {
        this.resetFocus(node);
      }
      this._resetFocusQueue.splice(0);
    }
  }

  public sync() {
    this.rootNode.sync();
    this._busy = true;
  }

  public runFinally(task: RunFinallyTask): void {
    this._finallyTasks.push(task);
  }

  public runCallback(func: CallbackTask) {
    let result = func();
    this.postProcessEvent(null, result);
  }

  public syncAfterFinally() {
    this._syncAfter = true;
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

  public isAnimatingNode(node: UiNode): boolean {
    return this._animationTasks.find((e) => e.node == node) !== undefined;
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

  private flushAnimationTask(): UiResult {
    let result: UiResult = UiResult.IGNORED;
    let at: number = this.newTimestamp();
    for (let e of this._animationTasks.filter((e) => !e.repeat)) {
      result |= e.flush(at);
    }
    this.cancelAnimationTasksIfExit();
    return result;
  }

  private processAnimationFrame(at: number): void {
    let result: UiResult = this._syncAfter ? UiResult.AFFECTED : UiResult.IGNORED;
    this._syncAfter = false;
    let hadAnimation = this.hasOneshotAnimation();
    let hasAnimation = false;
    try {
      for (let e of this._animationTasks) {
        result |= e.run(at);
      }
      this.cancelAnimationTasksIfExit();
      hasAnimation = this.hasOneshotAnimation();
      if (hadAnimation && !hasAnimation) {
        result |= this.recoverFocus();
      }
      //後処理
      this.postProcessEvent(null, result);
    } finally {
      this.flushFinally();
    }
    this._busy = false;
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
      let result: UiResult = UiResult.IGNORED;
      // アニメーション実行タスク処理
      result |= this.flushAnimationTask();
      //イベント情報取得
      let key = this.getKeyCode(evt);
      let ch = this.getCharCode(evt);
      let mod = this.getKeyModifier(evt);
      let at = evt.timeStamp;
      Logs.info('keyDown key=0x%x ch=0x%x mod=0x%x', key, ch, mod);
      this._keyLogger.logKeyDown(key, at);
      if (at - this._keyLogger.getLastDownAt(key) > this._longPressTime) {
        mod |= KeyCodes.MOD_LONG_PRESS;
      }
      //UINodeへのキーディスパッチ
      let depth = this._pageStack.length;
      for (let i = depth - 1; i >= 0; i--) {
        let page = this._pageStack[i];
        let target = page.focusOrPage;
        let node: UiNode | null = target;
        while (node != null) {
          result |= node.onKeyDown(target, key, ch, mod, at);
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
          result |= this.onKeyDown(target, key, ch, mod, at);
        }
      }
      // フォーカス処理
      this.flushPostedResetFocus();
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processKeyPress(evt: KeyboardEvent): void {
    try {
      //イベント情報取得
      let key = this.getKeyCode(evt);
      let ch = this.getCharCode(evt);
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
          result |= node.onKeyPress(target, key, ch, mod, at);
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
          result |= this.onKeyPress(target, key, ch, mod, at);
        }
      }
      // フォーカス処理
      this.flushPostedResetFocus();
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private processKeyUp(evt: KeyboardEvent): void {
    try {
      //イベント情報取得
      let key = this.getKeyCode(evt);
      let ch = this.getCharCode(evt);
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
          result |= node.onKeyUp(target, key, ch, mod, at);
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
          result |= this.onKeyUp(target, key, ch, mod, at);
        }
      }
      // フォーカス処理
      this.flushPostedResetFocus();
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  protected getKeyCode(evt: KeyboardEvent): number {
    return evt.keyCode;
  }

  protected getCharCode(evt: KeyboardEvent): number {
    return evt.charCode;
  }

  protected getKeyModifier(evt: KeyboardEvent): number {
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
      let result: UiResult = UiResult.IGNORED;
      // アニメーション実行タスク処理
      result |= this.flushAnimationTask();
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      //Logs.info("mouseMove x=%d y=%d mod=0x%x", x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      result |= node.onMouseMove(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseMove(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseMove(target, pt.x, pt.y, mod, at);
      }
      // フォーカス処理
      this.flushPostedResetFocus();
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
      let result: UiResult = UiResult.IGNORED;
      // アニメーション実行タスク処理
      result |= this.flushAnimationTask();
      let x = evt.clientX;
      let y = evt.clientY;
      let mod = this.getMouseModifier(evt);
      let at = evt.timeStamp;
      Logs.info('mouseDown x=%d y=%d mod=0x%x', x, y, mod);
      let pt: Rect = new Rect().locate(x, y, 1, 1);
      let target: UiNode = this.getMouseTarget(pt);
      let node: UiNode = target;
      result |= node.onMouseDown(target, pt.x, pt.y, mod, at);
      while (!(result & UiResult.CONSUMED) && node.parent != null) {
        node.translate(pt, +1);
        node = node.parent;
        result |= node.onMouseDown(target, pt.x, pt.y, mod, at);
      }
      if (!(result & UiResult.CONSUMED)) {
        result |= this.onMouseDown(target, pt.x, pt.y, mod, at);
      }
      // フォーカス処理
      this.flushPostedResetFocus();
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
      // フォーカス処理
      this.flushPostedResetFocus();
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
      // フォーカス処理
      this.flushPostedResetFocus();
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
      // フォーカス処理
      this.flushPostedResetFocus();
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
      // フォーカス処理
      this.flushPostedResetFocus();
      //後処理
      this.postProcessEvent(evt, result);
    } finally {
      this.flushFinally();
    }
  }

  private getMouseModifier(evt: MouseEvent): number {
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
      let result: UiResult = UiResult.IGNORED;
      // アニメーション実行タスク処理
      result |= this.flushAnimationTask();
      let at = evt.timeStamp;
      let docElement = document.documentElement;
      let w = docElement.clientWidth;
      let h = docElement.clientHeight;
      Logs.info('resize width=%d height=%d at %d', w, h, at);
      this._clientWidth = w;
      this._clientHeight = h;
      result |= this.rootNode.onResize(at);
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

  public exitApplication(): void {
    this._history.exit();
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

  protected postProcessEvent(evt: Event | null, result: UiResult): void {
    if (result & UiResult.AFFECTED) {
      this.sync();
    }
    if (result & UiResult.CONSUMED) {
      if (evt != null && !(evt instanceof WheelEvent)) {
        evt.preventDefault();
      }
    }
  }

  public newTimestamp(): number {
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
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().right <= tRect.left, key);
        axis = UiAxis.X;
        break;
      case KeyCodes.RIGHT:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().left >= tRect.right, key);
        axis = UiAxis.X;
        break;
      case KeyCodes.UP:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().bottom <= tRect.top, key);
        axis = UiAxis.Y;
        break;
      case KeyCodes.DOWN:
        next = this.getNearestNode(curr, from, (c) => c.getRectOnRoot().top >= tRect.bottom, key);
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
      case KeyCodes.BACKSPACE:
        result |= this.disposePopup(curr);
        break;
      default:
        break;
    }
    if (next != null) {
      next.focusing = true;
      let adjusted = next.adjustFocus(curr, key);
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

  private disposePopup(curr: UiNode): UiResult {
    let page = this.getLivePageOf(curr);
    let result = UiResult.IGNORED;
    if (page != null) {
      let firstPage = this.getFirstPage(page.layer);
      if (page != firstPage) {
        this.disposeImpl(page.pageNode, true);
        result = UiResult.EATEN;
      }
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

  public getNearestNode(
    curr: UiNode,
    from: UiNode,
    filter: Predicate<UiNode>,
    key: number
  ): UiNode | null {
    let candidates = from.getFocusableDescendantsIf((c) => {
      let result = false;
      if (c != curr && this.isFocusable(c) && filter(c) && curr.canMoveFocus(c)) {
        let blocker = c.getBlockerNode();
        let luca = c.getLucaNodeWith(curr);
        result = blocker == null || blocker == luca || blocker.isAncestorOf(luca);
      }
      return result;
    });
    let page = this.getLivePageOf(curr) as LivePage;
    let policy = curr.getFocusingPolicy();
    if (policy == 'direction' && KeyCodes.isArrowKey(key)) {
      let weight = key == KeyCodes.LEFT || key == KeyCodes.RIGHT ? [65536, 1] : [1, 65536];
      return this.getNearestBy(
        curr,
        candidates,
        (r) => r.distance(page.xAxis, r.y) * weight[0] + r.distance(r.x, page.yAxis) * weight[1]
      );
    } else {
      return this.getNearestBy(curr, candidates, (r) => r.distance(page.xAxis, page.yAxis));
    }
  }
  private getNearestBy(
    curr: UiNode,
    candidates: UiNode[],
    distanceFunc: (r: Rect) => number
  ): UiNode | null {
    let page = this.getLivePageOf(curr) as LivePage;
    let next: UiNode | null = null;
    let minDegree = 0;
    let minDistance = 0;
    for (let c of candidates) {
      let luca = c.getLucaNodeWith(curr);
      let degree: number = curr.getDegree(luca);
      let cRect = c.getRectOnRoot();
      let distance = distanceFunc(cRect);
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
