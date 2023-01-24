import
	{ UiNode, UiNodeBuilder, UiPageNode, UiScrollable, UiScrollbar, UiTextNode }
	from "~/lib/ui";
import
	{ DEFAULT_STYLE, GROUP_STYLE, SB_STYLE }
	from "~/app/TestApplication";

export class GridPage extends UiPageNode {

	protected initialize():void {
		let app = this.application;
		const ROW = 30;
		const COL = 30;
		let b = new UiNodeBuilder("1rem")
		b.item(this)
			.style(GROUP_STYLE)
			.inset(1);
		b.child(b=>{
			//行ヘッダ
			b.item(new UiScrollable(app, "rowHeader"))
				.style(GROUP_STYLE)
				.locate(10, 0, 1, null, null, 3)
				.hscroll("h");
			b.child(b=>{
				for (let col = 0; col < COL; col++) {
					b.item(new UiTextNode(app, "rowHeaderColumn" + col))
						.style(DEFAULT_STYLE)
						.locate(col*10, 0, null, 0, 10, null)
						.focusable(false)
						.textContent(`{{col.${col}}}`)
				}
			});
			//列ヘッダ
			b.item(new UiScrollable(app, "colHeader"))
				.style(GROUP_STYLE)
				.locate(0, 3, null, 1, 10, null)
				.vscroll("v");
			b.child(b=>{
				for (let row = 0; row < ROW; row++) {
					b.item(new UiTextNode(app, "colHeaderRow" + row))
						.style(DEFAULT_STYLE)
						.locate(0, row*3, 0, null, null, 3)
						.focusable(false)
						.textContent(`{{row.${row}}}`)
				}
			});
			//グリッド
			b.item(new UiScrollable(app, "grid"))
				.style(GROUP_STYLE)
				.locate(10, 3, 1, 1, null, null)
				.hscroll("h")
				.vscroll("v");
			b.child(b=>{
				for (let row = 0; row < ROW; row++) {
					for (let col = 0; col < COL; col++) {
						b.item(new UiTextNode(app, "cell" + row + "_" + col))
							.style(DEFAULT_STYLE)
							.bounds(col*10, row*3, 10, 3)
							.focusable(true)
							.textContent(`ITEM[${row},${col}]`);
					}
				}
			});
			//垂直スクロールバー
			b.item(new UiScrollbar(app, "vscroll"))
				.style(SB_STYLE)
				.locate(null, 3, 0, 1, 1, null)
				.vscroll("v");
			//水平スクロールバー
			b.item(new UiScrollbar(app, "hscroll"))
				.style(SB_STYLE)
				.locate(10, null, 1, 0, null, 1)
				.hscroll("h");
		});
	}

}