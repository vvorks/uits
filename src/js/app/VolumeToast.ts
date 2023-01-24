import
	{ KeyCodes, UiNode, UiNodeBuilder, UiPageNode, UiResult, UiTextNode }
	from "~/lib/ui";
import
	{ DEFAULT_STYLE, TOAST_STYLE }
	from "~/app/TestApplication";

const VOLUME_TIMEOUT_ID = 1;
const VOLUME_TIMEOUT_MSEC = 5000;

export class VolumeToast extends UiPageNode {

	private _value:number = 20; //kari

	protected initialize():void {
		let app = this.application;
		let b = new UiNodeBuilder("1rem")
		b.item(this)
			.style(TOAST_STYLE)
			.locate(null, null, 2, 2, 15, 5);
		b.child(b=>{
			b.item(new UiTextNode(app, "test"))
				.style(DEFAULT_STYLE)
				.inset(1)
				;
		});
		(this.findNodeByPath("test") as UiTextNode).textContent = this._value;
		this.application.runAfter(this, VOLUME_TIMEOUT_ID, VOLUME_TIMEOUT_MSEC, ()=>this.onTimeout());
	}

	public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
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