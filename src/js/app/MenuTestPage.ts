import
	{ UiNodeBuilder, UiPageNode, UiMenu, DataSource, UiMenuItem, UiTextField, UiTextNode }
	from "~/lib/ui";
import
	{ GROUP_STYLE, DEFAULT_STYLE }
	from "~/app/TestApplication";

export class MenuTestPage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder("1px");
		b.item(this).inset(1).style(GROUP_STYLE);
		b.child(b=>{
			//content
			b.item(new UiTextNode(app, "content"))
				.locate(80, 32, 32, 32, null, null)
				.style(DEFAULT_STYLE)
				.textContent("content")
				.focusable(true);
			//menu
			b.item(new UiMenu(app, "menu"))
				.locate(32, 32, null, 32, 40, null)
				.style(DEFAULT_STYLE)
				.location("left")
				.extentionSizes(["256px", "0px", "0px", "256px"])
				.dataSource("menu")
				.contentNode("/content");
			b.child(b=>{
				b.item(new UiMenuItem(app, "node"))
					.locate(0, 0, 0, null, null, 30)
					.style(DEFAULT_STYLE);
				b.child(b=>{
					b.item(new UiTextField(app, "title"))
						.inset(0)
						.style(DEFAULT_STYLE);
				});
				b.item(new UiMenuItem(app, "leaf"))
					.locate(0, 0, 0, null, null, 30)
					.style(DEFAULT_STYLE);
				b.child(b=>{
					b.item(new UiTextField(app, "title"))
						.inset(0)
						.style(DEFAULT_STYLE);
				})
			})
		});
		//set datasource
		(app.getDataSource("menu") as DataSource).select({path:"/"});
	}

}