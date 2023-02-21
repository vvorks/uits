import { Logs, Properties } from '~/lib/lang';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { UiListNode } from '~/lib/ui/UiListNode';
import { Flags, UiNode, UiNodeSetter, UiResult } from '~/lib/ui/UiNode';
import { HasSetter, UiBuilder } from '~/lib/ui/UiBuilder';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import { HistoryState } from '~/lib/ui/HistoryManager';
import { UiImageNode } from './UiImageNode';
import { UiStyleBuilder } from './UiStyle';

//
//取得元 https://fonts.google.com/icons?utm_source=developers.google.com&utm_medium=referral
//
const DOWN_ARROW_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAT1J' +
  'REFUaEPtln0NwkAUwzsFIAEJoIAgBQdIQgIOQAISkIAE8pJdsoyvXdsLWXj31wi8rr923K3DzFc3c/9IgF83mA1kA2' +
  'IC+QiJAcrj2YAcoSiQDYgByuPZgByhKPC3DSwBrABcxQDLeGjdGC2mgTB/7gF2Boh1r3cCsK+FYAAuALb9je4AFIhi' +
  'PkKJdayFYADipgGxECHG5kMuGgiIyYsBCHEVwmI+jLAACoTNvArAQFjNOwBqIOzmXQBTIJqYdwK8g9gAKOdG2Sqp3e' +
  'bdtqT8iV9pjnenOKnjlG1i3t1AARpDDEGr9/lvB4K7gU8QdvOtGhhDxOdD7Qn7LfnyfasGhhBx7XprfeJqDTA1SPp3' +
  'CUBHZxrMBkxB0jLZAB2daTAbMAVJy2QDdHSmwWzAFCQtkw3Q0ZkGswFTkLTMAzC4NzFxR1ZQAAAAAElFTkSuQmCC';

const SUBNAME_TITLE = 'title';

const DEFAULT_ITEMS_PER_PAGE = 8;

class UiLookupItem extends UiTextNode {
  private _owner: UiLookupField;

  private _recordHolder: RecordHolder;

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
      this._recordHolder = src._recordHolder;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiLookupField;
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this.focusable = true;
    }
  }

  public onRecordHolderChanged(holder: RecordHolder): UiResult {
    let result = UiResult.IGNORED;
    this._recordHolder = holder;
    let rec = this._recordHolder.getRecord();
    if (rec != null) {
      this.textContent = rec[SUBNAME_TITLE] as string;
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
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
    let rec = this._recordHolder.getRecord() as DataRecord;
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
      if (this._owner.popupOver) {
        rPopup.locate(rOwner.left, rOwner.top, rOwner.width, height);
      } else {
        rPopup.locate(rOwner.left, rOwner.bottom, rOwner.width, height);
      }
    } else if (height <= rOwner.top) {
      //呼び出し元上に配置
      if (this._owner.popupOver) {
        rPopup.locate(rOwner.left, rOwner.bottom - height, rOwner.width, height);
      } else {
        rPopup.locate(rOwner.left, rOwner.top - height, rOwner.width, height);
      }
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
    this.left = `${rPopup.left}px`;
    this.top = `${rPopup.top}px`;
    this.width = `${rPopup.width}px`;
    this.height = `${rPopup.height}px`;
    //Popup画面構築
    let dsName = this._owner.dataSourceName as string;
    let b = new UiBuilder('1px');
    b.element(this);
    b.belongs((b) => {
      b.element(new UiListNode(app, 'list'))
        .inset(0)
        .dataSource(dsName)
        .vertical(true)
        .loop(false)
        .focusable(true);
      b.belongs((b) => {
        b.element(new UiLookupItem(app, 'rec', this._owner))
          .bounds(0, 0, rOwner.width, rOwner.height)
          .focusable(true)
          .style(this._owner.style);
      });
    });
  }

  protected afterMount(): void {
    let app = this.application;
    let dsName = this._owner.dataSourceName as string;
    let value = this._owner.getValue() as DataRecord;
    let key = value['key'] as string;
    (app.getDataSource(dsName) as DataSource).select({ key: key });
  }
}

/**
 * UiLookupFieldのセッター
 */
export class UiLookupFieldSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiLookupFieldSetter();
  public popupOver(on: boolean): this {
    let node = this.node as UiLookupField;
    node.popupOver = on;
    return this;
  }
}

export class UiLookupField extends UiNode implements HasSetter<UiLookupFieldSetter> {
  private _recordHolder: RecordHolder;

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
      this._recordHolder = src._recordHolder;
    } else {
      super(param as UiApplication, name as string);
      let app = param as UiApplication;
      this.appendChild(new UiTextNode(app, 'text'));
      this.appendChild(new UiImageNode(app, 'arrow'));
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
    }
  }

  public getSetter(): UiLookupFieldSetter {
    return UiLookupFieldSetter.INSTANCE;
  }

  public get popupOver(): boolean {
    return this.getFlag(Flags.POPUP_OVER);
  }

  public set popupOver(on: boolean) {
    this.setFlag(Flags.POPUP_OVER, on);
  }

  protected initialize(): void {
    let textStyle = new UiStyleBuilder(this.style).borderSize('0px').build();
    let imageStyle = new UiStyleBuilder(this.style)
      .borderSize('0px')
      .textAlign('center')
      .verticalAlign('middle')
      .build();
    let height = Math.min(Math.max(0, this.innerHeight), 32);
    let text = this.getTextNode();
    text.style = textStyle;
    text.position(0, 0, 0, 0, null, null);
    let image = this.getImageNode();
    image.position(null, 0, 0, 0, height, null);
    image.imageContent = DOWN_ARROW_DATA;
    image.style = imageStyle;
  }

  private getTextNode(): UiTextNode {
    return this.getChildAt(0) as UiTextNode;
  }

  private getImageNode(): UiImageNode {
    return this.getChildAt(1) as UiImageNode;
  }

  public onRecordHolderChanged(holder: RecordHolder): UiResult {
    this._recordHolder = holder;
    let value = this._recordHolder.getValue(this.dataFieldName) as DataRecord;
    if (value != null) {
      let title = value[SUBNAME_TITLE] as string;
      this.getTextNode().textContent = title;
    } else {
      this.getTextNode().textContent = '';
    }
    return UiResult.AFFECTED;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
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

  public getValue(): DataRecord {
    return this._recordHolder.getValue(this.name) as DataRecord;
  }

  public updateValue(subRecord: DataRecord): void {
    this._recordHolder.setValue(this.name, subRecord);
  }
}
