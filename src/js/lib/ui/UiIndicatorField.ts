import { Logs, Types } from '~/lib/lang';
import { DataHolder } from '~/lib/ui/DataHolder';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { UiIndicatorNode } from '~/lib/ui/UiIndicatorNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';

/**
 * UiIndicator 値（0.0～1.0）をバーチャートのように表示するUIコンポーネント
 */
export class UiIndicatorField extends UiIndicatorNode {
  /**
   * データホルダー
   */
  private _dataHolder: DataHolder;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiIndicatorField {
    return new UiIndicatorField(this);
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
  constructor(src: UiIndicatorField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiIndicatorField) {
      //複製コンストラクタ
      super(param as UiIndicatorField);
      let src = param as UiIndicatorField;
      this._dataHolder = src._dataHolder;
    } else {
      //新規コンストラクタ
      super(param as UiApplication, name as string);
      let app = param as UiApplication;
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
    }
  }

  /**
   * データフィールドの更新通知
   *
   * @param holder データホルダー（実態は例えばUiListNode中のUiRecordオブジェクト）
   * @returns データを受け取り、表示を更新する場合、UiResult.AFFECTEDを返す
   */
  public onDataHolderChanged(holder: DataHolder): UiResult {
    let result = UiResult.IGNORED;
    this._dataHolder = holder;
    let value = this._dataHolder.getValue(this.dataFieldName);
    if (Types.isNumber(value)) {
      this.indicatorValue = value as number;
      result |= UiResult.AFFECTED;
    }
    return result;
  }
}
