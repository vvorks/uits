import
	{ Types }
	from "~/lib/lang";
import { DataHolder } from "~/lib/ui/DataHolder";
import { UiImageNode } from "~/lib/ui/UiImageNode";
import { UiNode, UiResult } from "~/lib/ui/UiNode";
import { UiApplication } from "./UiApplication";

export class UiImageField extends UiImageNode {

	private _dataHolder: DataHolder;

	public clone():UiImageField {
		return new UiImageField(this);
	}

	constructor(app:UiApplication, name:string);
	constructor(src:UiImageField);
	public constructor(param:any, name?:string) {
		if (param instanceof UiImageField) {
			super(param as UiImageField);
			this._dataHolder = UiNode.VOID_DATA_HOLDER;
		} else {
			super(param as UiApplication, name as string);
			this._dataHolder = UiNode.VOID_DATA_HOLDER;
		}
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
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