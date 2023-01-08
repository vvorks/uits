import { Properties } from "../lib/lang";
import { DataSource, UiImageField, UiListNode, UiNode, UiNodeBuilder, UiPageNode, UiPane, UiDock, UiResult, UiTextNode, UiTextField } from "../lib/ui";
import { UiAxis } from "../lib/ui/UiApplication";
import { DEFAULT_STYLE, GROUP_STYLE, IMAGE_STYLE, LIST_STYLE } from "./TestApplication";

export class PaneTestPage extends UiPageNode {

	protected initialize(args:Properties<string>):void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem").style(GROUP_STYLE).inset(1);
		b.enter(new UiDock(app, "dock")).style(GROUP_STYLE).inset(1);
		{
			b.enter(new UiPane(app, "left")).style(DEFAULT_STYLE).location("left").flexSize(2, 20);
			for (let i = 0; i < 30; i++) {
				b.enter(new UiTextNode(app, "text"+i)).style(DEFAULT_STYLE)
					.lr(0,0).th(i*3+1, 2).focusable(true).textContent("hoge3 " + i);
				b.leave();
			}
			b.leave();
			b.enter(new UiPane(app, "center")).style(DEFAULT_STYLE).location("center");
			{
				b.enter(new UiListNode(app, "bglist")).inset(1).style(LIST_STYLE).dataSource("hokusai").vertical(false).loop(true);
					b.enter(new UiNode(app, "card")).inset(0);
						b.enter(new UiImageField(app, "e")).inset(0).style(IMAGE_STYLE).leave()
					b.leave();
				b.leave();
				b.enter(new UiListNode(app, "list")).bh(0, 4).lr(0,0).style(LIST_STYLE).dataSource("hiroshige").vertical(false).loop(false);
					b.enter(new UiNode(app, "card")).tb(0, 0).lw(0, 8);
						b.enter(new UiTextField(app, "title")).inset(0).style(DEFAULT_STYLE).focusable(true).leave()
					b.leave();
				b.leave();
			}
			b.leave();
		}
		b.leave();
		//データソース検索開始
		(app.getDataSource("hokusai") as DataSource).select({});
		(app.getDataSource("hiroshige") as DataSource).select({});
		//自動ページめくり開始
		app.runInterval(this, 1, 3000, () => {
			let focus = app.getFocusOf(this);
			let center = this.findNodeByPath("dock/center") as UiNode;
			if (focus == null || !center.isAncestorOf(focus)) {
				return UiResult.CONSUMED;
			}
			let node = this.findNodeByPath("dock/center/bglist") as UiListNode;
			let result = UiResult.CONSUMED;
			if (node != null) {
				result |= node.scrollRecord(1);
			}
			return result;
		});
	}

	protected resetFocus():void {
		let app = this.application;
		let node = this.findNodeByPath("dock/center/list") as UiNode;
		app.setFocus(node, UiAxis.XY);
	}

}