import { Logs, ParamError, Predicate, UnsupportedError, Value } from '~/lib/lang';
import { Flags, Size, UiLocation, UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiApplication, UiAxis } from '~/lib/ui/UiApplication';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { CssLength } from '~/lib/ui/CssLength';
import { UiNodeBuilder } from '~/lib/ui/UiNodeBuilder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { DataHolder } from '~/lib/ui/DataHolder';
import { UiTextNode } from '~/lib/ui/UiTextNode';

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

  /** クローンメソッド */
  public clone(): UiMenuItem {
    return new UiMenuItem(this);
  }

  /** 通常コンストラクタ */
  public constructor(app: UiApplication, name: string);

  /** コピーコンストラクタ */
  public constructor(src: UiMenuItem);

  /** コンストラクタ実装 */
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

  private get owner(): UiMenu {
    return (this.parent as UiNode).parent as UiMenu;
  }

  public canMoveFocus(c: UiNode) {
    return this.parent == c.parent;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    let k = key | mod;
    if (k == this.getTriggerKey() || k == KeyCodes.ENTER) {
      if (this._record != null) {
        let type: FieldType = this._record[FIELD_TYPE] as FieldType;
        if (type == 'launch') {
          if (this._record[FIELD_CONTENT] != null) {
            result = this.owner.changeContent(this, this._record[FIELD_CONTENT] as string);
          }
        } else if (type == 'branch') {
          if (this._record[FIELD_SUBMENU] != null) {
            result = this.owner.forwardSubmenu(this, this._record[FIELD_SUBMENU] as string);
          }
        }
      }
    } else if (k == this.getBackKey()) {
      result = this.owner.backwardMenu();
    }
    return result;
  }

  private getTriggerKey(): number {
    switch (this.owner.location) {
      case 'left':
        return KeyCodes.RIGHT;
      case 'right':
        return KeyCodes.LEFT;
      case 'top':
        return KeyCodes.DOWN;
      case 'bottom':
        return KeyCodes.UP;
      default:
        return KeyCodes.UNUSED;
    }
  }

  private getBackKey(): number {
    switch (this.owner.location) {
      case 'left':
        return KeyCodes.LEFT;
      case 'right':
        return KeyCodes.RIGHT;
      case 'top':
        return KeyCodes.UP;
      case 'bottom':
        return KeyCodes.DOWN;
      default:
        return KeyCodes.UNUSED;
    }
  }
}

/**
 * メニュークラス
 */
export class UiMenu extends UiNode {
  /** 表示位置 */
  private _location: UiLocation;

  private _extensionSizes: CssLength[];

  private _template: UiNode | null;

  private _contentNodePath: string | null;

  private _dataSource: DataSource | null;

  private _shrinkWidth: number;

  private _shrinkHeight: number;

  private _currentLevel: number;

  private _lastLevel: number;

  private _focusItems: (UiMenuItem | null)[];

  private _spacing: CssLength | null;

  private _commingNode: UiNode | null;

  public clone(): UiMenu {
    return new UiMenu(this);
  }

  public constructor(app: UiApplication, name?: string);
  public constructor(src: UiMenu);
  public constructor(param: any, name?: string) {
    if (param instanceof UiMenu) {
      super(param as UiMenu);
      let src = param as UiMenu;
      this._location = src._location;
      this._template = src._template;
      this._contentNodePath = src._contentNodePath;
      this._dataSource = src._dataSource;
      this._extensionSizes = src._extensionSizes;
      this._shrinkWidth = src._shrinkWidth;
      this._shrinkHeight = src._shrinkHeight;
      this._currentLevel = src._currentLevel;
      this._lastLevel = src._lastLevel;
      this._focusItems = src._focusItems.slice(0, src._focusItems.length);
      this._spacing = src._spacing;
      this._commingNode = null;
    } else {
      super(param as UiApplication, name as string);
      this._location = 'left';
      this._template = null;
      this._contentNodePath = null;
      this._dataSource = null;
      this._extensionSizes = [new CssLength(0)];
      this._shrinkWidth = 0;
      this._shrinkHeight = 0;
      this._currentLevel = 1;
      this._lastLevel = 0;
      this._focusItems = [null];
      this._spacing = null;
      this._commingNode = null;
    }
  }

  public get location(): UiLocation {
    return this._location;
  }

  public set location(location: UiLocation) {
    this._location = location;
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

  public get focusable(): boolean {
    return super.getFlag(Flags.FOCUSABLE) || this.count() <= 0;
  }

  public set focusable(on: boolean) {
    this.setFlag(Flags.FOCUSABLE, on);
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

  public onMount(): void {
    if (this._template == null) {
      this._template = this.makeTemplate();
    }
    this._shrinkWidth = this.innerWidth;
    this._shrinkHeight = this.innerHeight;
    this.prepareBlocks();
    this.relocateBlocks(0);
    super.onMount();
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
    if (this.count() < 0) {
      //最初の通知
      let oldFocusable = this.focusable;
      this._dataSource = ds;
      this.reloadRecs(false);
      let newFocusable = this.focusable;
      if (oldFocusable && !newFocusable && this.application.getFocusOf(this) == this) {
        this.application.resetFocus(this);
      }
    } else {
      //２回目以降
      this.reloadRecs(true);
    }
    this.fireHScroll();
    this.fireVScroll();
    return UiResult.EATEN;
  }

  private prepareBlocks(): void {
    this.removeChildren();
    let app = this.application;
    let b = new UiNodeBuilder('1px');
    let ownerStyle = this.style;
    b.element(this).belongs((b) => {
      switch (this._location) {
        case 'left':
          b.element(new UiNode(app, '1'))
            .position(0, 0, null, 0, this._shrinkWidth, null)
            .style(ownerStyle);
          for (let i = 2; i <= this.levels; i++) {
            b.element(new UiNode(app, `${i}`))
              .position(this._shrinkWidth, 0, null, 0, 0, null)
              .style(ownerStyle);
          }
          break;
        case 'right':
          b.element(new UiNode(app, '1'))
            .position(null, 0, 0, 0, this._shrinkWidth, null)
            .style(ownerStyle);
          for (let i = 2; i <= this.levels; i++) {
            b.element(new UiNode(app, `${i}`))
              .position(null, 0, this._shrinkWidth, 0, 0, null)
              .style(ownerStyle);
          }
          break;
        case 'top':
          b.element(new UiNode(app, '1'))
            .position(0, 0, 0, null, null, this._shrinkHeight)
            .style(ownerStyle);
          for (let i = 2; i <= this.levels; i++) {
            b.element(new UiNode(app, `${i}`))
              .position(0, this._shrinkHeight, 0, null, null, 0)
              .style(ownerStyle);
          }
          break;
        case 'bottom':
          b.element(new UiNode(app, '1')).position(0, null, 0, 0, null, this._shrinkHeight);
          for (let i = 2; i <= this.levels; i++) {
            b.element(new UiNode(app, `${i}`))
              .position(0, null, 0, this._shrinkHeight, null, 0)
              .style(ownerStyle);
          }
          break;
      }
    });
  }

  private relocateBlocks(level: number): void {
    if (!(0 <= level && level <= this.levels)) {
      throw new ParamError();
    }
    Logs.debug('relocateBlocks %d', level);
    if (level == 0) {
      this.relocateBlocks0();
    } else {
      this.relocateBlocks1(level);
    }
    this._lastLevel = level;
  }

  private relocateBlocks0(): void {
    let firstBlock = this.getBlock(1);
    firstBlock.visible = true;
    switch (this._location) {
      case 'left':
        firstBlock.width = this._shrinkWidth;
        for (let i = 2; i <= this.levels; i++) {
          let block = this.getBlock(i);
          block.left = this._shrinkWidth;
          block.width = 0;
          block.visible = false;
        }
        this.innerWidth = this._shrinkWidth;
        break;
      case 'right':
        firstBlock.width = this._shrinkWidth;
        for (let i = 2; i <= this.levels; i++) {
          let block = this.getBlock(i);
          block.right = this._shrinkWidth;
          block.width = 0;
          block.visible = false;
        }
        this.innerWidth = this._shrinkWidth;
        break;
      case 'top':
        firstBlock.height = this._shrinkHeight;
        for (let i = 2; i <= this.levels; i++) {
          let block = this.getBlock(i);
          block.top = this._shrinkHeight;
          block.height = 0;
          block.visible = false;
        }
        this.innerHeight = this._shrinkHeight;
        break;
      case 'bottom':
        firstBlock.height = this._shrinkHeight;
        for (let i = 2; i <= this.levels; i++) {
          let block = this.getBlock(i);
          block.bottom = this._shrinkHeight;
          block.height = 0;
          block.visible = false;
        }
        this.innerHeight = this._shrinkHeight;
        break;
    }
  }

  private getBlock(level: number): UiNode {
    return this.findNodeByPath(`${level}`) as UiNode;
  }

  private relocateBlocks1(level: number): void {
    let index = (level - 1) * level;
    let totalSize = 0;
    switch (this._location) {
      case 'left':
        for (let i = 1; i <= this.levels; i++) {
          let block = this.getBlock(i);
          let extSize = this._extensionSizes[index + i - 1];
          let size = extSize.toPixel(() => this._shrinkWidth);
          block.left = totalSize;
          block.width = size;
          block.visible = size > 0 ? true : false;
          totalSize += size;
        }
        this.innerWidth = totalSize;
        break;
      case 'right':
        for (let i = 1; i <= this.levels; i++) {
          let block = this.getBlock(i);
          let extSize = this._extensionSizes[index + i - 1];
          let size = extSize.toPixel(() => this._shrinkWidth);
          block.right = totalSize;
          block.width = size;
          block.visible = size > 0 ? true : false;
          totalSize += size;
        }
        this.innerWidth = totalSize;
        break;
      case 'top':
        for (let i = 1; i <= this.levels; i++) {
          let block = this.getBlock(i);
          let extSize = this._extensionSizes[index + i - 1];
          let size = extSize.toPixel(() => this._shrinkHeight);
          block.top = totalSize;
          block.height = size;
          block.visible = size > 0 ? true : false;
          totalSize += size;
        }
        this.innerHeight = totalSize;
        break;
      case 'bottom':
        for (let i = 1; i <= this.levels; i++) {
          let block = this.getBlock(i);
          let extSize = this._extensionSizes[index + i - 1];
          let size = extSize.toPixel(() => this._shrinkHeight);
          block.bottom = totalSize;
          block.height = size;
          block.visible = size > 0 ? true : false;
          totalSize += size;
        }
        this.innerHeight = totalSize;
        break;
    }
    let app = this.application;
    let focusItem = this._focusItems[level - 1];
    if (focusItem instanceof UiMenuItem) {
      app.setFocus(focusItem);
    }
  }

  private reloadRecs(doRelocate: boolean): UiResult {
    let app = this.application;
    let ds = this._dataSource as DataSource;
    let criteria = ds.criteria();
    let path = this.getPathAsArray(criteria.path as string);
    let level = path.length + 1;
    let block = this.findNodeByPath(`${level}`) as UiNode;
    block.removeChildren();
    let spacing = this.getSpacing();
    let pos = 0;
    let firstChild: UiNode | null = null;
    for (let i = 0; i < ds.count(); i++) {
      let rec = ds.getRecord(i) as DataRecord;
      let template = rec[FIELD_TEMPLATE] as string;
      let node = (this._template as UiNode).getChildByName(template);
      if (node != null) {
        let item = (node as UiMenuItem).clone();
        item.index = i;
        let type = rec[FIELD_TYPE] as FieldType;
        item.focusable = type != 'filler' ? true : false;
        item.setReocord(rec);
        block.appendChild(item);
        if (firstChild == null) {
          firstChild = item;
        }
        let rect = item.getRect();
        switch (this._location) {
          case 'left':
          case 'right':
            item.top = pos;
            pos += rect.height;
            pos += spacing;
            break;
          case 'top':
          case 'bottom':
            item.left = pos;
            pos += rect.width;
            pos += spacing;
            break;
        }
      }
    }
    if (doRelocate) {
      if (this._lastLevel != 0 && this._lastLevel != level) {
        this._currentLevel = level;
        this.relocateBlocks(level);
        if (firstChild != null) {
          app.setFocus(firstChild);
        }
      }
    }
    return UiResult.AFFECTED;
  }

  private getSpacing(): number {
    let spacing: number;
    if (this._spacing == null) {
      spacing = 0;
    } else {
      let ownerRect = this.getRect();
      switch (this._location) {
        case 'left':
        case 'right':
          spacing = this._spacing.toPixel(() => ownerRect.height);
          break;
        case 'top':
        case 'bottom':
          spacing = this._spacing.toPixel(() => ownerRect.width);
          break;
        default:
          spacing = 0;
          break;
      }
    }
    return spacing;
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

  public changeContent(caller: UiMenuItem, content: string): UiResult {
    Logs.info('changeContent %s to %s', content, this._contentNodePath);
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
    Logs.info('forwardSubmenu %s', submenu);
    let app = this.application;
    let result = UiResult.IGNORED;
    //save focus
    this._focusItems[this._currentLevel - 1] = caller;
    //change submenu
    if (this._dataSource != null) {
      this._dataSource.select({ path: submenu });
      result = UiResult.EATEN;
    }
    return result;
  }

  public backwardMenu(): UiResult {
    let result = UiResult.IGNORED;
    if (this._currentLevel > 1) {
      this._currentLevel--;
      this.relocateBlocks(this._currentLevel);
      result = UiResult.EATEN;
    }
    return result;
  }

  protected getFocusableChildrenIf(
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
      lastItem = block.getChildAt(0);
    }
    return lastItem != null ? lastItem : this;
  }

  public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
    if (gained) {
      if (target == this || this.isAncestorOf(target)) {
        this.relocateBlocks(this._currentLevel);
      }
    } else {
      if (target == this || this.isAncestorOf(target)) {
        this.relocateBlocks(0);
      }
    }
    return super.onFocus(target, gained, other);
  }
}
