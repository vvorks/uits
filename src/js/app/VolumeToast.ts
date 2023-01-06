import { Logs, Properties } from "../lib/lang";
import { KeyCodes, UiNode, UiNodeBuilder, UiPageNode, UiResult, UiTextNode } from "../lib/ui";
import { DEFAULT_STYLE, TOAST_STYLE } from "./TestApplication";

const VOLUME_TIMEOUT_ID = 1;
const VOLUME_TIMEOUT_MSEC = 5000;

export class VolumeToast extends UiPageNode {

	private _value:number = 20; //kari

	protected initialize(args:Properties<string>):void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem").style(TOAST_STYLE).bh(2, 5).rw(2,15);
		b.enter(new UiTextNode(app, "test")).style(DEFAULT_STYLE).inset(1).leave();
		(this.findNodeByPath("test") as UiTextNode).textContent = this._value;
		this.application.runAfter(this, VOLUME_TIMEOUT_ID, VOLUME_TIMEOUT_MSEC, ()=>this.onTimeout());
	}

	public onKeyDown(target: UiNode | null, key: number, ch: number, mod: number, at: number): UiResult {
		let result:UiResult = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.PAGEUP:
			(this.findNodeByPath("test") as UiTextNode).textContent = ++this._value;
			result = UiResult.EATEN;
			this.application.runAfter(this, VOLUME_TIMEOUT_ID, VOLUME_TIMEOUT_MSEC, ()=>this.onTimeout());
			break;
		case KeyCodes.PAGEDOWN:
			(this.findNodeByPath("test") as UiTextNode).textContent = --this._value;
			result = UiResult.EATEN;
			this.application.runAfter(this, VOLUME_TIMEOUT_ID, VOLUME_TIMEOUT_MSEC, ()=>this.onTimeout());
			break;
		default:
			result = super.onKeyDown(target, key, ch, mod, at);
			break;
		}
		return result;
	}

	private onTimeout(): UiResult {
		this.application.dispose(this.getPageNode() as UiPageNode);
		return UiResult.EATEN;
	}

}