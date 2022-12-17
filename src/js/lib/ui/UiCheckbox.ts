import { Changed, UiNode, UiResult } from "./UiNode";
import offImage from "@images/checkbox-off.png";
import onImage  from "@images/checkbox-on.png";
import { DataHolder } from "./DataHolder";
import { KeyCodes } from "./KeyCodes";
import { UiImageNode } from "./UiImageNode";

export class UiCheckbox extends UiImageNode {

	private _dataHolder: DataHolder = UiNode.VOID_DATA_HOLDER;

	private _value:boolean = false;

	public clone():UiCheckbox {
		return new UiCheckbox(this);
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		this._dataHolder = holder;
		this.value = !!this._dataHolder.getValue(this.name);
		return UiResult.AFFECTED;
	}

	public get value():boolean {
		return this._value;
	}

	public set value(on:boolean) {
		this._value = on;
		this.imageContent = (on ? onImage : offImage);
		this._dataHolder.setValue(this.name, this._value);
		this.onContentChanged();
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

	public onMouseDown(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
		//Drag And Drop 動作を禁止させるためイベントを消費する
		return UiResult.CONSUMED;
	}

	public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
		return this.doChange();
	}

	private doChange(): UiResult {
		let result = UiResult.IGNORED;
		if (this.enable) {
			this.value = !this.value;
			result |= UiResult.AFFECTED;
		}
		return result;
	}

}