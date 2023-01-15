import
	{ Types }
	from "~/lib/lang";
import { DataHolder } from "~/lib/ui/DataHolder";
import { UiImageNode } from "~/lib/ui/UiImageNode";
import { UiNode, UiResult } from "~/lib/ui/UiNode";

export class UiImageField extends UiImageNode {

	private _dataHolder: DataHolder = UiNode.VOID_DATA_HOLDER;

	public clone():UiImageField {
		return new UiImageField(this);
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		let result = UiResult.IGNORED;
		this._dataHolder = holder;
		let value = this._dataHolder.getValue(this.name);
		if (value != null && Types.isValueType(value)) {
			this.imageContent = value;
			result |= UiResult.AFFECTED;
		}
		return result;
	}

}