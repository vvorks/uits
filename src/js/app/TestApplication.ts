import { Properties, Types } from "../lib/lang";
import { Colors, UiApplication, UiNode, UiPageNode, UiStyle, UiStyleBuilder } from "../lib/ui";
import { UiNodeBuilder } from "../lib/ui/UiNodeBuilder";

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
	.borderColor(Colors.GREEN)
	.build();	

export class TestApplication extends UiApplication {

	protected initialize():void {
		this.addPageFactory("#foo", (args) => this.createFoo(args));
		this.addPageFactory("#bar", (args) => this.createBar(args));
	}

	public createFoo(args:Properties<string>):UiPageNode {
		let page:UiPageNode = new UiPageNode(this);
		let b = new UiNodeBuilder(page, "1rem");
		b.inset(1).style(GROUP_STYLE);
		for (let i = 0; i < 100; i++) {
			b.enter(new UiNode(this));
			b.lw(1, 10).th(i * 3 + 1, 2).style(DEFAULT_STYLE);
			b.focusable(true);
			b.content(`ITEM[${i}]`);
			b.leave();
			b.enter(new UiNode(this));
			b.lr(12, 1).th(i * 3 + 1, 2).style(DEFAULT_STYLE);
			b.focusable(true);
			b.leave();
		}
		return page;
	}

	public createBar(args:Properties<string>):UiPageNode {
		let page:UiPageNode = new UiPageNode(this);
		let value = args["name"];
		let name = Types.isUndefined(value) ? "" : value;
		let b = new UiNodeBuilder(page, "1rem");
		b.inset(1).style(GROUP_STYLE);
		for (let i = 0; i < 10; i++) {
			b.enter(new UiNode(this));
			b.rw(1, 10).th(i * 3 + 1, 2).style(DEFAULT_STYLE);
			b.focusable(true);
			b.content(`${name}[${i}]`);
			b.leave();
			b.enter(new UiNode(this));
			b.lr(1, 12).th(i * 3 + 1, 2).style(DEFAULT_STYLE);
			b.focusable(true);
			b.leave();
		}
		return page;
	}

}