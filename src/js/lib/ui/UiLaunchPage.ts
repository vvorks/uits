import
	{ UiNode, UiNodeBuilder, UiPageNode, UiScrollbar, UiTextButton, UiTextNode }
	from "~/lib/ui";
import
	{ DEFAULT_STYLE, GROUP_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class UiLaunchPage extends UiPageNode {

	protected initialize():void {
		let app = this.application;
		let b = new UiNodeBuilder("1rem")
		b.item(this).style(GROUP_STYLE).inset(1);
		b.child(b=>{
			//グリッド
			b.item(new UiNode(app, "group"))
				.style(GROUP_STYLE)
				.locate(1, 1, 1, 1, null, null)
			b.child(b=>{
				const entries = Object.entries(this.application.getPageFactries());
				for (let i = 0; i < entries.length; i++) {
					const [key, value] = entries[i];
					b.item(new UiTextButton(app, "button" + i))
						.style(DEFAULT_STYLE)
						.bounds(0, i*3, 10, 3)
						.focusable(true)
						.textContent(key)
						.listen((src, act)=>this.application.forwardTo(key, {}))
				}
			})
		});
	}

}