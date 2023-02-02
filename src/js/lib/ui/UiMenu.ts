import type { UiApplication } from '~/lib/ui/UiApplication';
import { Arrays, Asserts, Logs, Predicate, Types, UnsupportedError, Value } from '~/lib/lang';
import { Size, UiNode, UiNodeSetter, UiResult } from '~/lib/ui/UiNode';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { CssLength } from '~/lib/ui/CssLength';
import { HasSetter, UiBuilder } from '~/lib/ui/UiBuilder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { DataHolder } from '~/lib/ui/DataHolder';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import { Rect } from './Rect';

/** テンプレート名を保持するフィールドの名前 */
const FIELD_TEMPLATE = 'template';

/** メニュー項目タイプを示すフィールドの名前 */
const FIELD_TYPE = 'type';

/** 切り替えコンテントを示すフィールドの名前 */
const FIELD_CONTENT = 'content';

/** 次メニューパスを示すフィールドの名前 */
const FIELD_SUBMENU = 'submenu';

type CssSource = string | number;

/** フィールドタイプ */
type FieldType = 'launch' | 'branch' | 'filler';

/**
 * メニュー項目クラス
 */
export class UiMenuItem extends UiNode implements DataHolder {
  /** 表示対象レコード */
  private _record: DataRecord | null;

  /** 論理位置 */
  private _index: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiMenuItem {
    return new UiMenuItem(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  public constructor(app: UiApplication, name: string);

  /** コピーコンストラクタ */
  public constructor(src: UiMenuItem);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiMenuItem) {
      super(param as UiMenuItem);
      let src = param as UiMenuItem;
      this._record = src._record;
      this._index = src._index;
    } else {
      super(param as UiApplication, name as string);
      this._record = null;
      this._index = -1;
    }
  }

  public getValue(name: string): Value | DataRecord {
    if (this._record == null) {
      return null;
    }
    let value = this._record[name];
    return value === undefined ? null : value;
  }

  public setValue(name: string, value: Value | DataRecord): void {
    throw new UnsupportedError();
  }

  public getRecord(): DataRecord | null {
    return this._record;
  }

  public setReocord(rec: DataRecord): void {
    this._record = rec;
    for (let c of this.getDescendants()) {
      c.onDataHolderChanged(this);
    }
  }

  public get index(): number {
    return this._index;
  }

  public set index(index: number) {
    this._index = index;
  }

  public getPathSegment(): string {
    return '' + this._index;
  }

  private get block(): UiMenuBlock {
    return this.parent as UiMenuBlock;
  }

  private get owner(): UiMenu {
    return this.block.parent as UiMenu;
  }

  public canMoveFocus(c: UiNode) {
    return this.parent == c.parent;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    if (this._record == null) {
      return result;
    }
    let modKey = mod | key;
    let type: FieldType = this._record[FIELD_TYPE] as FieldType;
    if (this.isTriggerKey(modKey)) {
      if (type == 'launch') {
        if (this._record[FIELD_CONTENT] != null) {
          result = this.owner.changeContent(this, this._record[FIELD_CONTENT] as string);
        }
      } else if (type == 'branch') {
        if (this._record[FIELD_SUBMENU] != null) {
          result = this.owner.forwardSubmenu(this, this._record[FIELD_SUBMENU] as string);
        }
      }
    } else if (this.isBackKey(modKey)) {
      result = this.owner.backwardMenu();
    }
    return result;
  }

  private isTriggerKey(modKey: number): boolean {
    return modKey == KeyCodes.ENTER || modKey == KeyCodes.RIGHT;
  }

  private isBackKey(modKey: number): boolean {
    return modKey == KeyCodes.LEFT;
  }
}

/**
 * メニューブロック
 */
class UiMenuBlock extends UiNode {
  private _dataSource: DataSource | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiMenuBlock {
    return new UiMenuBlock(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  public constructor(app: UiApplication, name?: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  public constructor(src: UiMenuBlock);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiMenuBlock) {
      super(param as UiMenuBlock);
      let src = param as UiMenuBlock;
      this._dataSource = src._dataSource;
    } else {
      super(param as UiApplication, name as string);
      this._dataSource = null;
    }
  }

  public count(): number {
    return this._dataSource != null ? this._dataSource.count() : -1;
  }

  public getRecord(index: number): DataRecord | null {
    return this._dataSource != null ? this._dataSource.getRecord(index) : null;
  }

  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    if (tag != this.dataSourceName) {
      return UiResult.IGNORED;
    }
    this._dataSource = ds;
    this.reloadRecs();
    this.owner.updateBlock();
    return UiResult.EATEN;
  }

  private reloadRecs(): UiResult {
    let app = this.application;
    let ds = this._dataSource as DataSource;
    let criteria = ds.criteria();
    let path = this.getPathAsArray(criteria.path as string);
    let level = path.length + 1;
    this.removeChildren();
    let spacing = this.owner.getSpacingAsPixel();
    let pos = 0;
    let firstChild: UiNode | null = null;
    for (let i = 0; i < ds.count(); i++) {
      let rec = ds.getRecord(i) as DataRecord;
      let template = rec[FIELD_TEMPLATE] as string;
      let node = this.owner.getTemplateByName(template);
      if (node != null) {
        let item = (node as UiMenuItem).clone();
        item.index = i;
        let type = rec[FIELD_TYPE] as FieldType;
        item.focusable = type != 'filler' ? true : false;
        item.setReocord(rec);
        this.appendChild(item);
        if (firstChild == null) {
          firstChild = item;
        }
        let rect = item.getRect();
        item.top = pos;
        pos += rect.height;
        pos += spacing;
      }
    }
    return UiResult.AFFECTED;
  }

  private getPathAsArray(path: string): string[] {
    let result: string[] = [];
    for (let p of path.split('/')) {
      if (p.length > 0) {
        result.push(p);
      }
    }
    return result;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    let app = this.application;
    let modKey = mod | key;
    let dir = this.getMoveKeyDirection(modKey);
    if (dir != 0) {
      let next = app.getNearestNode(target, this, (e) => this.canMove(e, target, dir));
      if (next != null) {
        app.setFocus(next);
        result |= UiResult.AFFECTED;
        Asserts.ensure(next instanceof UiMenuItem);
        let rec = next.getRecord();
        Asserts.ensure(rec != null);
        let type: FieldType = rec[FIELD_TYPE] as FieldType;
        if (type == 'branch' && rec[FIELD_SUBMENU] != null) {
          result |= this.owner.showSubmenu(next, rec[FIELD_SUBMENU] as string);
        } else {
          result |= this.owner.hideSubmenu(next);
        }
      }
      result |= UiResult.CONSUMED;
    }
    return result;
  }

  private canMove(next: UiNode, curr: UiNode, dir: number): boolean {
    let parent = curr.parent as UiNode;
    if (next == curr || next.parent != parent) {
      return false;
    }
    let order1 = parent.getIndexOfChild(curr);
    let order2 = parent.getIndexOfChild(next);
    return (order2 - order1) * dir > 0;
  }

  private getMoveKeyDirection(modKey: number): number {
    switch (modKey) {
      case KeyCodes.UP:
        return -1;
      case KeyCodes.DOWN:
        return +1;
      default:
        return 0;
    }
  }

  private get owner(): UiMenu {
    return this.parent as UiNode as UiMenu;
  }
}

/**
 * メニューセッタークラス
 */
export class UiMenuSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiMenuSetter();
  public contentNode(path: string): this {
    let node = this.node as UiMenu;
    node.contentNodePath = path;
    return this;
  }

  public spacing(value: Size | null): this {
    let node = this.node as UiMenu;
    node.spacing = this.toValue(value);
    return this;
  }

  public extentionDsNames(names: string[]): this {
    let node = this.node as UiMenu;
    node.extentionDsNames = names;
    return this;
  }

  public extentionSizes(value: string[]): this {
    let node = this.node as UiMenu;
    node.extentionSizes = value;
    return this;
  }
}

/**
 * メニュークラス
 */
export class UiMenu extends UiNode implements HasSetter<UiMenuSetter> {
  private _extentionDsNames: string[];

  private _extensionSizes: CssLength[];

  private _template: UiNode | null;

  private _contentNodePath: string | null;

  private _shrinkWidth: number;

  private _shrinkHeight: number;

  private _currentLevel: number;

  private _showNextLevel: number;

  private _lastLevel: number;

  private _focusItems: (UiMenuItem | null)[];

  private _spacing: CssLength | null;

  private _commingNode: UiNode | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiMenu {
    return new UiMenu(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  public constructor(app: UiApplication, name?: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  public constructor(src: UiMenu);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiMenu) {
      super(param as UiMenu);
      let src = param as UiMenu;
      this._template = src._template;
      this._contentNodePath = src._contentNodePath;
      this._extentionDsNames = src._extentionDsNames;
      this._extensionSizes = src._extensionSizes;
      this._shrinkWidth = src._shrinkWidth;
      this._shrinkHeight = src._shrinkHeight;
      this._currentLevel = src._currentLevel;
      this._showNextLevel = src._showNextLevel;
      this._lastLevel = src._lastLevel;
      this._focusItems = src._focusItems.slice(0, src._focusItems.length);
      this._spacing = src._spacing;
      this._commingNode = null;
    } else {
      super(param as UiApplication, name as string);
      this._template = null;
      this._contentNodePath = null;
      this._extentionDsNames = [];
      this._extensionSizes = [new CssLength(0)];
      this._shrinkWidth = 0;
      this._shrinkHeight = 0;
      this._currentLevel = 1;
      this._showNextLevel = 0;
      this._lastLevel = 0;
      this._focusItems = [null];
      this._spacing = null;
      this._commingNode = null;
    }
  }

  public getSetter(): UiMenuSetter {
    return UiMenuSetter.INSTANCE;
  }

  public get extentionDsNames(): string[] {
    return this._extentionDsNames;
  }

  public set extentionDsNames(names: string[]) {
    this._extentionDsNames = names;
  }

  public get extentionSizes(): CssSource[] {
    let result: CssSource[] = [];
    for (let c of this._extensionSizes) {
      result.push(c.toString());
    }
    return result;
  }

  public set extentionSizes(sizes: CssSource[]) {
    let levels = Math.floor(Math.sqrt(sizes.length));
    let levels2 = levels * levels;
    let data: CssLength[] = [];
    for (let i = 0; i < levels2; i++) {
      let s = sizes[i];
      data.push(new CssLength(s));
    }
    this._extensionSizes = data;
    this._focusItems = new Array(levels);
    this._focusItems.fill(null);
  }

  public get levels(): number {
    return Math.floor(Math.sqrt(this._extensionSizes.length));
  }

  public get contentNodePath(): string | null {
    return this._contentNodePath;
  }

  public set contentNodePath(path: string | null) {
    this._contentNodePath = path;
  }

  public get spacing(): string | null {
    return this._spacing == null ? null : this._spacing.toString();
  }

  public set spacing(arg: Size | null) {
    let value: CssLength | null = arg == null ? null : new CssLength(arg);
    if (!CssLength.equals(this._spacing, value)) {
      this._spacing = value;
      this.onContentChanged();
    }
  }

  protected initialize(): void {
    this._template = this.makeTemplate();
    this._shrinkWidth = this.innerWidth;
    this._shrinkHeight = this.innerHeight;
    this.prepareBlocks();
  }

  protected beforeMount(): void {
    this.relocateBlocks(0, false);
  }

  protected afterMount(): void {
    let app = this.application;
    if (this._extentionDsNames.length > 0) {
      let topName = this._extentionDsNames[0];
      let ds = app.getDataSource(topName);
      if (ds != null) {
        ds.select({ path: '/' });
      }
    }
  }

  private makeTemplate(): UiNode {
    let template = new UiNode(this.application, 'template');
    let buffer: UiNode[] = [];
    for (let c of this._children) {
      if (c instanceof UiMenuItem) {
        buffer.push(c);
      } else {
        Logs.warn('UiMenu has only UiMenuItem as a child element.');
      }
    }
    this.removeChildren();
    for (let c of buffer) {
      template.appendChild(c);
    }
    return template;
  }

  public getTemplateByName(name: string): UiNode | null {
    return (this._template as UiNode).getChildByName(name);
  }

  private prepareBlocks(): void {
    this.removeChildren();
    let app = this.application;
    let b = new UiBuilder('1px');
    let ownerStyle = this.style;
    b.element(this);
    b.belongs((b) => {
      b.element(new UiMenuBlock(app, '1'))
        .position(0, 0, null, 0, this._shrinkWidth, null)
        .dataSource(this._extentionDsNames[0])
        .style(ownerStyle);
      for (let i = 2; i <= this.levels; i++) {
        b.element(new UiMenuBlock(app, `${i}`))
          .position(this._shrinkWidth, 0, null, 0, 0, null)
          .dataSource(this._extentionDsNames[i - 1])
          .style(ownerStyle);
      }
    });
  }

  public updateBlock(level: number = this._currentLevel): boolean {
    if (this._lastLevel != 0) {
      this._currentLevel = level;
      this.relocateBlocks(level, true);
    }
    return true;
  }

  private relocateBlocks(level: number, animation: boolean): void {
    Asserts.require(0 <= level && level <= this.levels);
    let app = this.application;
    let aniTime = animation ? app.animationTime : 0;
    if (level == 0) {
      this.relocateCloseBlocks(aniTime);
    } else {
      this.relocateOpenBlocks(level, aniTime);
    }
    this._lastLevel = level;
  }

  private relocateCloseBlocks(aniTime: number): void {
    let firstBlock = this.getBlock(1);
    let firstRectOld = firstBlock.getRect();
    let firstRectNew = new Rect(firstRectOld);
    firstRectNew.width = this._shrinkWidth;
    this.animateBounds(firstBlock, firstRectOld, firstRectNew, aniTime);
    for (let i = 2; i <= this.levels; i++) {
      let block = this.getBlock(i);
      let blockRectOld = block.getRect();
      let blockRectNew = new Rect(blockRectOld);
      blockRectNew.x = this._shrinkWidth;
      blockRectNew.width = 0;
      this.animateBounds(block, blockRectOld, blockRectNew, aniTime);
    }
    this.animateInnerWidth(aniTime);
  }

  private animateBounds(node: UiNode, oldRect: Rect, newRect: Rect, aniTime: number): void {
    if (oldRect.equals(newRect)) {
      return;
    }
    if (aniTime > 0) {
      let app = this.application;
      node.boundsTo(newRect.x, newRect.y, newRect.width, newRect.height, aniTime);
    } else {
      node.left = newRect.x;
      node.top = newRect.y;
      node.width = newRect.width;
      node.height = newRect.height;
    }
  }

  private animateInnerWidth(aniTime: number) {
    if (aniTime > 0) {
      let ow = this.innerWidth;
      let dw = this._shrinkWidth - this.innerWidth;
      let app = this.application;
      app.runAnimation(this, 1, aniTime, false, (step: number) => {
        if (step >= 1.0) {
          this.innerWidth = this._shrinkWidth;
        } else {
          const ratio = Math.min(step, 1.0);
          this.innerWidth = ow + dw * ratio;
        }
        return step >= 1.0 ? UiResult.EXIT : UiResult.EATEN;
      });
    } else {
      this.innerWidth = this._shrinkWidth;
    }
  }

  private getBlock(level: number): UiNode {
    return this.findNodeByPath(`${level}`) as UiNode;
  }

  private relocateOpenBlocks(level: number, aniTime: number): void {
    let app = this.application;
    let index = (level - 1) * this.levels;
    //relocate blocks
    let totalSize = 0;
    for (let i = 1; i <= this.levels; i++) {
      let block = this.getBlock(i);
      let extSize = this._extensionSizes[index + i - 1];
      if (i == this._showNextLevel) {
        let nextIndex = (i - 1) * this.levels;
        extSize = this._extensionSizes[nextIndex + i - 1];
      }
      let newLeft = totalSize;
      let newSize = extSize.toPixel(() => this._shrinkWidth);
      let blockRectOld = block.getRect();
      let blockRectNew = new Rect(blockRectOld);
      blockRectNew.x = newLeft;
      blockRectNew.width = newSize;
      this.animateBounds(block, blockRectOld, blockRectNew, aniTime);
      totalSize += newSize;
    }
    this.innerWidth = totalSize;
    //set focus
    let focusItem = this._focusItems[level - 1];
    if (focusItem instanceof UiMenuItem) {
      app.setFocus(focusItem);
    }
  }

  public getSpacingAsPixel(): number {
    let spacing: number;
    if (this._spacing == null) {
      spacing = 0;
    } else {
      let ownerRect = this.getRect();
      spacing = this._spacing.toPixel(() => ownerRect.height);
    }
    return spacing;
  }

  public changeContent(caller: UiMenuItem, content: string): UiResult {
    let app = this.application;
    let result = UiResult.IGNORED;
    //save focus
    this._focusItems[this._currentLevel - 1] = caller;
    //invoke content
    if (this._contentNodePath != null) {
      let contentNode = this.findNodeByPath(this._contentNodePath);
      if (contentNode != null) {
        (contentNode as UiTextNode).textContent = content; //TODO kari
        this.application.setFocus(contentNode);
        result = UiResult.EATEN;
      }
    }
    //TODO 仮
    if (this._commingNode != null) {
      app.setFocus(this._commingNode);
      result = UiResult.EATEN;
    }
    return result;
  }

  public forwardSubmenu(caller: UiMenuItem, submenu: string): UiResult {
    let app = this.application;
    let result = UiResult.IGNORED;
    if (this._currentLevel >= this.levels) {
      return result;
    }
    //save focus
    this._focusItems[this._currentLevel - 1] = caller;
    //level next
    this._currentLevel++;
    if (this._showNextLevel != this._currentLevel) {
      //change submenu
      let nextName = this._extentionDsNames[this._currentLevel - 1 + 1];
      let ds = app.getDataSource(nextName);
      if (ds != null) {
        ds.select({ path: submenu });
        result = UiResult.EATEN;
      }
    } else {
      this._showNextLevel = 0;
      if (this._focusItems[this._currentLevel - 1] == null) {
        let block = this.getBlock(this._currentLevel);
        //let firstFocus = block.getChildAt(0); //Arrays.first(block.getFocusableChildrenIf((e) => true, 1, []));
        let firstFocus = Arrays.first(block.getFocusableChildrenIf((e) => true, 1, []));
        this._focusItems[this._currentLevel - 1] = firstFocus as UiMenuItem;
      }
      this.updateBlock();
    }
    return result;
  }

  public showSubmenu(caller: UiMenuItem, submenu: string): UiResult {
    //init
    let app = this.application;
    let result = UiResult.IGNORED;
    //save focus
    this._focusItems[this._currentLevel - 1] = caller;
    this._focusItems[this._currentLevel - 1 + 1] = null;
    //load submenu
    let nextName = this._extentionDsNames[this._currentLevel - 1 + 1];
    let ds = app.getDataSource(nextName);
    if (ds != null) {
      this._showNextLevel = this._currentLevel + 1;
      ds.select({ path: submenu });
      result = UiResult.CONSUMED;
    }
    return result;
  }

  public hideSubmenu(caller: UiMenuItem): UiResult {
    let result = UiResult.IGNORED;
    //save focus
    this._focusItems[this._currentLevel - 1] = caller;
    this._focusItems[this._currentLevel - 1 + 1] = null;
    //hide submenu
    if (this._showNextLevel > 0) {
      this._focusItems[this._showNextLevel - 1] = null;
      this._showNextLevel = 0;
      this.relocateBlocks(this._currentLevel, true);
      result = UiResult.AFFECTED;
    }
    return result;
  }

  public backwardMenu(): UiResult {
    let result = UiResult.IGNORED;
    if (this._currentLevel > 1) {
      this._showNextLevel = this._currentLevel;
      this._currentLevel--;
      this.relocateBlocks(this._currentLevel, true);
      result = UiResult.EATEN;
    }
    return result;
  }

  public getFocusableChildrenIf(
    filter: Predicate<UiNode>,
    limit: number,
    list: UiNode[]
  ): UiNode[] {
    if (!this.hasFocus()) {
      return list;
    } else {
      return super.getFocusableChildrenIf(filter, limit, list);
    }
  }

  public adjustFocus(prev: UiNode): UiNode {
    this._commingNode = prev;
    let level = this._currentLevel;
    let lastItem: UiNode | null = this._focusItems[level - 1];
    if (lastItem == null) {
      let block = this.getBlock(level);
      //lastItem = block.getChildAt(0); //Arrays.first(block.getFocusableChildrenIf((e) => true, 1, []));
      lastItem = Arrays.first(block.getFocusableChildrenIf((e) => true, 1, []));
    }
    return lastItem != null ? lastItem : this;
  }

  public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
    if (gained) {
      if (target == this || this.isAncestorOf(target)) {
        if (other == null || !this.isAncestorOf(other)) {
          if (this._currentLevel > 1) {
            this._showNextLevel = this._currentLevel;
            this._currentLevel--;
          }
          this.relocateBlocks(this._currentLevel, true);
        }
      }
    } else {
      if (target == this || this.isAncestorOf(target)) {
        if (other == null || !this.isAncestorOf(other)) {
          this.relocateBlocks(0, true);
        }
      }
    }
    return super.onFocus(target, gained, other);
  }
}
