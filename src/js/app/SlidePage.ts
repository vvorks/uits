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
		b.item(this).inset(0).style(GROUP_STYLE);
		b.child(b=>{
			b.item(new UiTextNode(app,"label"))
				.locate(1, 1, 1, null, null, 2)
				.style(DEFAULT_STYLE)
				.focusable(true)
				.textContent("自動的にスライドします");
			b.item(new UiListNode(app, "list"))
				.locate(1, 4, 1, 1, null, null)
				.style(LIST_STYLE)
				.dataSource("hokusai")
				.vertical(false)
				.loop(true);
			b.child(b=>{
				b.item(new UiNode(app, "card")).inset(0);
				b.child(b=>{
					b.item(new UiTextField (app, "a")).locate(   1,    1, null, null,   10,    2).style(DEFAULT_STYLE);
					b.item(new UiTextField (app, "b")).locate(  12,    1,   12, null, null,    2).style(DEFAULT_STYLE);
					b.item(new UiTextField (app, "c")).locate(null,    1,    1, null,   10,    2).style(DEFAULT_STYLE);
					b.item(new UiTextField (app, "d")).locate(   1,    4, null,    4,   10, null).style(DEFAULT_STYLE);
					b.item(new UiImageField(app, "e")).locate(  12,    4,   12,    4, null, null).style(IMAGE_STYLE  );
					b.item(new UiTextField (app, "f")).locate(null,    4,    1,    4,  10,  null).style(DEFAULT_STYLE);
					b.item(new UiTextField (app, "g")).locate(   1, null, null,    1,  10,     2).style(DEFAULT_STYLE);
					b.item(new UiTextField (app, "h")).locate(  12, null,   12,    1, null,    2).style(DEFAULT_STYLE);
					b.item(new UiTextField (app, "i")).locate(null, null,    1,    1,   10,    2).style(DEFAULT_STYLE);
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