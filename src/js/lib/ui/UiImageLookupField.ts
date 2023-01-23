import
	{ Logs,
Properties,
Types }
	from "~/lib/lang";
import { DataHolder } from "~/lib/ui/DataHolder";
import { UiImageNode } from "~/lib/ui/UiImageNode";
import { UiNode, UiResult } from "~/lib/ui/UiNode";
import { UiApplication } from "./UiApplication";

export class UiImageLookupField extends UiImageNode {

	private _dataHolder: DataHolder;

	private _lookupTable: Properties<any>;

	public clone():UiImageLookupField {
		return new UiImageLookupField(this);
	}

	public constructor(app:UiApplication, name:string);
	public constructor(src:UiImageLookupField);
	public constructor(param:any, name?:string) {
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

	public get lookupTable():Properties<any> {
		return this._lookupTable;
	}

	public set lookupTable(table:Properties<any>) {
		Logs.debug("lookupTable %s", JSON.stringify(table));
		this._lookupTable = table;
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		let result = UiResult.IGNORED;
		this._dataHolder = holder;
		let value = this._dataHolder.getValue(this.name);
		if (value != null && Types.isString(value)) {
			let image = this._lookupTable[value as string];
			if (image !== undefined) {
				Logs.debug("%s image %s", value as string, image);
				this.imageContent = image;
				result |= UiResult.AFFECTED;
			}
		}
		return result;
	}

}