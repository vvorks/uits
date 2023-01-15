import
	{ DataSource, UiCheckbox, UiListNode, UiNode, UiNodeBuilder, UiPageNode, UiScrollbar, UiTextField }
	from "~/lib/ui";
import
	{ GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class HorizontalListPage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem");
		b.inset(1).style(GROUP_STYLE);
		{
			b.enter(new UiNode(app, "北")).th(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(app, "西")).tb(4,4).lw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			{
				b.enter(new UiListNode(app)).tb(4,5).lr(4,4).style(LIST_STYLE)
					.dataSource("sample").hscroll("h").loop(true).vertical(false);
				b.enter(new UiTextField(app, "a")).th(0, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(app, "b")).th(2, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(app, "c")).th(4, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(app, "d")).tb(6, 4).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiCheckbox(app, "e")).bh(2, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.leave();
			}
			b.enter(new UiScrollbar(app)).bh(4,1).lr(4,4).style(SB_STYLE).hscroll("h").leave();
			b.enter(new UiNode(app, "東")).tb(4,4).rw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(app, "南")).bh(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
		}
		(app.getDataSource("sample") as DataSource).select({});
	}

}