import { Types } from '~/lib/lang';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import { UiImageNode } from '~/lib/ui/UiImageNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

export class UiImageField extends UiImageNode {
  private _recordHolder: RecordHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiImageField {
    return new UiImageField(this);
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
  constructor(src: UiImageField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiImageField) {
      super(param as UiImageField);
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
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
      this.imageContent = value;
      result |= UiResult.AFFECTED;
    }
    return result;
  }
}
