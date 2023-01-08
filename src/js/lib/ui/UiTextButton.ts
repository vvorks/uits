import { KeyCodes } from "./KeyCodes";
import { UiApplication } from "./UiApplication";
import { UiNode, UiResult } from "./UiNode";
import { UiTextNode } from "./UiTextNode";

export type ActionFunc = (source:UiNode) => UiResult;

/**
 * テキストボタン
 */
export class UiTextButton extends UiTextNode {

	private _action: ActionFunc;

	public clone():UiTextButton {
		return new UiTextButton(this);
	}

	constructor(app:UiApplication, name?:string);
	constructor(src:UiTextButton);
	public constructor(param:any, name?:string) {
		if (param instanceof UiTextButton) {
			super(param as UiTextButton);
			let src = param as UiTextButton;
			this._action = src._action;
		} else {
			super(param as UiApplication, name);
			this._action = ((source) => UiResult.IGNORED);
		}
	}

	public get action():ActionFunc {
		return this._action;
	}

	public set action(act:ActionFunc) {
		this._action = act;
	}

	public onKeyDown(target: UiNode | null, key: number, ch: number, mod: number, at: number): UiResult {
		let result = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.ENTER:
			result |= this.doAction();
			break;
		}
		return result;
	}

	public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
		return this.doAction();
	}

	public doAction():UiResult {
		return this._action(this);
	}

}