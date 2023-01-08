import { Properties } from "../lib/lang";
import { UiNode, UiNodeBuilder, UiPageNode, UiPane, UiPaneFrame, UiTextNode } from "../lib/ui";
import { UiAxis } from "../lib/ui/UiApplication";
import { DEFAULT_STYLE, GROUP_STYLE } from "./TestApplication";

export class PaneTestPage extends UiPageNode {

	protected initialize(args:Properties<string>):void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem").style(GROUP_STYLE).inset(1);
		b.enter(new UiPaneFrame(app, "frame")).style(GROUP_STYLE).inset(1);
			b.enter(new UiPane(app, "left")).style(DEFAULT_STYLE).location("left").flexSize(2, 20);
			for (let i = 0; i < 30; i++) {
				b.enter(new UiTextNode(app, "text"+i)).style(DEFAULT_STYLE)
					.lr(0,0).th(i*3+1, 2).focusable(true).textContent("hoge3 " + i);
				b.leave();
			}
			b.leave();
			b.enter(new UiPane(app, "center")).style(DEFAULT_STYLE).location("center");
				b.enter(new UiTextNode(app, "text")).style(DEFAULT_STYLE).tb(0,0).lr(0,0).focusable(true).textContent("hoge5").leave();
			b.leave();
		b.leave();
	}

	protected resetFocus():void {
		let app = this.application;
		let node = this.findNodeByPath("frame/center/text") as UiNode;
		app.setFocus(node, UiAxis.XY);
	}

}