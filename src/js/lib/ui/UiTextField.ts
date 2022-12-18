import { Types, Value } from "../lang";
import { DataHolder } from "./DataHolder";
import { UiNode, UiResult } from "./UiNode";
import { UiTextNode } from "./UiTextNode";

/**
 * テキスト入出力フィールド
 */
export class UiTextField extends UiTextNode {

	private _dataHolder: DataHolder = UiNode.VOID_DATA_HOLDER;

	public clone():UiTextField {
		return new UiTextField(this);
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		let result = UiResult.IGNORED;
		this._dataHolder = holder;
		let value = this._dataHolder.getValue(this.name);
		if (value != null && Types.isValueType(value)) {
			this.textContent = value as Value;
			result |= UiResult.AFFECTED;
		}
		return result;
	}

}