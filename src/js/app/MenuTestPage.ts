import
	{ UiNodeBuilder, UiPageNode, UiMenu, DataSource, UiMenuItem, UiTextField, UiTextNode }
	from "~/lib/ui";
import
	{ GROUP_STYLE, DEFAULT_STYLE }
	from "~/app/TestApplication";

export class MenuTestPage extends UiPageNode {

	protected initialize(): void {
		let app = this.application;
		let b = new UiNodeBuilder(this, "1px");
		b.inset(1).style(GROUP_STYLE);
		//content
		b.enter(new UiTextNode(app, "content")).tb(32, 32).lr(80, 32).style(DEFAULT_STYLE).textContent("content").focusable(true).leave();
		//menu
		b.enter(new UiMenu(app, "menu")).tb(32, 32).lw(32 ,40).style(DEFAULT_STYLE).location("left")
			.extentionSizes(["256px", "0px", "0px", "256px"])
			.dataSource("menu")
			.contentNode("/content");
			b.enter(new UiMenuItem(app, "node")).lr(0, 0).th(0, 30).style(DEFAULT_STYLE);
				b.enter(new UiTextField(app, "title")).inset(0).style(DEFAULT_STYLE).leave();
			b.leave();
			b.enter(new UiMenuItem(app, "leaf")).lr(0, 0).th(0, 30).style(DEFAULT_STYLE);
				b.enter(new UiTextField(app, "title")).inset(0).style(DEFAULT_STYLE).leave();
			b.leave();
		b.leave();
		//set datasource
		(app.getDataSource("menu") as DataSource).select({path:"/"});
	}

}