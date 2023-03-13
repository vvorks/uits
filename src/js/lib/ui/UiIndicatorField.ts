import { Types } from '~/lib/lang';
import { RecordHolder } from '~/lib/ui/RecordHolder';
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
  private _recordHolder: RecordHolder;

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
      this._recordHolder = src._recordHolder;
    } else {
      //新規コンストラクタ
      super(param as UiApplication, name as string);
      let app = param as UiApplication;
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
    }
  }

  /**
   * データフィールドの更新通知
   *
   * @param holder データホルダー（実態は例えばUiListNode中のUiRecordオブジェクト）
   * @returns データを受け取り、表示を更新する場合、UiResult.AFFECTEDを返す
   */
  public onRecordHolderChanged(holder: RecordHolder): UiResult {
    let result = UiResult.IGNORED;
    this._recordHolder = holder;
    let value = this._recordHolder.getValue(this.dataFieldName);
    if (Types.isNumber(value)) {
      this.indicatorValue = value as number;
      result |= UiResult.AFFECTED;
    } else {
      this.indicatorValue = 0.0;
    }
    if (this.qualifierFieldName != null) {
      this.qualifier = this._recordHolder.getValue(this.qualifierFieldName) as string;
    }
    return result;
  }
}
