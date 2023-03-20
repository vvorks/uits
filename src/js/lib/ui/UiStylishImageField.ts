import { Properties, Types, Value, Values } from '~/lib/lang';
import { RecordHolder } from '~/lib/ui/RecordHolder';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { UiImageNode } from '~/lib/ui/UiImageNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';

export class UiStylishImageField extends UiImageNode {
  private _recordHolder: RecordHolder;
  private _imageUrls: Properties<string>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiStylishImageField {
    return new UiStylishImageField(this);
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
  constructor(src: UiStylishImageField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiStylishImageField) {
      super(param as UiStylishImageField);
      let src = param as UiStylishImageField;
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this._imageUrls = src._imageUrls;
    } else {
      super(param as UiApplication, name as string);
      this._recordHolder = UiNode.VOID_RECORD_HOLDER;
      this._imageUrls = {};
    }
  }

  public onRecordHolderChanged(holder: RecordHolder): UiResult {
    let result = UiResult.IGNORED;
    this._recordHolder = holder;
    this._imageUrls = this.getValues();
    //this.updateImage();
    if (this.qualifierFieldName != null) {
      this.qualifier = this._recordHolder.getValue(this.qualifierFieldName) as string;
    }
    return UiResult.AFFECTED;
  }

  private getValues(): Properties<string> {
    let rec = this._recordHolder.getRecord();
    let result: Properties<string> = {};
    if (rec != null) {
      for (const [key, value] of Object.entries(rec)) {
        if (key.startsWith(this.dataFieldName)) {
          let subkey = key.substring(this.dataFieldName.length);
          result[subkey] = Values.asString(value as Value);
        }
      }
    }
    return result;
  }

  protected syncStyleClass(): boolean {
    let result = super.syncStyleClass();
    if (result) {
      this.onContentChanged();
    }
    return result;
  }

  protected renderContent(): void {
    let style = this.style.getEffectiveStyle(this);
    let url = this._imageUrls[style.hint];
    if (url != undefined && this.imageContent !== url) {
      this.imageContent = url;
    }
    super.renderContent();
  }
}
