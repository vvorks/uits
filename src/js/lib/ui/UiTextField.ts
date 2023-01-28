import { Types, Value } from '~/lib/lang';
import { DataHolder } from '~/lib/ui/DataHolder';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { UiKeyboard } from '~/lib/ui/UiKeyboard';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import { HistoryState } from './HistoryManager';
import { UiApplication } from './UiApplication';

/**
 * テキスト入出力フィールド
 */
export class UiTextField extends UiTextNode {
  private _dataHolder: DataHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiTextField {
    return new UiTextField(this);
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
  constructor(src: UiTextField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiTextField) {
      super(param as UiTextField);
      let src = param as UiTextField;
      this._dataHolder = src._dataHolder;
    } else {
      super(param as UiApplication, name as string);
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
    }
  }

  public onDataHolderChanged(holder: DataHolder): UiResult {
    let result = UiResult.IGNORED;
    this._dataHolder = holder;
    let value = this._dataHolder.getValue(this.dataFieldName);
    if (value != null && Types.isValueType(value)) {
      this.textContent = value as Value;
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
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
    this.application.call(new UiKeyboard(this.application, '', this), new HistoryState('', {}));
    return UiResult.AFFECTED;
  }

  public getValue(): string {
    let result: string;
    let value = this._dataHolder.getValue(this.name);
    if (value != null && Types.isValueType(value)) {
      result = this.asString(value as Value);
    } else {
      result = '';
    }
    return result;
  }

  public setValue(value: string): void {
    this._dataHolder.setValue(this.name, value);
  }
}
