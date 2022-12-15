import { Changed, UiNode, UiResult } from "./UiNode";
import offImage from "@images/checkbox-off.png";
import onImage  from "@images/checkbox-on.png";
import { DataHolder } from "./DataHolder";
import { KeyCodes } from "./KeyCodes";
import { UiImageNode } from "./UiImageNode";

export class UiCheckbox extends UiImageNode {

	private _dataHolder: DataHolder|null = null;

	private _value:boolean = false;

	public clone():UiCheckbox {
		return new UiCheckbox(this);
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		let result = UiResult.IGNORED;
		this._dataHolder = holder;
		let v = !!this._dataHolder.getValue(this.name);
		if (v != this._value) {
			this._value = v;
			this.onContentChanged();
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	public onKeyDown(target: UiNode | null, key: number, ch: number, mod: number, at: number): UiResult {
		let result = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.ENTER:
			result |= this.doChange();
			break;
		}
		return result;
	}

	public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
		return this.doChange();
	}

	private doChange(): UiResult {
		let result = UiResult.IGNORED;
		if (this._dataHolder != null && this.enable) {
			this._value = !this._value;
			this._dataHolder.setValue(this.name, this._value);
			this.onContentChanged();
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	protected syncContent():void {
		if (!this.isChanged(Changed.CONTENT)) {
			return;
		}
		this.image = (this._value ? onImage : offImage);
		this.setChanged(Changed.CONTENT, false);
	}

}