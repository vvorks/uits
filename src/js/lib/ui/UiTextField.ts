import { Types, Value } from '~/lib/lang';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

/**
 * テキスト入出力フィールド
 *
 * （入力については未対応）
 */
export class UiTextField extends UiTextNode {
  private _recordHolder: RecordHolder;

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
      this.textContent = value as Value;
      result |= UiResult.AFFECTED;
    } else {
      this.textContent = null;
    }
    return result;
  }
}
