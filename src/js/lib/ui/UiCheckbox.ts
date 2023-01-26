import { UiNode, UiResult } from "~/lib/ui/UiNode";
import { DataHolder } from "~/lib/ui/DataHolder";
import { KeyCodes } from "~/lib/ui/KeyCodes";
import { UiImageNode } from "~/lib/ui/UiImageNode";
import { UiApplication } from "./UiApplication";

export class UiCheckbox extends UiImageNode {

	private _dataHolder: DataHolder;

	private _value:boolean;

	public clone():UiCheckbox {
		return new UiCheckbox(this);
	}

	constructor(app:UiApplication, name:string);
	constructor(src:UiCheckbox);
	public constructor(param:any, name?:string) {
		if (param instanceof UiCheckbox) {
			super(param as UiCheckbox);
			let src = param as UiCheckbox;
			this._dataHolder = UiNode.VOID_DATA_HOLDER;
			this._value = src._value;
		} else {
			super(param as UiApplication, name as string);
			this._dataHolder = UiNode.VOID_DATA_HOLDER;
			this._value = false;
		}
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		this._dataHolder = holder;
		this.value = !!this._dataHolder.getValue(this.dataFieldName);
		return UiResult.AFFECTED;
	}

	public get value():boolean {
		return this._value;
	}

	public set value(on:boolean) {
		this._value = on;
		this.imageContent = (on ? "/images/checkbox-on.png" : "/images/checkbox-off.png");
		this.imageWidth = "1rem";
		this._dataHolder.setValue(this.name, this._value);
		this.onContentChanged();
	}

	public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
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