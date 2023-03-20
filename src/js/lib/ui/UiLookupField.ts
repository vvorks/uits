import { CssLength } from './CssLength';
import { UiImageNode } from './UiImageNode';
import { UiScrollbar } from './UiScrollbar';
import { UiStyleBuilder } from './UiStyle';
import { Properties } from '~/lib/lang';
import { DataRecord, DataSource } from '~/lib/ui/DataSource';
import { HistoryState } from '~/lib/ui/HistoryManager';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { Rect } from '~/lib/ui/Rect';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter, UiBuilder } from '~/lib/ui/UiBuilder';
import { UiListNode } from '~/lib/ui/UiListNode';
import { Flags, Size, UiNode, UiNodeSetter, UiResult } from '~/lib/ui/UiNode';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';

//
//取得元 https://fonts.google.com/icons?utm_source=developers.google.com&utm_medium=referral
//
const MORE_ARROW_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNS' +
  'R0IArs4c6QAAAX9JREFUaEPtlr9KA0EQh395HX0axVj4Cj6YEFPYpLARtLCxsBOLFDYpUqRJYS' +
  'OCDMzCsWy42fkTOTLXHIHdmfl+396SGSb+zCY+PxLgvw2mgTRgTCCPkDFA8/Y0YI7QWCANGAM0' +
  'b08D5giNBU7awBWApTHAsv0MwIemltbAAgABXAJ40DQe7KHhqd4zgNveWhoAajbnRj8ALgCseh' +
  'vz+jL8Of++A3DTU0sDQMMTRHm+2cRjT2MA9fC0/RrAfU8dDQDVryH2bOJJ2NxleOqlBWhB7NjE' +
  'ywiE2/BWgBbEliFeD0C4Du8B0ILY8HF6qyDch/cCaEF8sYn3A7eN6oNtWbV8A3W9+sNeM8Qv31' +
  'rlqnQb3tNAgakhPgEQQMjwEQCt4zQ01X3Pj13Lnkdo2Ks24Xpsho2iAGoT7skXiEiAAkHvrr8H' +
  'Y8fmWAZ65lCvjTagHky6MQGkSUWtSwNRyUrrpgFpUlHr0kBUstK6aUCaVNS6NBCVrLRuGpAmFb' +
  'Vu8gb+AFxHOTFkGHW6AAAAAElFTkSuQmCC';

const LESS_ARROW_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNS' +
  'R0IArs4c6QAAAV1JREFUaEPtlsFKAlEUhr95nXwdiRYFCbUwSKiFQUKLoCAXBQW5KFDQhYivY8' +
  '8jwr0gcged+59LCMetc8583/+Pc6048k915Py4wH836A14A2IC/giJAcrj3oAcobjAGxADlMe9' +
  'ATlCcYE3sCfAk/D9nxh07XjJBjbwi3DnU6CIRCmBCN8KAiugiEQJgV34WH8RCWuBOvhiEpYCKf' +
  'izQD7f+hWaNmElkIK/AGYB/ByYlpCwEEjBd4DJzrvvEhhbS6gCKfhr4LfmxX0F/FhKKAIp+Btg' +
  'tOfQ6gLfVhK5Ain4HvB14Il7C3xaSOQIpODvgY8D4eNld8C7KtFUIAX/AAwbwsfL+8CbItFUYH' +
  'OvbYkB8JoJH8cegRcg63zIEYgSbeBZhI/jT8Ay5w9froARt77GBfQMtQ3egJafPu0N6BlqG7wB' +
  'LT992hvQM9Q2eANafvq0N6BnqG3wBrT89Ok1e1k7Ma3slmEAAAAASUVORK5CYII=';

const SUBNAME_TITLE = 'title';

const DEFAULT_POPUP_ROWS = 8;

const VISIBLE_TIME = 2000;
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
    } else {
      this.textContent = '';
    }
    if (this.qualifierFieldName != null) {
      this.qualifier = this._recordHolder.getValue(this.qualifierFieldName) as string;
    }
    return result;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        this.updateValue();
        this._owner.setLessArrow(false);
        this.application.dispose(this.getPageNode() as UiPageNode);
        this._owner.onPopupDeleted();
        result |= UiResult.EATEN;
        break;
      case KeyCodes.ESCAPE:
      case KeyCodes.BACKSPACE:
        this._owner.setLessArrow(false);
        this.application.dispose(this.getPageNode() as UiPageNode);
        this._owner.onPopupDeleted();
        result |= UiResult.EATEN;
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    this.updateValue();
    this._owner.setLessArrow(false);
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
  private _scrollVisible: boolean;

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
      this._scrollVisible = src._scrollVisible;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiLookupField;
      this._scrollVisible = false;
    }
  }

  protected initialize(): void {
    //処理準備
    let app = this.application;
    //Popupの表示位置設定
    let rOwner = this._owner.getRectOnRoot();
    let unitHeight = rOwner.height;
    let imageHeight = Math.min(Math.max(0, this._owner.innerHeight), 32);
    let clientHeight = app.clientHeight;
    let recsPerPage = Math.min(this._owner.popupRows, Math.floor(clientHeight / unitHeight));
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
        .vscroll('sb')
        .action((src, tag, arg) => this.moveItem(tag, arg))
        .focusable(true);
      b.belongs((b) => {
        b.element(new UiLookupItem(app, 'rec', this._owner))
          .bounds(0, 0, rOwner.width, rOwner.height)
          .focusable(true)
          .dataField(UiLookupField.POPUP_ITEM_NAME)
          .style(this._owner.style);
      });
      let sbWidth = this._owner.scrollbarWidthAsLength().toPixel(() => rPopup.width);
      let sbMargin = this._owner.scrollbarMarginAsLength().toPixel(() => rPopup.width);
      let sbTop = sbMargin;
      if (this._owner.popupOver) {
        //ポップアップオーバー時には一番上のコンテンツにスクロールバーを表示させないため、1コンテンツの高さをtopに加算
        sbTop += unitHeight;
      }
      if (sbWidth > 0) {
        let sbStyle = this._owner.style.getConditionalStyle(
          'NAMED',
          UiLookupField.POPUP_SCROLLBAR_NAME
        );
        let c = b
          .element(new UiScrollbar(app, 'sb'))
          .position(null, sbTop, sbMargin, sbMargin, sbWidth, null)
          .visible(false)
          .vscroll('sb');
        if (sbStyle != null) {
          c.style(sbStyle);
        }
      }
      if (this._owner.popupOver) {
        let imageStyle = new UiStyleBuilder(this._owner.style)
          .borderSize('0px')
          .textAlign('center')
          .verticalAlign('middle')
          .build();
        b.element(new UiNode(app, 'node'))
          .bounds(0, 0, rOwner.width, rOwner.height)
          .focusable(true)
          .style(this._owner.style);
        b.belongs((b) => {
          b.element(new UiImageNode(app, 'overArrow'))
            .position(null, 0, 0, 0, imageHeight, null)
            .style(imageStyle)
            .imageContent(this._owner.arrowUrl[1]);
        });
      }
    });
  }

  private hideScrollbar(ms: number) {
    let scrollbar = this.findNodeByPath('sb') as UiScrollbar;
    this.application.runAfter(this, 1, ms, () => {
      scrollbar.visible = false;
      return UiResult.AFFECTED;
    });
  }

  protected afterMount(): void {
    let app = this.application;
    let dsName = this._owner.dataSourceName as string;
    let value = this._owner.getValue() as DataRecord;
    let key = value['key'] as string;
    (app.getDataSource(dsName) as DataSource).select({ key: key });
    this._owner.setLessArrow(true);
    this.hideScrollbar(VISIBLE_TIME);
  }

  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    if (this._owner.popupRows < ds.count()) {
      this._scrollVisible = true;
      (this.findNodeByPath('sb') as UiScrollbar).visible = true;
    } else {
      this._scrollVisible = false;
    }
    return UiResult.AFFECTED;
  }

  private moveItem(act: string, arg: any) {
    let result = UiResult.CONSUMED;
    if (this._scrollVisible) {
      (this.findNodeByPath('sb') as UiScrollbar).visible = true;
      this.hideScrollbar(VISIBLE_TIME);
      result = UiResult.EATEN;
    }
    return result;
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

  public arrowUrl(...value: string[]): this {
    let node = this.node as UiLookupField;
    node.arrowUrl = value;
    return this;
  }

  public popupRows(value: number): this {
    let node = this.node as UiLookupField;
    node.popupRows = value;
    return this;
  }

  public scrollbarWidth(size: Size): this {
    let node = this.node as UiLookupField;
    node.scrollbarWidth = size;
    return this;
  }

  public scrollbarMargin(size: Size): this {
    let node = this.node as UiLookupField;
    node.scrollbarMargin = size;
    return this;
  }
}

export class UiLookupField extends UiNode implements HasSetter<UiLookupFieldSetter> {
  public static readonly POPUP_ITEM_NAME = 'popupItem';
  public static readonly POPUP_SCROLLBAR_NAME = 'popupScrollbar';

  private _recordHolder: RecordHolder;

  private _moreUrl: string;

  private _lessUrl: string;

  private _popupRows: number;

  private _scrollbarWidth: CssLength;

  private _scrollbarMargin: CssLength;

  private _popup: UiLookupPopup | null;
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
      this._moreUrl = src._moreUrl;
      this._lessUrl = src._lessUrl;
      this._popupRows = src._popupRows;
      this._scrollbarWidth = src._scrollbarWidth;
      this._scrollbarMargin = src._scrollbarMargin;
      this._popup = src._popup;
    } else {
      super(param as UiApplication, name as string);
      let app = param as UiApplication;
      this.appendChild(new UiTextNode(app, 'text'));
      this.appendChild(new UiImageNode(app, 'arrow'));
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this._moreUrl = MORE_ARROW_DATA;
      this._lessUrl = LESS_ARROW_DATA;
      this._popupRows = DEFAULT_POPUP_ROWS;
      this._scrollbarWidth = CssLength.ZERO;
      this._scrollbarMargin = CssLength.ZERO;
      this._popup = null;
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

  public get arrowUrl(): string[] {
    return [this._moreUrl, this._lessUrl];
  }

  public set arrowUrl(urls: string[]) {
    this._moreUrl = urls.length > 0 ? urls[0] : MORE_ARROW_DATA;
    this._lessUrl = urls.length > 1 ? urls[1] : LESS_ARROW_DATA;
  }

  public get popupRows(): number {
    return this._popupRows;
  }

  public set popupRows(value: number) {
    this._popupRows = Math.max(1, value);
  }

  public get scrollbarWidth(): string {
    return this.scrollbarWidth.toString();
  }

  public set scrollbarWidth(arg: Size) {
    let value = new CssLength(arg);
    if (!CssLength.equals(this._scrollbarWidth, value)) {
      this._scrollbarWidth = value;
    }
  }

  public get scrollbarMargin(): string {
    return this.scrollbarMargin.toString();
  }

  public set scrollbarMargin(arg: Size) {
    let value = new CssLength(arg);
    if (!CssLength.equals(this._scrollbarMargin, value)) {
      this._scrollbarMargin = value;
    }
  }

  public scrollbarWidthAsLength(): CssLength {
    return this._scrollbarWidth;
  }

  public scrollbarMarginAsLength(): CssLength {
    return this._scrollbarMargin;
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
    image.imageContent = this._moreUrl;
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
    if (this.qualifierFieldName != null) {
      this.qualifier = this._recordHolder.getValue(this.qualifierFieldName) as string;
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
    this._popup = new UiLookupPopup(this.application, '', this);
    this.application.call(this._popup, new HistoryState('', {}));
    return UiResult.AFFECTED;
  }

  public getValue(): DataRecord {
    return this._recordHolder.getValue(this.name) as DataRecord;
  }

  public updateValue(subRecord: DataRecord): void {
    this._recordHolder.setValue(this.name, subRecord);
  }

  public setLessArrow(on: boolean) {
    let image = this.getImageNode();
    image.imageContent = on ? this._lessUrl : this._moreUrl;
  }

  public onDataSourceChanged(tag: string, ds: DataSource, at: number): UiResult {
    let result: UiResult = UiResult.IGNORED;
    if (this._popup != null) {
      result = this._popup?.onDataSourceChanged(tag, ds, at);
    }
    return result;
  }

  public onPopupDeleted() {
    this._popup = null;
  }
}
