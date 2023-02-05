import { Types, Value, Values } from '../lang';
import { RecordHolder } from './RecordHolder';
import type { UiApplication } from './UiApplication';
import { UiEditNode } from './UiEditNode';
import { UiNode, UiResult } from './UiNode';

export class UiEditField extends UiEditNode {
  private _recordHolder: RecordHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiEditField {
    return new UiEditField(this);
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
  constructor(src: UiEditNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiEditField) {
      super(param as UiEditField);
      let src = param as UiEditField;
      this._recordHolder = src._recordHolder;
    } else {
      super(param as UiApplication, name as string);
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
    }
  }

  public onRecordHolderChanged(holder: RecordHolder): UiResult {
    let result = UiResult.IGNORED;
    this._recordHolder = holder;
    let value = this._recordHolder.getValue(this.dataFieldName);
    if (value != null && Types.isValueType(value)) {
      this.textContent = Values.asString(value as Value);
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  public editDone(commit: boolean): UiResult {
    let result = super.editDone(commit);
    if (commit) {
      let value = this.textContent;
      this._recordHolder.setValue(this.dataFieldName, value);
    }
    return result;
  }
}
