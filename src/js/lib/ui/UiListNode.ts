import { FIELD_SELECTED, SelectionManager } from './SelectionManager';
import { UiAxis } from './UiAxis';
import { UiButton } from './UiButton';
import { Arrays, Asserts, Logs, ParamError, Predicate, Value } from '~/lib/lang';
import { Colors } from '~/lib/ui/Colors';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { Rect } from '~/lib/ui/Rect';
import { Scrollable } from '~/lib/ui/Scrollable';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';
import { Flags, UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiScrollNode, UiScrollNodeSetter } from '~/lib/ui/UiScrollNode';
import { UiStyle, UiStyleBuilder } from '~/lib/ui/UiStyle';

/**
 * レコードノード用スタイル
 */
const RECORD_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.TRANSPARENT)
  .borderSize('0px')
  .build();

/**
 * マージン定数
 */
const LINE_MARGIN = 3;

class FocusInfo {
  public readonly recordIndex: number;
  public readonly fieldIndex: number;
  public constructor(rec: number, fld: number) {
    this.recordIndex = rec;
    this.fieldIndex = fld;
  }
}

/**
 * メッセージノード
 */
export class UiListMessage extends UiNode {
  private _errorCode: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiListMessage {
    return new UiListMessage(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  public constructor(app: UiApplication, name: string, errorCode?: number);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  public constructor(src: UiListMessage);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string, errorCode?: number) {
    if (param instanceof UiListMessage) {
      super(param as UiListMessage);
      let src = param as UiListMessage;
      this._errorCode = src._errorCode;
    } else {
      super(param as UiApplication, name as string);
      this._errorCode = errorCode !== undefined ? errorCode : 0;
    }
  }

  public get errorCode(): number {
    return this._errorCode;
  }

  protected get owner(): UiListNode {
    return this.parent as UiListNode;
  }
}

/**
 * アイテムノード
 */
export class UiListItem extends UiButton implements RecordHolder {
  private _index: number;

  private _record: DataRecord | null;

  private _sharedNames: Set<string>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiListItem {
    return new UiListItem(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  public constructor(app: UiApplication, name: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  public constructor(src: UiListItem);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiListItem) {
      super(param as UiListItem);
      let src = param as UiListItem;
      this._index = src._index;
      this._record = src._record;
      this._sharedNames = src._sharedNames;
    } else {
      super(param as UiApplication, name as string);
      this._index = 0;
      this._record = null;
      this._sharedNames = new Set<string>();
    }
  }

  public prepare(): void {
    this.collectSharedNames(this._sharedNames);
  }

  private collectSharedNames(sharedNames: Set<string>): Set<string> {
    let names = new Set<string>();
    for (let t of this.getDescendants()) {
      let name = t.name;
      if (names.has(name)) {
        sharedNames.add(name);
      } else {
        names.add(name);
      }
    }
    return sharedNames;
  }

  public get index(): number {
    return this._index;
  }

  public setIndex(newIndex: number, forceReload: boolean): void {
    if (this._index == newIndex && !forceReload) {
      return;
    }
    this._index = newIndex;
    this._record = newIndex < 0 ? null : this.owner.getRecord(newIndex);
    this.fireRecordHolderChanged();
  }

  public getValue(name: string): Value | DataRecord | null {
    if (this._record == null) {
      return null;
    }
    let value = this._record[name];
    return value === undefined ? null : value;
  }

  public setValue(name: string, value: Value | DataRecord | null): void {
    if (this._record == null) {
      return;
    }
    if (this._record[name] != value) {
      this._record[name] = value;
      if (this._sharedNames.has(name)) {
        this.fireRecordHolderChanged((e) => e.dataFieldName == name);
      }
      this.owner.setRecord(this._record);
    }
  }

  public getRecord(): DataRecord | null {
    return this._record;
  }

  public setRecord(rec: DataRecord): void {
    this._record = rec;
    this.owner.setRecord(this._record);
  }

  protected get owner(): UiListNode {
    return this.parent as UiListNode;
  }

  public getPathSegment(): string {
    return '' + this.getRelativeIndex();
  }

  private getRelativeIndex(): number {
    return this.owner.getIndexOfChild(this);
  }

  protected getWrappedRect(): Rect {
    if (this.owner.outerMargin) {
      return super.getWrappedRect();
    }
    return new Rect(this.getRect());
  }

  public fireRecordHolderChanged(filter: Predicate<UiNode> = (e) => true): void {
    if (this._record != null && this.owner.selectionManager != null) {
      this._record[FIELD_SELECTED] = this.owner.isSelectedRecord(this._record);
    }
    for (let c of this.getDescendantsIf((e) => filter(e))) {
      c.onRecordHolderChanged(this);
    }
  }

  public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
    if (gained && this._record != null) {
      return this.owner.onRecordSelected(this._record);
    }
    return UiResult.IGNORED;
  }

  /**
   * 基底クラス（UiButton）でボタンが押下された時に呼ばれるメソッド
   */
  protected doAction(): UiResult {
    if (this._record != null) {
      return this.owner.onRecordClicked(this._record);
    } else {
      return UiResult.IGNORED;
    }
  }
}

/**
 * UiListNodeのセッター
 */
export class UiListNodeSetter extends UiScrollNodeSetter {
  public static readonly INSTANCE = new UiListNodeSetter();
  public loop(value: boolean): this {
    let node = this.node as UiListNode;
    node.loop = value;
    return this;
  }

  public vertical(value: boolean): this {
    let node = this.node as UiListNode;
    node.vertical = value;
    return this;
  }

  public outerMargin(value: boolean): this {
    let node = this.node as UiListNode;
    node.outerMargin = value;
    return this;
  }

  public selectionManager(manager: SelectionManager<string>): this {
    let node = this.node as UiListNode;
    node.selectionManager = manager;
    return this;
  }
}

/**
 * 垂直及び水平の仮想データリストノード
 */
export class UiListNode extends UiScrollNode implements HasSetter<UiListNodeSetter> {
  /** 読み込み中状態名（兼メッセージテンプレート名） */
  public static readonly STATE_LOADING = 'loading';

  /** データ無し状態名（兼メッセージテンプレート名） */
  public static readonly STATE_EMPTY = 'empty';

  /** データ読み込みエラー状態名（兼メッセージテンプレート名） */
  public static readonly STATE_ERROR = 'error';

  /** 通常表示状態名 */
  public static readonly STATE_LIST = 'list';

  /** 項目中で決定が押下された場合に送付されるアクションのタグ名 */
  public static readonly EVENT_TAG_CLICK = 'click';

  /** 項目が選択された場合に送付されるアクションのタグ名 */
  public static readonly EVENT_TAG_SELECT = 'select';

  private _state: string;

  private _template: UiListItem | null;

  private _templateRect: Rect | null;

  private _templateBottom: number | null;

  private _templateRight: number | null;

  private _messages: UiListMessage[];

  private _lineSize: number;

  private _pageSize: number;

  private _columnCount: number;

  private _linesPerPage: number;

  private _pageTopIndex: number;

  private _dataSource: DataSource | null;

  private _selectionManager: SelectionManager<string> | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiListNode {
    return new UiListNode(this);
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
  constructor(src: UiListNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiListNode) {
      super(param as UiListNode);
      let src = param as UiListNode;
      this._state = src._state;
      this._template = src._template;
      this._templateRect = src._templateRect;
      this._templateBottom = src._templateBottom;
      this._templateRight = src._templateRight;
      this._messages = src._messages;
      this._lineSize = src._lineSize;
      this._pageSize = src._pageSize;
      this._columnCount = src._columnCount;
      this._linesPerPage = src._linesPerPage;
      this._pageTopIndex = src._pageTopIndex;
      this._dataSource = src._dataSource;
      this._selectionManager = src._selectionManager;
    } else {
      super(param as UiApplication, name as string);
      this.initFlags(Flags.LIST_INITIAL);
      this._state = '';
      this._template = null;
      this._templateRect = null;
      this._templateBottom = null;
      this._templateRight = null;
      this.vertical = true;
      this._messages = [];
      this._lineSize = 0;
      this._pageSize = 0;
      this._columnCount = 1;
      this._linesPerPage = 0;
      this._pageTopIndex = 0;
      this._dataSource = null;
      this._selectionManager = null;
    }
  }

  public getSetter(): UiListNodeSetter {
    return UiListNodeSetter.INSTANCE;
  }

  public get vertical(): boolean {
    return this.getFlag(Flags.VERTICAL);
  }

  public set vertical(on: boolean) {
    this.setFlag(Flags.VERTICAL, on);
  }

  public get loop(): boolean {
    return this.getFlag(Flags.LOOP);
  }

  public set loop(on: boolean) {
    this.setFlag(Flags.LOOP, on);
  }

  public get outerMargin(): boolean {
    return this.getFlag(Flags.OUTER_MARGIN);
  }

  public set outerMargin(on: boolean) {
    this.setFlag(Flags.OUTER_MARGIN, on);
  }

  public get selectionManager(): SelectionManager<string> | null {
    return this._selectionManager;
  }

  public set selectionManager(manager: SelectionManager<string> | null) {
    this._selectionManager = manager;
  }

  private itemFocusable(): boolean {
    if (this._template != null) {
      let app = this.application;
      let t = this._template;
      return t.getFocusableDescendantsIf((e) => app.isFocusable(e), 1).length > 0;
    }
    return false;
  }

  public count(): number {
    return this._dataSource != null ? this._dataSource.count() : -1;
  }

  public getRecord(index: number): DataRecord | null {
    return this._dataSource != null ? this._dataSource.getRecord(index) : null;
  }

  public setRecord(rec: DataRecord): void {
    if (this._dataSource != null) {
      this._dataSource.update(rec);
    }
  }

  protected initialize(): void {
    this._template = this.makeTemplate();
    this._template.focusable = !this.itemFocusable();
    this.changeState(UiListNode.STATE_LOADING);
  }

  protected changeState(state: string, errorCode: number = 0): void {
    if (this._state != state) {
      this.removeChildren();
      if (state == UiListNode.STATE_LIST) {
        this.prepareArea();
        this.prepareRecs();
        this.relocateRecs();
        this.renumberRecs(true);
        this.setRecsVisiblity();
        this._state = state;
      } else {
        this.scrollLeft = '0px';
        this.scrollTop = '0px';
        this.scrollWidth = null;
        this.scrollHeight = null;
        let t: UiListMessage | null = null;
        if (state == UiListNode.STATE_ERROR) {
          for (let c of this._messages.filter((e) => e.name == state)) {
            if (c.errorCode == errorCode) {
              t = c;
              break;
            } else if (c.errorCode == 0) {
              t = c;
            }
          }
        } else {
          t = Arrays.first(this._messages.filter((e) => e.name == state));
        }
        if (t != null) {
          this.appendChild(t.clone());
          this._state = state;
        }
      }
    }
  }

  public beforeMount(): void {
    this.measureSize();
  }

  public onResize(at: number): UiResult {
    super.onResize(at);
    Asserts.assume(this._templateRect != null);
    if (this._templateRight != null) {
      this._templateRect.width = this.innerWidth - this._templateRight - this._templateRect.x;
    }
    if (this._templateBottom != null) {
      this._templateRect.height = this.innerHeight - this._templateBottom - this._templateRect.y;
    }
    this.measureSize();
    return UiResult.AFFECTED;
  }

  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    if (tag != this.dataSourceName) {
      return UiResult.IGNORED;
    }
    let app = this.application;
    let info: FocusInfo | null;
    if (this.count() < 0) {
      //最初の通知
      info = null;
      this._dataSource = ds;
      if (ds.hasError()) {
        this.changeState(UiListNode.STATE_ERROR, ds.getErrorCode());
        return UiResult.EATEN;
      }
      if (ds.count() == 0) {
        this.changeState(UiListNode.STATE_EMPTY);
        return UiResult.EATEN;
      }
      let attention = Math.max(0, ds.attention());
      this._pageTopIndex = this.validateIndex(attention);
      this.changeState(UiListNode.STATE_LIST);
    } else {
      //二回目以降の通知
      if (this._state != UiListNode.STATE_LIST) {
        return UiResult.IGNORED;
      }
      info = this.saveFocus();
      this._pageTopIndex = this.validateIndex(this._pageTopIndex);
    }
    this.adjustScroll();
    this.renumberRecs(true);
    this.setRecsVisiblity();
    //フォーカス処理
    if (this.focusable && app.getFocusOf(this) == this) {
      //リスト表示前の処理
      if (ds.getRecord(this._pageTopIndex) != null) {
        //データ到着時、フォーカスを設定
        let attention = Math.max(0, ds.attention());
        let delta = attention - this._pageTopIndex;
        let rec = this._children[LINE_MARGIN * this._columnCount + delta];
        let field = this.findFirstField(rec);
        app.resetFocus(field != null ? field : rec);
      }
    } else {
      //リスト表示後の処理（フォーカスリカバリ）
      this.restoreFocus(info);
    }
    this.fireHScroll();
    this.fireVScroll();
    return UiResult.EATEN;
  }

  private saveFocus(): FocusInfo | null {
    let app = this.application;
    let focus = app.getFocusOf(this);
    if (focus != null && focus != this && this.isAncestorOf(focus)) {
      let rec = this.getListItemOf(focus);
      if (rec != null) {
        let recIndex = this._children.indexOf(rec);
        let fldIndex = rec.getDescendantIndex(focus);
        if (recIndex >= 0 && fldIndex >= 0) {
          return new FocusInfo(recIndex, fldIndex);
        }
      }
    }
    return null;
  }

  private restoreFocus(info: FocusInfo | null): void {
    if (info == null) {
      return;
    }
    for (let i = info.recordIndex; i >= 0; i--) {
      let rec = this._children[i];
      if (rec.visible) {
        let restore = rec.getDescendantAt(info.fieldIndex);
        if (restore != null) {
          let axis = UiAxis.FORCE | (this.vertical ? UiAxis.Y : UiAxis.X);
          this.application.setFocus(restore, axis);
        }
        break;
      }
    }
  }

  public getListItemOf(node: UiNode): UiListItem | null {
    let e: UiNode | null = node;
    while (e != null && !(e instanceof UiListItem)) {
      e = e.parent;
    }
    return e != null ? (e as UiListItem) : null;
  }

  private makeTemplate(): UiListItem {
    let items: UiListItem[] = [];
    let messages: UiListMessage[] = [];
    let legacyCount = 0;
    for (let c of this._children) {
      if (c instanceof UiListItem) {
        items.push(c as UiListItem);
      } else if (c instanceof UiListMessage) {
        messages.push(c as UiListMessage);
      } else {
        legacyCount++;
      }
    }
    let template: UiListItem;
    if (legacyCount > 0 && items.length == 0 && messages.length == 0) {
      template = new UiListItem(this.application, 'template');
      this.buildTemplates(template, true);
    } else if (legacyCount == 0 && items.length > 0) {
      template = items[0];
      this.buildTemplates(template, false);
      this._messages = messages;
    } else {
      throw new ParamError('ILLEGAL LAYOUT');
    }
    template.prepare();
    Asserts.ensure(this.getChildCount() == 0);
    return template;
  }

  private buildTemplates(template: UiListItem, legacy: boolean): void {
    let source = legacy ? this : template;
    let rTemplate = source.getChildrenRect();
    let maxRight = 0;
    let maxBottom = 0;
    for (let c of source.getChildren()) {
      let r = c.getRect();
      if (c.right != null) {
        maxRight = Math.max(maxRight, r.right);
      }
      if (c.bottom != null) {
        maxBottom = Math.max(maxBottom, r.bottom);
      }
    }
    this._templateRect = rTemplate;
    if (this.vertical) {
      this._templateBottom = rTemplate.bottom == maxBottom ? this.innerHeight - maxBottom : null;
      template.left = '0px';
      template.right = '0px';
      template.top = `${rTemplate.top}px`;
      template.height = `${rTemplate.height}px`;
      for (let c of source.getChildren()) {
        let rChild = c.getRect();
        if (c.top != null) {
          c.top = `${rChild.top - rTemplate.top}px`;
        }
      }
    } else {
      this._templateRight = rTemplate.right == maxRight ? this.innerWidth - maxRight : null;
      template.left = `${rTemplate.left}px`;
      template.width = `${rTemplate.width}px`;
      template.top = '0px';
      template.bottom = '0px';
      for (let c of source.getChildren()) {
        let rChild = c.getRect();
        if (c.left != null) {
          c.left = `${rChild.left - rTemplate.left}px`;
        }
      }
    }
    if (legacy) {
      template.adoptChildren(this);
    } else {
      this.removeChildren();
    }
  }

  protected getTemplateRect(): Rect {
    Asserts.assume(this._templateRect != null);
    return this._templateRect as Rect;
  }

  protected measureSize(): void {
    let rTemplate = this.getTemplateRect();
    if (this.vertical) {
      this._lineSize = rTemplate.top + rTemplate.height;
      this._pageSize = this.innerHeight;
    } else {
      this._lineSize = rTemplate.left + rTemplate.width;
      this._pageSize = this.innerWidth;
    }
    this._linesPerPage = Math.ceil(this._pageSize / this._lineSize);
  }

  protected prepareArea(): void {
    let rTemplate = this.getTemplateRect();
    let n = this._linesPerPage + LINE_MARGIN * 2;
    if (this.vertical) {
      let extraMargin = !this.outerMargin ? rTemplate.top : 0;
      this.scrollLeft = '0px';
      this.scrollTop = `${this._lineSize * LINE_MARGIN + extraMargin}px`;
      this.scrollWidth = '0px';
      this.scrollHeight = `${this._lineSize * n + rTemplate.top}px`;
    } else {
      let extraMargin = !this.outerMargin ? rTemplate.left : 0;
      this.scrollLeft = `${this._lineSize * LINE_MARGIN + extraMargin}px`;
      this.scrollTop = '0px';
      this.scrollWidth = `${this._lineSize * n + rTemplate.left}px`;
      this.scrollHeight = '0px';
    }
  }

  protected prepareRecs(): void {
    Asserts.assume(this._template != null);
    let m = this._children.length;
    let n = (this._linesPerPage + LINE_MARGIN * 2) * this._columnCount;
    if (m < n) {
      for (let i = m; i < n; i++) {
        let rec = this._template.clone();
        this.appendChild(rec);
      }
    } else if (m > n) {
      for (let i = m - 1; i >= n; i--) {
        this.removeChildAt(i);
      }
    }
  }

  protected relocateRecs(): void {
    Asserts.assume(this._template != null);
    let n = this._children.length;
    let r = this.getTemplateRect();
    if (this.vertical) {
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiListItem;
        let y = r.top + i * (r.top + r.height);
        rec.top = `${y}px`;
        rec.bottom = null;
        rec.height = `${r.height}px`;
      }
    } else {
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiListItem;
        let x = r.left + i * (r.left + r.width);
        rec.left = `${x}px`;
        rec.right = null;
        rec.width = `${r.width}px`;
      }
    }
  }

  protected validateIndex(index: number): number {
    let count = Math.max(0, this.count());
    let limit = 0;
    if (this.loop && count >= this._linesPerPage * this._columnCount) {
      limit = count - 1;
    } else {
      limit = Math.max(0, count - this._linesPerPage * this._columnCount);
    }
    return Math.min(Math.max(0, index), limit);
  }

  private adjustScroll() {
    Asserts.assume(this._templateRect != null);
    let count = this.count();
    if (count < this._linesPerPage * this._columnCount) {
      let margin = this._lineSize * LINE_MARGIN;
      if (this.vertical) {
        let extraMargin = !this.outerMargin ? this._templateRect.top : 0;
        this.scrollTop = `${margin + extraMargin}px`;
      } else {
        let extraMargin = !this.outerMargin ? this._templateRect.left : 0;
        this.scrollLeft = `${margin + extraMargin}px`;
      }
    }
  }

  protected renumberRecs(forceReload: boolean): void {
    let n = this._children.length;
    let count = this.count();
    if (count <= 0) {
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiListItem;
        rec.setIndex(-1, forceReload);
      }
    } else {
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiListItem;
        let index = (this._pageTopIndex - LINE_MARGIN * this._columnCount + i + count) % count;
        rec.setIndex(index, forceReload);
      }
    }
  }

  protected setRecsVisiblity(): void {
    let n = this._children.length;
    let count = Math.max(0, this.count());
    if (this.loop && count >= this._linesPerPage * this._columnCount) {
      // ループスクロール時は全件表示
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiListItem;
        rec.visible = true;
      }
    } else {
      // 論理データ範囲外は非表示
      let sp = Math.max(0, LINE_MARGIN * this._columnCount - this._pageTopIndex);
      let ep = Math.min(n, LINE_MARGIN * this._columnCount - this._pageTopIndex + count);
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiListItem;
        rec.visible = sp <= i && i < ep;
      }
    }
  }

  public getFocusableChildrenIf(
    filter: Predicate<UiNode>,
    limit: number,
    list: UiNode[]
  ): UiNode[] {
    if (!(this.hasFocus() || this.focusing)) {
      if (filter(this)) {
        list.push(this);
      }
      return list;
    } else {
      return super.getFocusableChildrenIf(filter, limit, list);
    }
  }

  public adjustFocus(prev: UiNode, key: number): UiNode {
    let app = this.application;
    if (this._state == UiListNode.STATE_LIST) {
      if (this.focusLock || prev == this) {
        let firstRec = this._children[LINE_MARGIN];
        let firstField = this.findFirstField(firstRec);
        if (firstField != null) {
          return firstField;
        }
      } else {
        let nearest = app.getNearestNode(prev, this, (e) => e != this, key);
        if (nearest != null) {
          Logs.debug('nearest from %s is %s', prev.getNodePath(), nearest.getNodePath());
          return nearest;
        }
      }
    }
    return this;
  }

  private findFirstField(firstRec: UiNode): UiNode | null {
    let app = this.application;
    let list = firstRec.getFocusableDescendantsIf((e) => app.isFocusable(e), 1);
    if (list.length > 0) {
      return list[0];
    }
    return null;
  }

  public scrollFor(target: UiNode, animationTime?: number): UiResult {
    Asserts.require(target.parent == this);
    let result: UiResult = UiResult.IGNORED;
    if (!this.focusLock || this._pageTopIndex >= this.count() - this._linesPerPage) {
      result = this.scrollIfNecessary(target, animationTime);
    } else {
      let nextRec = this.getListItemOf(target) as UiListItem;
      let delta = nextRec.index - this._pageTopIndex;
      let dx = this._lineSize * (this.vertical ? 0 : delta);
      let dy = this._lineSize * (this.vertical ? delta : 0);
      if (dx != 0 || dy != 0) {
        return this.scrollInside(dx, dy, animationTime);
      }
    }
    return result;
  }

  protected setScroll(x: number, y: number, step: number): void {
    super.setScroll(x, y, step);
    if (step >= 1.0) {
      if (this.vertical) {
        this.slideVertical(0);
      } else {
        this.slideHorizontal(0);
      }
    }
  }

  protected slideVertical(dy: number): UiResult {
    let scroll = this.getScrollRect();
    let margin = this._lineSize * LINE_MARGIN;
    let y = scroll.y + dy;
    let result = UiResult.IGNORED;
    let count = this.count();
    let index = this._pageTopIndex;
    while (y < margin) {
      for (let i = 0; i < this._columnCount; i++) {
        this.rotateChildrenRight();
      }
      y += this._lineSize;
      index = (index - this._columnCount + count) % count;
    }
    while (scroll.height - (y + this._pageSize) < margin) {
      for (let i = 0; i < this._columnCount; i++) {
        this.rotateChildrenLeft();
      }
      y -= this._lineSize;
      index = (index + this._columnCount + count) % count;
    }
    if (this._pageTopIndex != index) {
      this._pageTopIndex = index;
      this.renumberRecs(false);
      result |= UiResult.AFFECTED;
    }
    if (y != scroll.y) {
      this.scrollTop = `${y}px`;
      this.relocateRecs();
      this.setRecsVisiblity();
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  protected slideHorizontal(dx: number): UiResult {
    let scroll = this.getScrollRect();
    let margin = this._lineSize * LINE_MARGIN;
    let x = scroll.x + dx;
    let result = UiResult.IGNORED;
    let count = this.count();
    let index = this._pageTopIndex;
    while (x < margin) {
      for (let i = 0; i < this._columnCount; i++) {
        this.rotateChildrenRight();
      }
      x += this._lineSize;
      index = (index - this._columnCount + count) % count;
    }
    while (scroll.width - (x + this._pageSize) < margin) {
      for (let i = 0; i < this._columnCount; i++) {
        this.rotateChildrenLeft();
      }
      x -= this._lineSize;
      index = (index + this._columnCount + count) % count;
    }
    if (this._pageTopIndex != index) {
      this._pageTopIndex = index;
      this.renumberRecs(false);
      result |= UiResult.AFFECTED;
    }
    if (x != scroll.x) {
      this.scrollLeft = `${x}px`;
      this.relocateRecs();
      this.setRecsVisiblity();
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  public onVScroll(source: Scrollable, offset: number, limit: number, count: number): void {
    if (limit != this._pageSize) {
      offset = Math.round((offset * this._pageSize) / limit);
      count = Math.round((count * this._pageSize) / limit);
    }
    let newIndex = this.validateIndex(Math.floor(offset / this._lineSize));
    let delta = this.getScrollDelta(newIndex, this._pageTopIndex);
    if (offset % this._lineSize == 0 && Math.abs(delta) == 1) {
      this.scrollRecord(delta);
    } else {
      this._pageTopIndex = newIndex;
      this.adjustScroll();
      this.renumberRecs(true);
      this.setRecsVisiblity();
      let remain = (offset % this._lineSize) + LINE_MARGIN * this._lineSize;
      this.scrollTop = `${remain}px`;
    }
  }

  public onHScroll(source: Scrollable, offset: number, limit: number, count: number): void {
    if (limit != this._pageSize) {
      offset = Math.round((offset * this._pageSize) / limit);
      count = Math.round((count * this._pageSize) / limit);
    }
    let newIndex = this.validateIndex(Math.floor(offset / this._lineSize));
    let delta = this.getScrollDelta(newIndex, this._pageTopIndex);
    if (offset % this._lineSize == 0 && Math.abs(delta) == 1) {
      this.scrollRecord(delta);
    } else {
      this._pageTopIndex = newIndex;
      this.adjustScroll();
      this.renumberRecs(true);
      this.setRecsVisiblity();
      let remain = (offset % this._lineSize) + LINE_MARGIN * this._lineSize;
      this.scrollLeft = `${remain}px`;
    }
  }

  private getScrollDelta(newIndex: number, oldIndex: number): number {
    if (this.loop) {
      let count = Math.max(0, this.count());
      if (newIndex == 0 && oldIndex == count - 1) {
        return +1;
      } else if (newIndex == count - 1 && oldIndex == 0) {
        return -1;
      }
    }
    return newIndex - oldIndex;
  }

  public fireVScroll(): void {
    let page = this.getPageNode() as UiPageNode;
    let lineCount = Math.ceil(Math.max(0, this.count() / this._columnCount));
    if (!this.vertical) {
      super.fireVScroll();
    } else if (!(this.mounted && this.vScrollName != null)) {
      //NOP
    } else if (lineCount >= this._linesPerPage) {
      let scroll = this.getScrollRect();
      let rTemplate = this.getTemplateRect();
      let margin = this._lineSize * LINE_MARGIN;
      let extraMargin = !this.outerMargin ? rTemplate.top : 0;
      let lineIndex = Math.floor(this._pageTopIndex / this._columnCount);
      let offset = lineIndex * this._lineSize + (scroll.y - margin - extraMargin);
      let limit = this._pageSize;
      let totalSize = lineCount * this._lineSize + rTemplate.top - extraMargin * 2;
      page.dispatchVScroll(this.vScrollName, this, offset, limit, totalSize);
    } else {
      page.dispatchVScroll(this.vScrollName, this, 0, this._pageSize, this._pageSize);
    }
  }

  public fireHScroll(): void {
    let page = this.getPageNode() as UiPageNode;
    let lineCount = Math.ceil(Math.max(0, this.count()) / this._columnCount);
    if (this.vertical) {
      super.fireHScroll();
    } else if (!(this.mounted && this.hScrollName != null)) {
      //NOP
    } else if (lineCount >= this._linesPerPage) {
      let scroll = this.getScrollRect();
      let rTemplate = this.getTemplateRect();
      let margin = this._lineSize * LINE_MARGIN;
      let extraMargin = !this.outerMargin ? rTemplate.left : 0;
      let lineIndex = Math.floor(this._pageTopIndex / this._columnCount);
      let offset = lineIndex * this._lineSize + (scroll.x - margin - extraMargin);
      let limit = this._pageSize;
      let totalSize = lineCount * this._lineSize + rTemplate.left - extraMargin * 2;
      page.dispatchHScroll(this.hScrollName, this, offset, limit, totalSize);
    } else {
      page.dispatchHScroll(this.hScrollName, this, 0, this._pageSize, this._pageSize);
    }
  }

  public onMouseWheel(
    target: UiNode,
    x: number,
    y: number,
    dx: number,
    dy: number,
    mod: number,
    at: number
  ): UiResult {
    let lineCount = Math.ceil(Math.max(0, this.count()) / this._columnCount);
    if (lineCount < this._linesPerPage) {
      return UiResult.IGNORED;
    }
    let result = UiResult.CONSUMED;
    if (mod & KeyCodes.MOD_SHIFT) {
      let dt = dx;
      dx = dy;
      dy = dt;
    }
    if (this.loop) {
      if (this.vertical) {
        result |= this.slideVertical(dy);
      } else {
        result |= this.slideHorizontal(dx);
      }
    } else {
      let scroll = this.getScrollRect();
      let margin = this._lineSize * LINE_MARGIN;
      let rTemplate = this.getTemplateRect();
      let lineIndex = Math.floor(this._pageTopIndex / this._columnCount);
      if (this.vertical) {
        let extraMargin = !this.outerMargin ? rTemplate.top : 0;
        let maxOffset = lineCount * this._lineSize + rTemplate.top - this._pageSize - extraMargin;
        let oldOffset = lineIndex * this._lineSize + (scroll.y - margin);
        let newOffset = Math.min(Math.max(extraMargin, oldOffset + dy), maxOffset);
        dy = newOffset - oldOffset;
        result |= this.slideVertical(dy);
      } else {
        let extraMargin = !this.outerMargin ? rTemplate.left : 0;
        let maxOffset = lineCount * this._lineSize + rTemplate.left - this._pageSize - extraMargin;
        let oldOffset = lineIndex * this._lineSize + (scroll.x - margin);
        let newOffset = Math.min(Math.max(extraMargin, oldOffset + dx), maxOffset);
        dx = newOffset - oldOffset;
        result |= this.slideHorizontal(dx);
      }
    }
    return result;
  }

  public scrollRecord(dir: number): UiResult {
    let dx: number;
    let dy: number;
    if (this.vertical) {
      dx = 0;
      dy = this._lineSize * Math.sign(dir);
    } else {
      dx = this._lineSize * Math.sign(dir);
      dy = 0;
    }
    return this.scrollInside(dx, dy);
  }

  public onRecordClicked(rec: DataRecord): UiResult {
    return this.fireActionEvent(UiListNode.EVENT_TAG_CLICK, rec);
  }

  public onRecordSelected(rec: DataRecord): UiResult {
    return this.fireActionEvent(UiListNode.EVENT_TAG_SELECT, rec);
  }

  public isSelected(key: string): boolean {
    return this._selectionManager != null && this._selectionManager.isSelected(key);
  }

  public isSelectedRecord(rec: DataRecord) {
    return (
      this._dataSource != null &&
      this._selectionManager != null &&
      this._selectionManager.isSelected(this._dataSource.getKeyOf(rec))
    );
  }

  public setSelected(rec: DataRecord): string | null {
    let key = null;
    if (this._dataSource != null && this._selectionManager != null) {
      key = this._dataSource.getKeyOf(rec);
      let selected = this._selectionManager.isSelected(key);
      let keys = this._selectionManager.setSelected(key, !selected);
      this.updateRecordHolder(keys);
    }
    return key;
  }

  private updateRecordHolder(keys: string[]) {
    if (this._dataSource == null) {
      return;
    }
    let n = this._children.length;
    for (let i = 0; i < n; i++) {
      let recNode = this._children[i] as UiListItem;
      let rec = recNode.getRecord();
      if (rec != null) {
        let key = this._dataSource.getKeyOf(rec);
        if (keys.includes(key)) {
          recNode.fireRecordHolderChanged();
        }
      }
    }
  }

  public getSelection(): string[] {
    return this._selectionManager != null ? this._selectionManager.getSelection() : [];
  }
}
