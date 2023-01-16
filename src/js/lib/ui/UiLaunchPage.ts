import
	{ UiNode, UiNodeBuilder, UiPageNode, UiScrollbar, UiTextButton, UiTextNode }
	from "~/lib/ui";
import
	{ DEFAULT_STYLE, GROUP_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class UiLaunchPage extends UiPageNode {

	protected initialize():void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem").style(GROUP_STYLE).inset(1);
		//グリッド
		b.enter(new UiNode(app)).style(GROUP_STYLE).tb(1, 1).lr(1, 1);
		const entries = Object.entries(this.application.getPageFactries());
		for (let i = 0; i < entries.length; i++) {
			const [key, value] = entries[i];
			b.enter(new UiTextButton(app))
				.style(DEFAULT_STYLE).th(i*3,3).lw(0,10)
				.focusable(true)
				.textContent(key)
				.listen((src, act)=>this.application.transit(key, {}))
				.leave();
		}
	}

}