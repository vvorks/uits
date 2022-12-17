import { Properties } from "../lib/lang";
import {
	Colors, UiApplication,
	UiNode, UiPageNode, UiListNode, UiTextNode, UiCheckbox,
	UiNodeBuilder,
	UiStyle, UiStyleBuilder,
	DataSource, KeyCodes, UiTextField
} from "../lib/ui";
import { UiResult } from "../lib/ui/UiNode";
import { TestDataSource } from "./TestDataSource";

const DEFAULT_STYLE:UiStyle = new UiStyleBuilder()
	.textColor(Colors.BLACK)
	.backgroundColor(Colors.WHITE)
	.borderSize("2px")
	.borderColor(Colors.BLUE)
	.fontSize("12pt")
	.textAlign("center")
	.verticalAlign("middle")
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

		this.addPageFactory("#vlist", (args) => this.createVerticalList(args));
		this.addPageFactory("#hlist", (args) => this.createHorizontalList(args));
		this.addPageFactory("#grid", (args) => this.createGrid(args));

		this.addDataSource("sample", new TestDataSource());
	}

	public createVerticalList(args:Properties<string>):UiPageNode {
		let page:UiPageNode = new UiPageNode(this);
		let b = new UiNodeBuilder(page, "1rem");
		b.inset(1).style(GROUP_STYLE);
		{
			b.enter(new UiNode(this, "北")).th(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(this, "西")).tb(4,4).lw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			{
				b.enter(new UiListNode(this)).tb(4,4).lr(4,4).style(LIST_STYLE)
				.dataSource("sample").loop(true);
				b.enter(new UiTextField(this, "a")).th(1, 4).lw( 1, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(this, "b")).th(1, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				{
					b.enter(new UiTextField(this, "c")).th(3, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true);

					b.leave();
				}
				b.enter(new UiTextField(this, "d")).th(1, 4).lr(21,  5)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiCheckbox(this, "e")).th(1, 4).rw( 1,  4)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.leave();
			}
			b.enter(new UiNode(this, "東")).tb(4,4).rw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(this, "南")).bh(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
		}
		(this.getDataSource("sample") as DataSource).select({});
		return page;
	}

	public createHorizontalList(args:Properties<string>):UiPageNode {
		let page:UiPageNode = new UiPageNode(this);
		let b = new UiNodeBuilder(page, "1rem");
		b.inset(1).style(GROUP_STYLE);
		{
			b.enter(new UiNode(this, "北")).th(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(this, "西")).tb(4,4).lw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			{
				b.enter(new UiListNode(this)).tb(4,4).lr(4,4).style(LIST_STYLE)
					.dataSource("sample").loop(true).vertical(false);
				b.enter(new UiTextField(this, "a")).th(0, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(this, "b")).th(2, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(this, "c")).th(4, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiTextField(this, "d")).th(6, 2).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.enter(new UiCheckbox(this, "e")).tb(8, 0).lw( 0, 10)
						.style(DEFAULT_STYLE).focusable(true).leave();
				b.leave();
			}
			b.enter(new UiNode(this, "東")).tb(4,4).rw(1,2).style(DEFAULT_STYLE).focusable(true).leave();
			b.enter(new UiNode(this, "南")).bh(1,2).lr(1,1).style(DEFAULT_STYLE).focusable(true).leave();
		}
		(this.getDataSource("sample") as DataSource).select({});
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
				b.textContent(`ITEM[${row},${col}]`);
				b.leave();
			}
		}
		return page;
	}

	protected onKeyDown(target:UiNode, key:number, ch:number, mod:number, at:number):UiResult {
		let result:UiResult = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.KEY_Q|KeyCodes.MOD_CTRL:
			(this.getDataSource("sample") as DataSource).select({});
			break;
		default:
			result = super.onKeyDown(target, key, ch, mod, at);
			break;
		}
		return result;
	}


}