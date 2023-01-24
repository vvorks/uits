import
	{ DataSource, UiCheckbox, UiListNode, UiNode, UiNodeBuilder, UiPageNode, UiScrollbar, UiTextButton, UiTextField }
	from "~/lib/ui";
import
	{ GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class HorizontalListPage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder("1rem");
		b.item(this)
			.inset(1)
			.style(GROUP_STYLE);
		b.child(b=>{
			b.item(new UiTextButton(app, "north"))
				.locate(1, 1, 1, null, null, 2).style(DEFAULT_STYLE)
				.focusable(true)
				.textContent("go vlist")
				.listen((src, act)=>this.application.forwardTo("vlist", {}));
			b.item(new UiNode(app, "west"))
				.locate(1, 4, null, 4, 2, null)
				.style(DEFAULT_STYLE)
				.focusable(true);
			b.item(new UiListNode(app, "list"))
				.locate(4, 4, 4, 5, null, null)
				.style(LIST_STYLE)
				.dataSource("sample")
				.hscroll("h")
				.loop(true)
				.vertical(false);
			b.child(b=>{
				b.item(new UiTextField(app, "a"))
					.bounds(0, 0, 10, 2)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiTextField(app, "b"))
					.bounds(0, 2, 10, 2)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiTextField(app, "c"))
					.bounds(0, 4, 10, 2)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiTextField(app, "d"))
					.locate(0, 5, null, 4, 10, null)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiCheckbox(app, "e"))
					.locate(0, null, null, 2, 10, 2)
					.style(DEFAULT_STYLE)
					.focusable(true);
			});
			b.item(new UiScrollbar(app, "sb"))
				.locate(4, null, 4, 4, null, 1)
				.style(SB_STYLE)
				.hscroll("h");
			b.item(new UiNode(app, "east"))
				.locate(null, 4, 1, 4, 2, null)
				.style(DEFAULT_STYLE)
				.focusable(true);
			b.item(new UiNode(app, "south"))
				.locate(1, null, 1, 1, null, 2)
				.style(DEFAULT_STYLE)
				.focusable(true);
		});
		(app.getDataSource("sample") as DataSource).select({});
	}

}