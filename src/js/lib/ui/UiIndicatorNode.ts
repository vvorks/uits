import { Types } from "../lang";
import { DataHolder } from "./DataHolder";
import { UiApplication } from "./UiApplication";
import { UiNode, UiResult } from "./UiNode";

/**
 * UiIndicator 値（0.0～1.0）をバーチャートのように表示するUIコンポーネント
 */
export class UiIndicatorNode extends UiNode {

    /**
     * オン部分（色のついた部分）を表現するUiNode
     */
    private _onNode: UiNode;

    /**
     * 表示すべき値。0.0～1.0までの値を取る
     */
    private _indicatorValue: number;

    /**
     * クローン操作
     * 
     * @returns オブジェクトの複製
     */
    public clone(): UiIndicatorNode {
        return new UiIndicatorNode(this);
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
    constructor(src: UiIndicatorNode);

    /**
     * コンストラクタ実装
     * 
     * @param param 第一引数
     * @param name 第二引数
     */
    public constructor(param: any, name?: string) {
        if (param instanceof UiIndicatorNode) {
            //複製コンストラクタ
            super(param as UiIndicatorNode);
            let src = param as UiIndicatorNode;
            //子ノードとして登録済み（そして基底クラスでクローン済）のノードを取得、保持する。
            this._onNode = this.getChildAt(0);
            //その他項目の複製
            this._indicatorValue = src._indicatorValue;
        } else {
            //新規コンストラクタ
            super(param as UiApplication, name as string);
            let app = param as UiApplication;
            //子ノードを作成
            this._onNode = new UiNode(app, "on");
            //自身に登録
            this.appendChild(this._onNode);
            //その他項目の初期化
            this._indicatorValue = 0.0;
        }
    }

    /**
     * 現在の表示値を取得する
     */
    public get indicatorValue(): number {
        return this._indicatorValue;
    }

    /**
     * 現在の表示値を変更する
     */
    public set indicatorValue(value: number) {
        if (this._indicatorValue != value) {
            //変更された値を保持
            this._indicatorValue = value;
            if (this.isVertical()) {
                this.updatgeVertical(value);
            } else {
                this.updatgeHorizontal(value);
            }
            //変更フラグを設定
            this.onContentChanged();
        }
    }

    private isVertical(): boolean {
        let rect = this.getRect();
        return rect.width < rect.height;
    }

    private updatgeVertical(ratio: number): void {
        const totalHeight = this.getRect().height;
        const height = Math.round(totalHeight * ratio);
        this._onNode.position(0, null, 0, 0, null, height);
    }

    private updatgeHorizontal(ratio: number): void {
        const totalWidth = this.getRect().width;
        const width = Math.round(totalWidth * ratio);
        this._onNode.position(0, 0, null, 0, width, null);
    }

    /**
     * スタイル設定変更通知
     */
    protected onStyleChanged(): void {
        //このノードに設定された値を取得
        let style = this.style;
        //基底クラスのコピーコンストラクタ実行中、未初期化状態で呼び出される場合があるためnullチェック
        if (this._onNode != null) {
            //onNode, offNodeに配布
            this._onNode.style = style;
        }
    }

}