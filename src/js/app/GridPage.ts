import { Properties } from "../lib/lang";
import { UiNode, UiNodeBuilder, UiPageNode, UiScrollbar, UiTextNode } from "../lib/ui";
import { DEFAULT_STYLE, GROUP_STYLE, SB_STYLE } from "./TestApplication";

export class GridPage extends UiPageNode {

	protected initialize(args:Properties<string>):void {
		let app = this.application;
		const ROW = 30;
		const COL = 30;
		let b = new UiNodeBuilder(this, "1rem").style(GROUP_STYLE).inset(1);
		//行ヘッダ
		b.enter(new UiNode(app)).style(GROUP_STYLE).th(0, 3).lr(10, 1).hscroll("h");
		for (let col = 0; col < COL; col++) {
			b.enter(new UiTextNode(app)).style(DEFAULT_STYLE).tb(0, 0).lw(col*10, 10);
			b.focusable(false);
			b.textContent(`{{col.${col}}}`);
			b.leave();
		}
		b.leave();
		//列ヘッダ
		b.enter(new UiNode(app)).style(GROUP_STYLE).tb(3, 1).lw(0, 10).vscroll("v");
		for (let row = 0; row < ROW; row++) {
			b.enter(new UiTextNode(app)).style(DEFAULT_STYLE).lr(0, 0).th(row*3, 3);
			b.focusable(false);
			b.textContent(`{{row.${row}}}`);
			b.leave();
		}
		b.leave();
		//グリッド
		b.enter(new UiNode(app)).style(GROUP_STYLE).tb(3, 1).lr(10, 1).hscroll("h").vscroll("v");
		for (let row = 0; row < ROW; row++) {
			for (let col = 0; col < COL; col++) {
				b.enter(new UiTextNode(app)).style(DEFAULT_STYLE).th(row*3,3).lw(col*10,10);
				b.focusable(true);
				b.textContent(`ITEM[${row},${col}]`);
				b.leave();
			}
		}
		b.leave();
		//垂直スクロールバー
		b.enter(new UiScrollbar(app)).style(SB_STYLE).tb(3, 1).rw(0, 1).vscroll("v").leave();
		//水平スクロールバー
		b.enter(new UiScrollbar(app)).style(SB_STYLE).bh(0, 1).lr(10, 1).hscroll("h").leave();
	}

}