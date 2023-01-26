import { Logs, Types } from "../lang";
import { DataHolder } from "./DataHolder";
import { UiApplication } from "./UiApplication";
import { UiIndicatorNode } from "./UiIndicatorNode";
import { UiNode, UiResult } from "./UiNode";

/**
 * UiIndicator 値（0.0～1.0）をバーチャートのように表示するUIコンポーネント
 */
export class UiIndicatorField extends UiIndicatorNode {

    /**
     * データホルダー
     */
    private _dataHolder: DataHolder;

    /**
     * クローン操作
     * 
     * @returns オブジェクトの複製
     */
    public clone(): UiIndicatorField {
        return new UiIndicatorField(this);
    }

    /**
     *  新規コンストラクタ
     * 
     * @param app UiApplication
     * @param name ノード名
     */
    constructor(app: UiApplication, name: string);

    /**
     *  複製コンストラクタ
     * 
     * @param app UiApplication
     * @param name ノード名
     */
    constructor(src: UiIndicatorField);

    /**
     * コンストラクタ実装
     * 
     * @param param 第一引数
     * @param name 第二引数
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
            Logs.info("IND %g", value as number);
            this.indicatorValue = value as number;
            result |= UiResult.AFFECTED;
        }
        return result;
    }

}