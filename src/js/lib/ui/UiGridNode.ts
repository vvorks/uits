import type { UiApplication } from '~/lib/ui/UiApplication';
import { Asserts, Logs, Predicate, Value } from '~/lib/lang';
import { Colors } from '~/lib/ui/Colors';
import { DataHolder } from '~/lib/ui/DataHolder';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import { Scrollable } from '~/lib/ui/Scrollable';
import { Flags, UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiStyle, UiStyleBuilder } from '~/lib/ui/UiStyle';
import { HasSetter } from '~/lib/ui/UiBuilder';
import { UiScrollNode, UiScrollNodeSetter } from '~/lib/ui/UiScrollNode';
import { UiAxis } from './UiAxis';

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
 * レコードノード
 */
class UiRecord extends UiNode implements DataHolder {
  private _index: number;

  private _record: DataRecord | null;

  private _sharedNames: Set<string>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiRecord {
    return new UiRecord(this);
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
  public constructor(src: UiRecord);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiRecord) {
      super(param as UiRecord);
      let src = param as UiRecord;
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

  public adoptChildren(other: UiNode): void {
    super.adoptChildren(other);
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
    for (let c of this.getDescendants()) {
      c.onDataHolderChanged(this);
    }
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
        for (let c of this.getDescendantsIf((e) => e.dataFieldName == name)) {
          c.onDataHolderChanged(this);
        }
      }
      this.owner.setRecord(this._record);
    }
  }

  public getRecord(): DataRecord | null {
    return this._record;
  }

  public setReocord(rec: DataRecord): void {
    this._record = rec;
    this.owner.setRecord(this._record);
  }

  protected get owner(): UiGridNode {
    return this.parent as UiGridNode;
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
}

/**
 * UiListNodeのセッター
 */
export class UiGridNodeSetter extends UiScrollNodeSetter {
  public static readonly INSTANCE = new UiGridNodeSetter();
  public loop(value: boolean): this {
    let node = this.node as UiGridNode;
    node.loop = value;
    return this;
  }

  public vertical(value: boolean): this {
    let node = this.node as UiGridNode;
    node.vertical = value;
    return this;
  }

  public outerMargin(value: boolean): this {
    let node = this.node as UiGridNode;
    node.outerMargin = value;
    return this;
  }
}

/**
 * 垂直及び水平の仮想データリストノード
 */
export class UiGridNode extends UiScrollNode implements HasSetter<UiGridNodeSetter> {
  private _template: UiRecord | null;

  private _templateRect: Rect | null;

  private _templateBottom: number | null;

  private _templateRight: number | null;

  private _lineSize: number;

  private _pageSize: number;

  private _columnCount: number;

  private _linesPerPage: number;

  private _pageTopIndex: number;

  private _dataSource: DataSource | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiGridNode {
    return new UiGridNode(this);
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
  constructor(src: UiGridNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiGridNode) {
      super(param as UiGridNode);
      let src = param as UiGridNode;
      this._template = src._template;
      this._templateRect = src._templateRect;
      this._templateBottom = src._templateBottom;
      this._templateRight = src._templateRight;
      this._lineSize = src._lineSize;
      this._pageSize = src._pageSize;
      this._columnCount = src._columnCount;
      this._linesPerPage = src._linesPerPage;
      this._pageTopIndex = src._pageTopIndex;
      this._dataSource = src._dataSource;
    } else {
      super(param as UiApplication, name as string);
      this.initFlags(Flags.LIST_INITIAL);
      this._template = null;
      this._templateRect = null;
      this._templateBottom = null;
      this._templateRight = null;
      this.vertical = true;
      this._lineSize = 0;
      this._pageSize = 0;
      this._columnCount = 1;
      this._linesPerPage = 0;
      this._pageTopIndex = 0;
      this._dataSource = null;
    }
  }

  public getSetter(): UiGridNodeSetter {
    return UiGridNodeSetter.INSTANCE;
  }

  public get focusable(): boolean {
    return super.getFlag(Flags.FOCUSABLE) || this.itemFocusable();
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
  }

  public beforeMount(): void {
    this.measureSize();
    this.prepareArea();
    this.prepareRecs();
    this.relocateRecs();
    this.renumberRecs(true);
    this.setRecsVisiblity();
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
    this.prepareArea();
    this.prepareRecs();
    this.relocateRecs();
    this.renumberRecs(true);
    this.setRecsVisiblity();
    return UiResult.AFFECTED;
  }

  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    if (tag != this.dataSourceName) {
      return UiResult.IGNORED;
    }
    let app = this.application;
    if (this.count() < 0) {
      //最初の通知
      this._dataSource = ds;
      this._pageTopIndex = this.validateIndex(0); //TODO ds.offset()を考慮すべき
      this.adjustScroll();
      this.renumberRecs(true);
      this.setRecsVisiblity();
      if (this.focusable && app.getFocusOf(this) == this) {
        app.resetFocus(this.adjustFocus(this));
      }
      (this.getPageNode() as UiPageNode).setHistoryStateAgain();
    } else {
      //２回目以降の通知
      let info = this.saveFocus();
      this._pageTopIndex = this.validateIndex(this._pageTopIndex);
      this.adjustScroll();
      this.renumberRecs(true);
      this.setRecsVisiblity();
      this.restoreFocus(info);
    }
    this.fireHScroll();
    this.fireVScroll();
    return UiResult.EATEN;
  }

  private saveFocus(): FocusInfo | null {
    let app = this.application;
    let focus = app.getFocusOf(this);
    if (focus != null && this.isAncestorOf(focus)) {
      let rec = this.getUiRecordOf(focus);
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
    if (this._children[info.recordIndex].visible) {
      return;
    }
    for (let i = info.recordIndex - 1; i >= 0; i--) {
      let rec = this._children[i];
      if (rec.visible) {
        let restore = rec.getDescendantAt(info.fieldIndex);
        if (restore != null) {
          this.application.setFocus(restore, this.vertical ? UiAxis.Y : UiAxis.X);
        }
        break;
      }
    }
  }

  private getUiRecordOf(node: UiNode): UiRecord | null {
    let e: UiNode | null = node;
    while (e != null && !(e instanceof UiRecord)) {
      e = e.parent;
    }
    return e != null ? (e as UiRecord) : null;
  }

  private makeTemplate(): UiRecord {
    let rTemplate = this.getChildrenRect();
    let maxRight = 0;
    let maxBottom = 0;
    for (let c of this._children) {
      let r = c.getRect();
      if (c.right != null) {
        maxRight = Math.max(maxRight, r.right);
      }
      if (c.bottom != null) {
        maxBottom = Math.max(maxBottom, r.bottom);
      }
    }
    this._templateRect = rTemplate;
    let template = new UiRecord(this.application, 'template');
    if (maxRight == 0 && maxBottom == 0) {
      this._templateRight = null;
      this._templateBottom = null;
      template.left = `${rTemplate.left}px`;
      template.top = `${rTemplate.top}px`;
      template.width = `${rTemplate.width}px`;
      template.height = `${rTemplate.height}px`;
    } else if (this.vertical) {
      this._templateBottom = rTemplate.bottom == maxBottom ? this.innerHeight - maxBottom : null;
      template.left = '0px';
      template.right = '0px';
      template.top = `${rTemplate.top}px`;
      template.height = `${rTemplate.height}px`;
    } else {
      this._templateRight = rTemplate.right == maxRight ? this.innerWidth - maxRight : null;
      template.left = `${rTemplate.left}px`;
      template.width = `${rTemplate.width}px`;
      template.top = '0px';
      template.bottom = '0px';
    }
    for (let c of this._children) {
      let rChild = c.getRect();
      if (c.left != null) {
        c.left = `${rChild.left - rTemplate.left}px`;
      }
      if (c.top != null) {
        c.top = `${rChild.top - rTemplate.top}px`;
      }
    }
    template.adoptChildren(this);
    template.style = RECORD_STYLE;
    return template;
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
      if (this._templateRight != null || this._templateBottom != null) {
        this._columnCount = 1;
      } else {
        let tempColSize = rTemplate.left + rTemplate.width;
        this._columnCount = Math.max(1, Math.floor(this.innerWidth / tempColSize));
      }
    } else {
      this._lineSize = rTemplate.left + rTemplate.width;
      this._pageSize = this.innerWidth;
      if (this.bottom != null) {
        this._columnCount = 1;
      } else {
        let tempColSize = rTemplate.top + rTemplate.height;
        this._columnCount = Math.max(1, Math.floor(this.innerHeight / tempColSize));
      }
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
        let rec = this._children[i] as UiRecord;
        let rIndex = Math.floor(i / this._columnCount);
        let cIndex = Math.floor(i % this._columnCount);
        let x = r.left + cIndex * (r.left + r.width);
        let y = r.top + rIndex * (r.top + r.height);
        rec.left = `${x}px`;
        rec.top = `${y}px`;
        rec.right = null;
        rec.bottom = null;
        rec.width = `${r.width}px`;
        rec.height = `${r.height}px`;
      }
    } else {
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiRecord;
        let rIndex = Math.floor(i / this._columnCount);
        let cIndex = Math.floor(i % this._columnCount);
        let x = r.left + rIndex * (r.left + r.width);
        let y = r.top + cIndex * (r.top + r.height);
        rec.left = `${x}px`;
        rec.top = `${y}px`;
        rec.right = null;
        rec.bottom = null;
        rec.width = `${r.width}px`;
        rec.height = `${r.height}px`;
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
        let rec = this._children[i] as UiRecord;
        rec.setIndex(-1, forceReload);
      }
    } else {
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiRecord;
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
        let rec = this._children[i] as UiRecord;
        rec.visible = true;
      }
    } else {
      // 論理データ範囲外は非表示
      let sp = Math.max(0, LINE_MARGIN * this._columnCount - this._pageTopIndex);
      let ep = Math.min(n, LINE_MARGIN * this._columnCount - this._pageTopIndex + count);
      for (let i = 0; i < n; i++) {
        let rec = this._children[i] as UiRecord;
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
      return list;
    } else {
      return super.getFocusableChildrenIf(filter, limit, list);
    }
  }

  public adjustFocus(prev: UiNode): UiNode {
    let app = this.application;
    if (this.focusLock || prev == this) {
      let firstRec = this._children[LINE_MARGIN];
      let list = firstRec.getFocusableDescendantsIf((e) => app.isFocusable(e), 1);
      if (list.length > 0) {
        return list[0];
      }
    } else {
      let nearest = app.getNearestNode(prev, this, (e) => e != this);
      if (nearest != null) {
        Logs.debug('nearest from %s is %s', prev.getNodePath(), nearest.getNodePath());
        return nearest;
      }
    }
    return this;
  }

  public scrollFor(target: UiNode, animationTime?: number): UiResult {
    Asserts.require(target.parent == this);
    let result: UiResult = UiResult.IGNORED;
    if (!this.focusLock || this._pageTopIndex >= this.count() - this._linesPerPage) {
      result = this.scrollIfNecessary(target, animationTime);
    } else {
      let nextRec = this.getRecordOf(target) as UiRecord;
      let delta = nextRec.index - this._pageTopIndex;
      let dx = this._lineSize * (this.vertical ? 0 : delta);
      let dy = this._lineSize * (this.vertical ? delta : 0);
      if (dx != 0 || dy != 0) {
        return this.scrollInside(dx, dy, animationTime);
      }
    }
    return result;
  }

  protected getRecordOf(node: UiNode): UiRecord | null {
    if (node instanceof UiRecord) {
      return node as UiRecord;
    }
    let recs = node.getAncestorsIf((e) => e instanceof UiRecord, 1);
    if (recs.length > 0) {
      return recs[0] as UiRecord;
    }
    return null;
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
        this._children.unshift(this._children.pop() as UiNode);
      }
      y += this._lineSize;
      index = (index - this._columnCount + count) % count;
    }
    while (scroll.height - (y + this._pageSize) < margin) {
      for (let i = 0; i < this._columnCount; i++) {
        this._children.push(this._children.shift() as UiNode);
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
        this._children.unshift(this._children.pop() as UiNode);
      }
      x += this._lineSize;
      index = (index - this._columnCount + count) % count;
    }
    while (scroll.width - (x + this._pageSize) < margin) {
      for (let i = 0; i < this._columnCount; i++) {
        this._children.push(this._children.shift() as UiNode);
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
    this._pageTopIndex = this.validateIndex(Math.floor(offset / this._lineSize));
    this.adjustScroll();
    this.renumberRecs(true);
    this.setRecsVisiblity();
    let remain = (offset % this._lineSize) + LINE_MARGIN * this._lineSize;
    this.scrollTop = `${remain}px`;
  }

  public onHScroll(source: Scrollable, offset: number, limit: number, count: number): void {
    this._pageTopIndex = this.validateIndex(Math.floor(offset / this._lineSize));
    this.adjustScroll();
    this.renumberRecs(true);
    this.setRecsVisiblity();
    let remain = (offset % this._lineSize) + LINE_MARGIN * this._lineSize;
    this.scrollLeft = `${remain}px`;
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
}
