import { Properties } from "../lib/lang";
import {
	Colors, UiApplication,
	UiNode, UiPageNode, UiListNode, UiNodeBuilder,
	UiStyle, UiStyleBuilder
} from "../lib/ui";

const DEFAULT_STYLE:UiStyle = new UiStyleBuilder()
	.textColor(Colors.BLACK)
	.backgroundColor(Colors.WHITE)
	.borderSize("2px")
	.borderColor(Colors.BLUE)
	.fontSize("12pt")
	.build();

const FOCUS_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(DEFAULT_STYLE)
	.condition("FOCUS")
	.borderColor(Colors.RED)
	.build();

const CLICKING_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(FOCUS_STYLE)
	.condition("CLICKING")
	.textColor(Colors.RED)
	.build();

const GROUP_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.GREEN)
	.borderSize("0px")
	.build();

const LIST_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.SILVER)
	.borderSize("0px")
	.build();

	export class TestApplication extends UiApplication {

	protected initialize():void {
		this.addPageFactory("", (args) => this.createList(args));
		this.addPageFactory("#grid", (args) => this.createGrid(args));
	}

	public createList(args:Properties<string>):UiPageNode {
		let page:UiPageNode = new UiPageNode(this);
		let b = new UiNodeBuilder(page, "1rem");
		b.inset(1).style(GROUP_STYLE);
		{
			b.enter(new UiListNode(this));
			b.inset(1).style(LIST_STYLE);
			{
				b.enter(new UiNode(this)).th(1, 4).lw( 1, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiNode(this)).th(1, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiNode(this)).th(3, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiNode(this)).th(1, 2).lr(21,  1)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiNode(this)).th(3, 2).lr(21,  1)
						.style(DEFAULT_STYLE).focusable(true).leave();
			}
			b.leave();
		}
		return page;
	}

	public createGrid(args:Properties<string>):UiPageNode {
		let page:UiPageNode = new UiPageNode(this);
		let b = new UiNodeBuilder(page, "1rem");
		b.inset(1).style(GROUP_STYLE);
		for (let row = 0; row < 100; row++) {
			for (let col = 0; col < 100; col++) {
				b.enter(new UiNode(this));
				b.th(row * 3 + 1, 2).lw(col * 16 + 1, 14).style(DEFAULT_STYLE);
				b.focusable(true);
				b.content(`ITEM[${row},${col}]`);
				b.leave();
			}
		}
		return page;
	}

}