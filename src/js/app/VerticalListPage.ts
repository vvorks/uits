import
	{ DataSource, UiCheckbox, UiListNode, UiLookupField, UiNode, UiNodeBuilder, UiPageNode, UiRadio, UiScrollbar, UiTextField, UiDateField }
	from "~/lib/ui";
import
	{ GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class VerticalListPage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1rem");
		b.inset(1).style(GROUP_STYLE);
		{
			b.enter(new UiNode(app, "北")).th(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(app, "西")).tb(4,4).lw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			{
				b.enter(new UiListNode(app)).tb(4,4).lr(4,5).style(LIST_STYLE)
				.dataSource("sample").vscroll("v").loop(true);
				b.enter(new UiTextField(app, "a")).th(1, 4).lw( 1, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiDateField(app, "b")).th(1, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				{
					b.enter(new UiLookupField(app, "c")).th(3, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).dataSource("sample2");
					b.leave();
				}
				b.enter(new UiTextField(app, "d")).th(1, 4).lr(21,  5)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiCheckbox(app, "e")).th(1, 1).rw( 1,  4)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiRadio(app, "f", 1)).th(2, 1).rw( 1,  4)
					.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiRadio(app, "f", 2)).th(3, 1).rw( 1,  4)
					.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiRadio(app, "f", 3)).th(4, 1).rw( 1,  4)
					.style(DEFAULT_STYLE).focusable(true).leave();
				b.leave();
			}
			b.enter(new UiScrollbar(app)).tb(4, 4).rw(4, 1).style(SB_STYLE).vscroll("v").leave();
			b.enter(new UiNode(app, "東")).tb(4,4).rw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(app, "南")).bh(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
		}
		(app.getDataSource("sample") as DataSource).select({});
	}

}