import { Properties } from '~/lib/lang';
import { DataHolder } from '~/lib/ui/DataHolder';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import { UiApplication } from '~/lib/ui/UiApplication';
import { UiListNode } from '~/lib/ui/UiListNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiBuilder } from '~/lib/ui/UiBuilder';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import { HistoryState } from '~/lib/ui/HistoryManager';

const SUBNAME_TITLE = 'title';

const DEFAULT_ITEMS_PER_PAGE = 8;

class UiLookupItem extends UiTextNode {
  private _owner: UiLookupField;

  private _dataHolder: DataHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiLookupItem {
    return new UiLookupItem(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string, owner: UiLookupField);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiLookupItem);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string, owner?: UiLookupField) {
    if (param instanceof UiLookupItem) {
      super(param as UiLookupItem);
      let src = param as UiLookupItem;
      this._owner = src._owner;
      this._dataHolder = src._dataHolder;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiLookupField;
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
      this.focusable = true;
    }
  }

  public onDataHolderChanged(holder: DataHolder): UiResult {
    let result = UiResult.IGNORED;
    this._dataHolder = holder;
    let rec = this._dataHolder.getRecord();
    if (rec != null) {
      this.textContent = rec[SUBNAME_TITLE] as string;
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
      case KeyCodes.ENTER:
        this.updateValue();
        this.application.dispose(this.getPageNode() as UiPageNode);
        result |= UiResult.EATEN;
        break;
      case KeyCodes.ESCAPE:
        this.application.dispose(this.getPageNode() as UiPageNode);
        result |= UiResult.EATEN;
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    this.updateValue();
    this.application.dispose(this.getPageNode() as UiPageNode);
    return UiResult.EATEN;
  }

  private updateValue(): void {
    let rec = this._dataHolder.getRecord() as DataRecord;
    this._owner.updateValue(rec);
  }
}

export class UiLookupPopup extends UiPageNode {
  private _owner: UiLookupField;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiLookupPopup {
    return new UiLookupPopup(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string, owner: UiLookupField);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiLookupPopup);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string, owner?: UiLookupField) {
    if (param instanceof UiLookupPopup) {
      super(param as UiLookupPopup);
      let src = param as UiLookupPopup;
      this._owner = src._owner;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiLookupField;
    }
  }

  protected initialize(): void {
    //処理準備
    let app = this.application;
    //Popupの表示位置設定
    let rOwner = this._owner.getRectOnRoot();
    let unitHeight = rOwner.height;
    let clientHeight = app.clientHeight;
    let recsPerPage = Math.min(DEFAULT_ITEMS_PER_PAGE, Math.floor(clientHeight / unitHeight));
    let height = unitHeight * recsPerPage;
    let rPopup = new Rect();
    if (height <= clientHeight - rOwner.bottom) {
      //呼び出し元フィールド下に配置
      rPopup.locate(rOwner.left, rOwner.bottom, rOwner.width, height);
    } else if (height <= rOwner.top) {
      //呼び出し元上に配置
      rPopup.locate(rOwner.left, rOwner.top - height, rOwner.width, height);
    } else {
      //画面中央に配置
      let clientWidth = app.clientWidth;
      rPopup.locate(
        (clientWidth - rOwner.width) / 2,
        (clientHeight - height) / 2,
        rOwner.width,
        height
      );
    }
    rPopup.move(40, 0); //for debug
    this.left = `${rPopup.left}px`;
    this.top = `${rPopup.top}px`;
    this.width = `${rPopup.width}px`;
    this.height = `${rPopup.height}px`;
    //Popup画面構築
    let dsName = this._owner.dataSourceName as string;
    let b = new UiBuilder('1px');
    b.element(this);
    b.belongs((b) => {
      b.element(new UiListNode(app, 'list')).inset(0).dataSource(dsName);
      b.belongs((b) => {
        b.element(new UiLookupItem(app, 'rec', this._owner))
          .bounds(0, 0, rOwner.width, rOwner.height)
          .style(this._owner.style);
      });
    });
  }

  protected afterMount(): void {
    let app = this.application;
    let dsName = this._owner.dataSourceName as string;
    (app.getDataSource(dsName) as DataSource).select({});
  }
}

export class UiLookupField extends UiTextNode {
  private _dataHolder: DataHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiLookupField {
    return new UiLookupField(this);
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
  constructor(src: UiLookupField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiLookupField) {
      super(param as UiLookupField);
      let src = param as UiLookupField;
      this._dataHolder = src._dataHolder;
    } else {
      super(param as UiApplication, name as string);
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
    }
  }

  public onDataHolderChanged(holder: DataHolder): UiResult {
    this._dataHolder = holder;
    let value = this._dataHolder.getValue(this.dataFieldName) as DataRecord;
    if (value != null) {
      let title = value[SUBNAME_TITLE] as string;
      this.textContent = title;
    } else {
      this.textContent = '';
    }
    return UiResult.AFFECTED;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
      case KeyCodes.ENTER:
        result |= this.showPopup({});
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.showPopup({});
  }

  public showPopup(args: Properties<string>): UiResult {
    this.application.call(new UiLookupPopup(this.application, '', this), new HistoryState('', {}));
    return UiResult.AFFECTED;
  }

  public updateValue(subRecord: DataRecord): void {
    this._dataHolder.setValue(this.name, subRecord);
  }
}
