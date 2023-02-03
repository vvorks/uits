import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { DataHolder } from '~/lib/ui/DataHolder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { UiImageNode } from '~/lib/ui/UiImageNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

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
  private _dataHolder: DataHolder;

  private _value: boolean;

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
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
      this._value = src._value;
    } else {
      super(param as UiApplication, name as string);
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
      this._value = false;
    }
  }

  public onDataHolderChanged(holder: DataHolder): UiResult {
    this._dataHolder = holder;
    this.value = !!this._dataHolder.getValue(this.dataFieldName);
    return UiResult.AFFECTED;
  }

  public get value(): boolean {
    return this._value;
  }

  public set value(on: boolean) {
    this._value = on;
    this.imageContent = on ? CHECKBOX_ON_DATA : CHECKBOX_OFF_DATA;
    this.imageWidth = '1rem';
    this._dataHolder.setValue(this.dataFieldName, this._value);
    this.onContentChanged();
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
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
