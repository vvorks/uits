import { Types } from '~/lib/lang';
import { DataHolder } from '~/lib/ui/DataHolder';
import { UiImageNode } from '~/lib/ui/UiImageNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import type { UiApplication } from '~/lib/ui/UiApplication';

export class UiImageField extends UiImageNode {
  private _dataHolder: DataHolder;

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
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
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
      this.imageContent = value;
      result |= UiResult.AFFECTED;
    }
    return result;
  }
}
