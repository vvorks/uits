import
	{ Value }
	from "~/lib/lang";
import { UiImageNode } from "~/lib/ui/UiImageNode";
import { DataHolder } from "~/lib/ui/DataHolder";
import { KeyCodes } from "~/lib/ui/KeyCodes";
import { UiNode, UiResult } from "~/lib/ui/UiNode";
import { UiApplication } from "~/lib/ui/UiApplication";
import offImage from "@images/radio-off.png";
import onImage  from "@images/radio-on.png";

export class UiRadio extends UiImageNode {

	private _dataHolder: DataHolder;

	private _value: Value|null;

	private _specValue: Value;

	public clone():UiRadio {
		return new UiRadio(this);
	}

	constructor(app:UiApplication, name:string, spec:Value);
	constructor(src:UiRadio);
	public constructor(param:any, name?:string, spec?:Value) {
		if (param instanceof UiRadio) {
			super(param as UiRadio);
			let src = param as UiRadio;
			this._dataHolder = src._dataHolder;
			this._value = src._value;
			this._specValue = src._specValue;
		} else {
			super(param as UiApplication, name);
			this._dataHolder = UiNode.VOID_DATA_HOLDER;
			this._value = null;
			this._specValue = spec as Value;
		}
	}

	public onDataHolderChanged(holder:DataHolder):UiResult {
		this._dataHolder = holder;
		this.value = this._dataHolder.getValue(this.name) as Value;
		return UiResult.AFFECTED;
	}

	public get value():Value {
		return this._value;
	}

	public set value(v:Value) {
		if (this._value != v) {
			this._value = v;
			this.imageContent = this.matched ? onImage : offImage;
			this.imageSize = "1rem";
			this._dataHolder.setValue(this.name, this._value);
			this.onContentChanged();
		}
	}

	private get matched():boolean {
		return this._value == this._specValue;
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
		if (this.enable && !this.matched) {
			this.value = this._specValue;
			result |= UiResult.AFFECTED;
		}
		return result;
	}

}