import { Logs, Types, Value } from "../lang";
import { DataHolder } from "./DataHolder";
import { UiNode, UiResult } from "./UiNode";

export class UiTextNode extends UiNode {

	private _dataHolder: DataHolder|null = null;

	public clone():UiTextNode {
		return new UiTextNode(this);
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		let result = UiResult.IGNORED;
		this._dataHolder = holder;
		let value:Value|null = this._dataHolder.getValue(this.name);
		if (value != null) {
			this.content = value;
			result |= UiResult.AFFECTED;
		}
		return result;
	}

}