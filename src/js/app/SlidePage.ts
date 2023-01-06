import { Logs, Properties } from "../lib/lang";
import { DataSource, UiImageField, UiListNode, UiNode, UiNodeBuilder, UiPageNode, UiResult, UiTextField, UiTextNode } from "../lib/ui";
import { DEFAULT_STYLE, GROUP_STYLE, IMAGE_STYLE, LIST_STYLE } from "./TestApplication";

export class SlidePage extends UiPageNode {

	protected initialize(args: Properties<string>): void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem");
		b.inset(0).style(GROUP_STYLE);
		b.enter(new UiTextNode(app,"label"))
			b.lr( 1, 1).th(1 , 2).style(DEFAULT_STYLE).focusable(true);
			b.textContent("自動的にスライドします");
		b.leave();
		b.enter(new UiListNode(app, "list")).lr(1,1).tb(4, 1).style(LIST_STYLE).dataSource("hokusai").vertical(false).loop(true);
			b.enter(new UiNode(app, "card")).inset(0);
				b.enter(new UiTextField (app, "a")).lw( 1, 10).th(1 ,2).style(DEFAULT_STYLE).leave()
				b.enter(new UiTextField (app, "b")).lr(12, 12).th(1 ,2).style(DEFAULT_STYLE).leave()
				b.enter(new UiTextField (app, "c")).rw( 1, 10).th(1 ,2).style(DEFAULT_STYLE).leave()
				b.enter(new UiTextField (app, "d")).lw( 1, 10).tb(4 ,4).style(DEFAULT_STYLE).leave()
				b.enter(new UiImageField(app, "e")).lr(12, 12).tb(4 ,4).style(IMAGE_STYLE  ).leave()
				b.enter(new UiTextField (app, "f")).rw( 1, 10).tb(4 ,4).style(DEFAULT_STYLE).leave()
				b.enter(new UiTextField (app, "g")).lw( 1, 10).bh(1 ,2).style(DEFAULT_STYLE).leave()
				b.enter(new UiTextField (app, "h")).lr(12, 12).bh(1 ,2).style(DEFAULT_STYLE).leave()
				b.enter(new UiTextField (app, "i")).rw( 1, 10).bh(1 ,2).style(DEFAULT_STYLE).leave()
			b.leave();
		b.leave();
		(app.getDataSource("hokusai") as DataSource).select({});

		app.runInterval(this, 1, 3000, () => {
			let node = this.findNodeByPath("list") as UiListNode;
			let result = UiResult.CONSUMED;
			if (node != null) {
				result |= node.scrollRecord(1);
			}
			return result;
		});

	}

}