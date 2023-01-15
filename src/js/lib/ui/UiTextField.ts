import
	{ Properties, Types, Value }
	from "~/lib/lang";
import { DataHolder } from "~/lib/ui/DataHolder";
import { KeyCodes } from "~/lib/ui/KeyCodes";
import { UiKeyboard } from "~/lib/ui/UiKeyboard";
import { UiNode, UiResult } from "~/lib/ui/UiNode";
import { UiTextNode } from "~/lib/ui/UiTextNode";

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

	public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
		let result = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.ENTER:
			result |= this.showPopup();
			break;
		}
		return result;
	}

	public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
		return this.showPopup();
	}

	public showPopup():UiResult {
		let args:Properties<string> = {};
		let value = this._dataHolder.getValue(this.name);
		if (value != null && Types.isValueType(value)) {
			args["value"] = this.asString(value as Value);
		}
		this.application.call(new UiKeyboard(this.application, args, this));
		return UiResult.AFFECTED;
	}

	public updateValue(value:string):void {
		this._dataHolder.setValue(this.name, value);
	}

}