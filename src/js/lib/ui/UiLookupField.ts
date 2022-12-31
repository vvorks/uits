import { Properties } from "../lang";
import { DataHolder } from "./DataHolder";
import { DataRecord } from "./DataSource";
import { KeyCodes } from "./KeyCodes";
import { UiLookupPopup } from "./UiLookupPopup";
import { UiNode, UiResult } from "./UiNode";
import { UiTextNode } from "./UiTextNode";

const SUBNAME_TITLE = "title";

export class UiLookupField extends UiTextNode {

	private _dataHolder: DataHolder = UiNode.VOID_DATA_HOLDER;

	public clone():UiLookupField {
		return new UiLookupField(this);
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		this._dataHolder = holder;
		let value = this._dataHolder.getValue(this.name) as DataRecord;
		if (value != null) {
			let title = value[SUBNAME_TITLE] as string;
			this.textContent = title;
		} else {
			this.textContent = "";
		}
		return UiResult.AFFECTED;
	}

	public onKeyDown(target: UiNode | null, key: number, ch: number, mod: number, at: number): UiResult {
		let result = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.ENTER:
			result |= this.showPopup({});
			break;
		}
		return result;
	}

	public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
		return this.showPopup({});
	}

	public showPopup(args:Properties<string>):UiResult {
		this.application.call(new UiLookupPopup(this.application, args, this));
		return UiResult.AFFECTED;
	}

	public updateValue(subRecord:DataRecord):void {
		this._dataHolder.setValue(this.name, subRecord);
	}

}