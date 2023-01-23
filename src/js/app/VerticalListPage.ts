import
	{ DataSource, UiCheckbox, UiListNode, UiLookupField, UiNode, UiNodeBuilder, UiPageNode, UiRadio, UiScrollbar, UiTextField, UiDateField, UiTextButton, UiImageLookupField }
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
			b.enter(new UiTextButton(app, "north")).th(1,2).lr(1,1).style(DEFAULT_STYLE)
				.focusable(true)
				.textContent("go hlist")
				.listen((src, act)=>this.application.forwardTo("hlist", {}))
				.leave();
			b.enter(new UiNode(app, "west")).tb(4,4).lw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			{
				b.enter(new UiListNode(app, "list")).tb(4,4).lr(4,5).style(LIST_STYLE)
					.dataSource("sample").vscroll("v").loop(true).outerMargin(false);
				{
					b.enter(new UiTextField(app, "a")).th(1, 4).lw( 1, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
					b.enter(new UiDateField(app, "b")).th(1, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
					b.enter(new UiLookupField(app, "c")).th(3, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).dataSource("sample2")
						.leave();
					b.enter(new UiImageLookupField(app, "g")).th(1, 4).lw(21,  5)
						.style(DEFAULT_STYLE).focusable(false)
						.lookupTable({
							"a": "hokusai1.jpg",
							"b": "hokusai2.jpg",
							"c": "hokusai3.jpg",
						}).leave();
					b.enter(new UiTextField(app, "d")).th(1, 4).lr(26,  5)
							.style(DEFAULT_STYLE).focusable(true).leave();
					b.enter(new UiCheckbox(app, "e")).th(1, 1).rw( 1,  4)
							.style(DEFAULT_STYLE).focusable(true).leave();
					b.enter(new UiRadio(app, "f", 1)).th(2, 1).rw( 1,  4)
						.style(DEFAULT_STYLE).focusable(true).leave();
					b.enter(new UiRadio(app, "f", 2)).th(3, 1).rw( 1,  4)
						.style(DEFAULT_STYLE).focusable(true).leave();
					b.enter(new UiRadio(app, "f", 3)).th(4, 1).rw( 1,  4)
						.style(DEFAULT_STYLE).focusable(true).leave();
				}
				b.leave();
			}
			b.enter(new UiScrollbar(app, "sb")).tb(4, 4).rw(4, 1).style(SB_STYLE).vscroll("v").leave();
			b.enter(new UiNode(app, "east")).tb(4,4).rw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiTextButton(app, "south")).bh(1,2).lr(1,1).style(DEFAULT_STYLE)
				.focusable(true)
				.textContent("restart")
				.listen((src, act)=>this.application.restartTo("hlist", {}))
				.leave();
		}
		(app.getDataSource("sample") as DataSource).select({});
	}

}