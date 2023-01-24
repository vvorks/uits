import
	{ DataSource, UiCheckbox, UiListNode, UiLookupField, UiNode, UiNodeBuilder, UiPageNode, UiRadio, UiScrollbar, UiTextField, UiDateField, UiTextButton, UiImageLookupField }
	from "~/lib/ui";
import
	{ GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class VerticalListPage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder("1rem");
		b.item(this).inset(1).style(GROUP_STYLE);
		b.child(b=>{
			b.item(new UiTextButton(app, "north"))
				.locate(1, 1, 1, null, null, 2)
				.style(DEFAULT_STYLE)
				.focusable(true)
				.textContent("go hlist")
				.listen((src, act)=>this.application.forwardTo("hlist", {}));
			b.item(new UiNode(app, "west"))
				.locate(1, 4, null, 4, 2, null)
				.style(DEFAULT_STYLE)
				.focusable(true);
			b.item(new UiListNode(app, "list"))
				.locate(4,4,5,4,null,null)
				.style(LIST_STYLE)
				.dataSource("sample")
				.vscroll("v")
				.loop(true)
				.outerMargin(false);
			b.child(b=>{
				b.item(new UiTextField(app, "a"))
					.bounds(1, 1, 10, 4)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiDateField(app, "b"))
					.bounds(11, 1, 10, 2)
					.style(DEFAULT_STYLE).focusable(true);
				b.item(new UiLookupField(app, "c"))
					.bounds(11, 3, 10, 2)
					.style(DEFAULT_STYLE)
					.focusable(true)
					.dataSource("sample2");
				b.item(new UiImageLookupField(app, "g"))
					.bounds(21, 1, 5, 4)
					.style(DEFAULT_STYLE)
					.focusable(false)
					.lookupTable({
						"a": "hokusai1.jpg",
						"b": "hokusai2.jpg",
						"c": "hokusai3.jpg",
					});
				b.item(new UiTextField(app, "d"))
					.locate(26, 1, 5, null, null, 4)
					.style(DEFAULT_STYLE).focusable(true);
				b.item(new UiCheckbox(app, "e"))
					.locate(null, 1, 1, null, 4, 1)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiRadio(app, "f1", 1))
					.dataField("f")
					.locate(null, 2, 1, null, 4, 1)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiRadio(app, "f2", 2))
					.dataField("f")
					.locate(null, 3, 1, null, 4, 1)
					.style(DEFAULT_STYLE)
					.focusable(true);
				b.item(new UiRadio(app, "f3", 3))
					.dataField("f")
					.locate(null, 4, 1, null, 4, 1)
					.style(DEFAULT_STYLE)
					.focusable(true);
			});
			b.item(new UiScrollbar(app, "sb"))
				.locate(null, 4, 4, 4, 1, null)
				.style(SB_STYLE)
				.vscroll("v");
			b.item(new UiNode(app, "east"))
				.locate(null, 4, 1, 4, 2, null)
				.style(DEFAULT_STYLE)
				.focusable(true);
			b.item(new UiTextButton(app, "south"))
				.locate(1, null, 1, 1, null, 2)
				.style(DEFAULT_STYLE)
				.focusable(true)
				.textContent("restart")
				.listen((src, act)=>this.application.restartTo("hlist", {}));
		});
		(app.getDataSource("sample") as DataSource).select({});
	}

}