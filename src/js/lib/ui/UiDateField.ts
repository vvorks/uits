import { Dates, Types, Value } from '~/lib/lang';
import { Colors } from '~/lib/ui/Colors';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import { FIELD_STYLE, GROUP_STYLE, UiApplication } from '~/lib/ui/UiApplication';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiBuilder } from '~/lib/ui/UiBuilder';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiTextButton } from '~/lib/ui/UiTextButton';
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

/* 曜日データ（TODO 暫定：本当はI18nライブラリから取らないと・・・） */
const WEEKS = ['日', '月', '火', '水', '木', '金', '土'];

class UiMonthNode extends UiTextNode {
  private _yearMode: boolean;

  private _month: Date;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiMonthNode {
    return new UiMonthNode(this);
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
  constructor(src: UiMonthNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiMonthNode) {
      super(param as UiMonthNode);
      let src = param as UiMonthNode;
      this._yearMode = src._yearMode;
      this._month = new Date(src._month.getTime());
    } else {
      super(param as UiApplication, name as string);
      this._yearMode = false;
      this._month = new Date();
    }
  }

  public setMonth(month: Date): void {
    this._month = month;
    this.updateContent();
  }

  private updateContent(): void {
    if (this._yearMode) {
      this.textContent = `◀◀ ${this._month.getFullYear()}年${this._month.getMonth() + 1}月 ▶▶`;
    } else {
      this.textContent = `◀ ${this._month.getFullYear()}年${this._month.getMonth() + 1}月 ▶`;
    }
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.UP:
        if (!this._yearMode) {
          this._yearMode = true;
          this.updateContent();
          result = UiResult.EATEN;
        }
        break;
      case KeyCodes.DOWN:
        if (this._yearMode) {
          this._yearMode = false;
          this.updateContent();
          result = UiResult.EATEN;
        }
        break;
      case KeyCodes.LEFT:
        if (this._yearMode) {
          this.fireActionEvent('changeTo', Dates.getLastYear(this._month));
        } else {
          this.fireActionEvent('changeTo', Dates.getLastMonth(this._month));
        }
        result = UiResult.AFFECTED;
        break;
      case KeyCodes.RIGHT:
        if (this._yearMode) {
          this.fireActionEvent('changeTo', Dates.getNextYear(this._month));
        } else {
          this.fireActionEvent('changeTo', Dates.getNextMonth(this._month));
        }
        result = UiResult.AFFECTED;
        break;
    }
    return result;
  }
}

class UiDateNode extends UiTextButton {
  private _month: Date;

  private _date: Date;

  public clone(): UiDateNode {
    return new UiDateNode(this);
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
  constructor(src: UiDateNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiDateNode) {
      super(param as UiDateNode);
      let src = param as UiDateNode;
      this._month = src._month;
      this._date = src._date;
    } else {
      super(param as UiApplication, name as string);
      let now = new Date();
      this._month = now;
      this._date = now;
    }
  }

  public setDate(month: Date, date: Date, i: number): void {
    this._month = month;
    this._date = date;
    this.textContent = date.getDate();
    //色指定
    let week = date.getDay();
    if (!Dates.isSameMonth(month, date)) {
      this.textColor = Colors.SILVER;
    } else if (week == 0) {
      this.textColor = Colors.RED;
    } else if (week == 6) {
      this.textColor = Colors.BLUE;
    } else {
      this.textColor = null;
    }
  }

  protected doAction(): UiResult {
    if (!Dates.isSameMonth(this._month, this._date)) {
      this.fireActionEvent('changeTo', this._date);
    } else {
      this.fireActionEvent('select', this._date);
    }
    return UiResult.EATEN;
  }
}

class UiDatePopup extends UiPageNode {
  private _owner: UiDateField;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiDatePopup {
    return new UiDatePopup(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string, owner: UiDateField);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiDatePopup);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string, owner?: UiDateField) {
    if (param instanceof UiDatePopup) {
      super(param as UiDatePopup);
      let src = param as UiDatePopup;
      this._owner = src._owner;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiDateField;
    }
  }

  protected initialize(): void {
    //処理準備
    let app = this.application;
    let arg = new Date(); //new Date(Number.parseInt(args["value"] as string));
    let bom = Dates.getBeginningOfMonth(arg);
    let lm = Dates.getLastMonth(bom);
    let top = Dates.addDay(lm, -lm.getDay());
    const UNIT = 24;
    let b = new UiBuilder('1px');
    b.element(this);
    b.belongs((b) => {
      //レイアウト定義
      b.element(new UiNode(app, 'frame')).inset(0);
      b.belongs((b) => {
        b.element(new UiMonthNode(app, 'month'))
          .position(0, 0, 0, null, null, 1 * UNIT)
          .style(FIELD_STYLE)
          .focusable(true)
          .action((src, act, arg) => this.watchMonth(src, act, arg));
        //曜日行
        for (let c = 0; c < WEEKS.length; c++) {
          b.element(new UiTextNode(app, 'week'))
            .bounds(c * UNIT, 1 * UNIT, 1 * UNIT, 1 * UNIT)
            .style(FIELD_STYLE)
            .textContent(WEEKS[c]);
        }
        //日付ブロック
        b.element(new UiNode(app, 'days'))
          .position(0, 2 * UNIT, null, null, WEEKS.length * UNIT, 6 * UNIT)
          .style(GROUP_STYLE);
        b.belongs((b) => {
          for (let i = 0; i < WEEKS.length * 6; i++) {
            const day = Dates.addDay(top, i);
            b.element(new UiDateNode(app, 'day'))
              .bounds(Math.floor(i % 7) * UNIT, Math.floor(i / 7) * UNIT, 1 * UNIT, 1 * UNIT)
              .style(FIELD_STYLE)
              .focusable(true)
              .action((src, act, arg) => this.watchDate(src, act, arg));
          }
        });
      });
    });
    //位置設定
    let rOwner = this._owner.getRectOnRoot();
    let rPopup = new Rect().locate(0, 0, 7 * UNIT, 8 * UNIT);
    let rClient = app.getClientRect();
    this.relocate(rPopup, rOwner, rClient);
    this.left = `${rPopup.left}px`;
    this.top = `${rPopup.top}px`;
    this.width = `${rPopup.width}px`;
    this.height = `${rPopup.height}px`;
  }

  private relocate(rPopup: Rect, rOwner: Rect, rClient: Rect) {
    //Y軸調整
    if (rClient.bottom - rOwner.bottom >= rPopup.height) {
      rPopup.position(rOwner.left, rOwner.bottom);
    } else if (rOwner.top >= rPopup.height) {
      rPopup.position(rOwner.left, rOwner.top - rPopup.height);
    } else {
      rPopup.position(rOwner.left, (rClient.bottom - rPopup.height) / 2);
    }
    //X軸補正
    if (rPopup.right > rClient.right) {
      rPopup.move(rClient.right - rPopup.right, 0);
    }
  }

  protected afterMount(): void {
    let value = new Date(this._owner.getValue() as number);
    this.reload(value, true);
  }

  private reload(date: Date, doFocus: boolean): void {
    let app = this.application;
    let bom = Dates.getBeginningOfMonth(date);
    let lm = Dates.getLastMonth(bom);
    let top = Dates.addDay(lm, -lm.getDay());
    let month = this.findNodeByPath('frame/month') as UiMonthNode;
    month.setMonth(bom);
    let days = this.findNodeByPath('frame/days') as UiTextNode;
    for (let i = 0; i < 7 * 6; i++) {
      const day = Dates.addDay(top, i);
      let e = days.getChildAt(i) as UiDateNode;
      e.setDate(bom, day, i);
      if (doFocus && Dates.isSameDay(date, day)) {
        app.setFocus(e);
      }
    }
  }

  private watchMonth(src: UiNode, act: string, arg: any): UiResult {
    if (act == 'changeTo') {
      this.reload(arg as Date, false);
    }
    return UiResult.EATEN;
  }

  private watchDate(src: UiNode, act: string, arg: any): UiResult {
    if (act == 'changeTo') {
      this.reload(arg as Date, true);
    } else if (act == 'select') {
      this._owner.setValue((arg as Date).getTime());
      this.application.dispose(this);
    }
    return UiResult.EATEN;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ESCAPE:
        this.application.dispose(this);
        result |= UiResult.EATEN;
        break;
      default:
        result |= super.onKeyDown(target, key, ch, mod, at);
        break;
    }
    return result;
  }
}

export class UiDateField extends UiNode {
  private _recordHolder: RecordHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiDateField {
    return new UiDateField(this);
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
  constructor(src: UiDateField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiDateField) {
      super(param as UiDateField);
      let src = param as UiDateField;
      this._recordHolder = src._recordHolder;
    } else {
      super(param as UiApplication, name as string);
      let app = param as UiApplication;
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this.appendChild(new UiTextNode(app, 'text'));
      this.appendChild(new UiImageNode(app, 'arrow'));
    }
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
    let result = UiResult.IGNORED;
    this._recordHolder = holder;
    let value = this._recordHolder.getValue(this.dataFieldName);
    if (value != null && Types.isValueType(value)) {
      this.getTextNode().textContent = this.formatDate(this.toDate(value as Value));
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  private formatDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  private toDate(v: Value): Date {
    if (Types.isString(v)) {
      return new Date(Date.parse(v as string));
    } else if (Types.isNumber(v)) {
      return new Date(v as number);
    }
    return new Date();
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        result |= this.showPopup();
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.showPopup();
  }

  public showPopup(): UiResult {
    this.application.call(new UiDatePopup(this.application, '', this), new HistoryState('', {}));
    return UiResult.AFFECTED;
  }

  public getValue(): Value {
    let result: Value;
    let value = this._recordHolder.getValue(this.name);
    if (value != null && Types.isValueType(value)) {
      result = value as Value;
    } else {
      result = null;
    }
    return result;
  }

  public setValue(value: Value): void {
    this._recordHolder.setValue(this.name, value);
  }
}
