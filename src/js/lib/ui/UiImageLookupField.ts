import { Properties, Types } from '~/lib/lang';
import { DataHolder } from '~/lib/ui/DataHolder';
import { UiImageNode, UiImageNodeSetter } from '~/lib/ui/UiImageNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { HasSetter } from '~/lib/ui/UiBuilder';

export class UiImageLookupFieldSetter extends UiImageNodeSetter {
  public static readonly INSTANCE = new UiImageLookupFieldSetter();
  public lookupTable(table: Properties<any>): this {
    let node = this.node as UiImageLookupField;
    node.lookupTable = table;
    return this;
  }
}

export class UiImageLookupField extends UiImageNode implements HasSetter<UiImageLookupFieldSetter> {
  private _dataHolder: DataHolder;

  private _lookupTable: Properties<any>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiImageLookupField {
    return new UiImageLookupField(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  public constructor(app: UiApplication, name: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  public constructor(src: UiImageLookupField);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiImageLookupField) {
      super(param as UiImageLookupField);
      let src = param as UiImageLookupField;
      this._dataHolder = src._dataHolder;
      this._lookupTable = src._lookupTable;
    } else {
      super(param as UiApplication, name as string);
      this._dataHolder = UiNode.VOID_DATA_HOLDER;
      this._lookupTable = {};
    }
  }

  public getSetter(): UiImageLookupFieldSetter {
    return UiImageLookupFieldSetter.INSTANCE;
  }

  public get lookupTable(): Properties<any> {
    return this._lookupTable;
  }

  public set lookupTable(table: Properties<any>) {
    this._lookupTable = table;
  }

  public onDataHolderChanged(holder: DataHolder): UiResult {
    let result = UiResult.IGNORED;
    this._dataHolder = holder;
    let value = this._dataHolder.getValue(this.dataFieldName);
    if (value != null && Types.isString(value)) {
      let image = this._lookupTable[value as string];
      if (image !== undefined) {
        this.imageContent = image;
        result |= UiResult.AFFECTED;
      } else {
        this.imageContent = null;
      }
    }
    return result;
  }
}
