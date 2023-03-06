import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { UiImageNode, UiImageNodeSetter } from '~/lib/ui/UiImageNode';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { Logs } from '../lang';

export class UiCheckboxSetter extends UiImageNodeSetter {
  public static readonly INSTANCE = new UiCheckboxSetter();
  public checkBoxUrl(...value: string[]): this {
    let node = this.node as UiCheckbox;
    if (value.length != 2) {
      Logs.debug('There are missing or too many arguments.');
      return this;
    }
    node.setCheckBoxUrl(value);
    return this;
  }
}
//
//取得元 https://fonts.google.com/icons?utm_source=developers.google.com&utm_medium=referral
//
const CHECKBOX_ON_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAYhJ' +
  'REFUaEPtmV1RxjAQRc+nABwADpAATsABDgAHOAAJOEACSAAF4ADmzpCZTkmT5q9Jmc1LH5qk9+zdJNvJgZ23w871Yw' +
  'C9HTQHRnfgFrgBjjsJ/QIegPul74dS6A4QwAhNANLzp4UAPjtGfi70HThLBfieDOi12KMaQsKigzfIragGA2jsgjng' +
  'AmyLOJBqOiQvgGdPn+FTSOJfgHPgGniaQQwNMBXvdOuw0qHl2rAAPvG7cWCteLkwnAMp4psDuBJbJe+aliq+KYATo4' +
  '9cAjGIHPFNAV5/tz595C0CkSu+KcAV8DjJmyWIEvFNATR5DKJUfHOAEITeuRPWGeXb52OLf5Nt1OeEhKk8KBG/iQNO' +
  '4BxiGtmcyHcpJXwQJeI3dcDnRKn4LgBuYes5L41jC9b3fpNFnCNs7RgDcJGyf+K1OTPrZylkKZSZOlVOYv2kHBUKqD' +
  'X8Azj1TfavLzgErFsR1TgntUKZOI8irxPdezujuXrt74kcy90NoFooMycyBzIDV23Y7h34AUCpeTFLKmKAAAAAAElF' +
  'TkSuQmCC';

//
//取得元 https://fonts.google.com/icons?utm_source=developers.google.com&utm_medium=referral
//
const CHECKBOX_OFF_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAO9J' +
  'REFUaEPtmdENwjAMRF8ngA2AzRiBDYANGIHR6ASwAchCFQhIraQFN+jy27r1nV/ipmmofDSV548ERFdQFZh6BbbABp' +
  'gHJXoBDsA+9f4+hHaACZjCMAGWz9voE3AOdP410ROwyhVwfQqImuxuDn2JucE/YMvNQQK+XAVVoDNYk7gQNSEkhArR' +
  '6cKEkBASQg8HPvYifQsNRMQL1yqkVchjxLkuhISQEFIjuzugLWXhXNAyqmW0EB1tKc0BO1yYDXRwrPAWWOb+Xq/+gM' +
  'MEm4g1sBjLysznmPPH1OlMZIPK1JG+ParDSkB0g1IF/qYCN8VySjHeyclUAAAAAElFTkSuQmCC';

export class UiCheckbox extends UiImageNode {
  private _recordHolder: RecordHolder;

  private _value: boolean;

  private _checkBoxOnData: string;

  private _checkBoxOffData: string;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiCheckbox {
    return new UiCheckbox(this);
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
  constructor(src: UiCheckbox);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiCheckbox) {
      super(param as UiCheckbox);
      let src = param as UiCheckbox;
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this._value = src._value;
      this._checkBoxOnData = src._checkBoxOnData;
      this._checkBoxOffData = src._checkBoxOffData;
    } else {
      super(param as UiApplication, name as string);
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this._value = false;
      this._checkBoxOnData = CHECKBOX_ON_DATA;
      this._checkBoxOffData = CHECKBOX_OFF_DATA;
    }
  }

  public onRecordHolderChanged(holder: RecordHolder): UiResult {
    this._recordHolder = holder;
    this.value = !!this._recordHolder.getValue(this.dataFieldName);
    return UiResult.AFFECTED;
  }

  public get value(): boolean {
    return this._value;
  }

  public set value(on: boolean) {
    this._value = on;
    this.imageContent = on ? this._checkBoxOnData : this._checkBoxOffData;
    if (this.innerWidth > this.innerHeight) {
      this.imageWidth = null;
      this.imageHeight = '100%';
    } else {
      this.imageWidth = '100%';
      this.imageHeight = null;
    }
    this._recordHolder.setValue(this.dataFieldName, this._value);
    this.onContentChanged();
  }

  public getSetter(): UiCheckboxSetter {
    return UiCheckboxSetter.INSTANCE;
  }
  public setCheckBoxUrl(value: string[]) {
    if (value[0] != null && value[1] != null) {
      this._checkBoxOnData = value[0];
      this._checkBoxOffData = value[1];
    }
    Logs.info(this._checkBoxOnData + ':' + this._checkBoxOffData);
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        result |= this.doChange();
        break;
    }
    return result;
  }

  public onMouseDown(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    //Drag And Drop 動作を禁止させるためイベントを消費する
    return UiResult.CONSUMED;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.doChange();
  }

  private doChange(): UiResult {
    let result = UiResult.IGNORED;
    if (this.enable) {
      this.value = !this.value;
      result |= UiResult.AFFECTED;
    }
    return result;
  }
}
