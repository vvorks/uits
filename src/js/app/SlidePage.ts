import
	{ DataSource, UiImageField, UiListNode, UiNode, UiNodeBuilder, UiPageNode, UiResult, UiTextField, UiTextNode }
	from "~/lib/ui";
import
	{ DEFAULT_STYLE, GROUP_STYLE, IMAGE_STYLE, LIST_STYLE }
	from "~/app/TestApplication";

export class SlidePage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder("1rem");
		b.element(this)
		.inset(0)
		.style(GROUP_STYLE)
		.belongs(b=>{
			b.element(new UiTextNode(app,"label"))
			.position(1, 1, 1, null, null, 2)
			.style(DEFAULT_STYLE)
			.focusable(true)
			.textContent("自動的にスライドします");
			b.element(new UiListNode(app, "list"))
			.position(1, 4, 1, 1, null, null)
			.style(LIST_STYLE)
			.dataSource("hokusai")
			.vertical(false)
			.loop(true)
			.belongs(b=>{
				b.element(new UiNode(app, "card"))
				.inset(0)
				.belongs(b=>{
					b.element(new UiTextField (app, "a")).position(   1,    1, null, null,   10,    2).style(DEFAULT_STYLE);
					b.element(new UiTextField (app, "b")).position(  12,    1,   12, null, null,    2).style(DEFAULT_STYLE);
					b.element(new UiTextField (app, "c")).position(null,    1,    1, null,   10,    2).style(DEFAULT_STYLE);
					b.element(new UiTextField (app, "d")).position(   1,    4, null,    4,   10, null).style(DEFAULT_STYLE);
					b.element(new UiImageField(app, "e")).position(  12,    4,   12,    4, null, null).style(IMAGE_STYLE  );
					b.element(new UiTextField (app, "f")).position(null,    4,    1,    4,  10,  null).style(DEFAULT_STYLE);
					b.element(new UiTextField (app, "g")).position(   1, null, null,    1,  10,     2).style(DEFAULT_STYLE);
					b.element(new UiTextField (app, "h")).position(  12, null,   12,    1, null,    2).style(DEFAULT_STYLE);
					b.element(new UiTextField (app, "i")).position(null, null,    1,    1,   10,    2).style(DEFAULT_STYLE);
				});
			});
		});
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