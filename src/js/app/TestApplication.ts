import { Properties } from "../lib/lang";
import {
	UiApplication,
	UiNode, UiResult, UiNodeBuilder,
	UiPageNode, UiListNode, UiTextNode, UiScrollbar,
	UiTextField, UiCheckbox, UiLookupField,
	UiStyle, UiStyleBuilder,
	DataSource,
	Colors, KeyCodes, DataRecord, COMPONENT_THUMB
} from "../lib/ui";
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

const SB_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.GRAY)
	.borderSize("0px")
	.build();

const THUMB_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(SB_STYLE)
	.condition("NAMED", COMPONENT_THUMB)
	.backgroundColor(Colors.WHITE)
	.build();

const LONG_NAME_JA =
	"寿限無寿限無五劫のすりきれ海砂利水魚の水行末雲来末風来末食う寝るところに住むところ" +
	"やぶらこうじのぶらこうじパイポパイポパイポのシューリンガンシューリンガンのグーリンダイ" +
	"グーリンダイのポンポコピーのポンポコナの長久命の長助";

const LONG_NAME_ES =
	"Pablo Diego José Francisco de Paula Juan Nepomuceno Cipriano de la Santísima Trinidad Ruiz y Picasso";

export class TestApplication extends UiApplication {

	private _datas:number[] = [40, 4, 14, 2, 30];

	private _pos: number = 0;

	protected initialize():void {

		this.addPageFactory("#vlist", (args) => this.createVerticalList(args));
		this.addPageFactory("#hlist", (args) => this.createHorizontalList(args));
		this.addPageFactory("#grid", (args) => this.createGrid(args));

		this.addDataSource("sample", new TestDataSource(() => {
			let theData: DataRecord[] = [];
			for (let i = 0; i < this._datas[this._pos]; i++) {
				theData.push({
					"a": i,
					"b": i * 2,
					"c": {
						"key": "1",
						"title": "時政",
					},
					"d": (i % 2) == 0 ? LONG_NAME_JA : LONG_NAME_ES,
					"e": false
				});
			}
			this._pos = (this._pos + 1) % this._datas.length;
			return theData;
		}));
		this.addDataSource("sample2", new TestDataSource(() => {
			let theData: DataRecord[] = [];
			theData.push({"key": "1", "title": "時政"});
			theData.push({"key": "2", "title": "義時"});
			theData.push({"key": "3", "title": "泰時"});
			theData.push({"key": "4", "title": "経時"});
			theData.push({"key": "5", "title": "時頼"});
			theData.push({"key": "6", "title": "長時"});
			theData.push({"key": "7", "title": "政村"});
			theData.push({"key": "8", "title": "時宗"});
			return theData;
		}));

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
					b.enter(new UiLookupField(this, "c")).th(3, 2).lw(11, 10)
						.style(DEFAULT_STYLE).focusable(true).dataSource("sample2");
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
		const ROW = 30;
		const COL = 30;
		let b = new UiNodeBuilder(new UiPageNode(this), "1rem").style(GROUP_STYLE).inset(1);
		//行ヘッダ
		b.enter(new UiNode(this)).style(GROUP_STYLE).th(0, 3).lr(10, 1).hscroll("h");
		for (let col = 0; col < COL; col++) {
			b.enter(new UiTextNode(this)).style(DEFAULT_STYLE).tb(0, 0).lw(col*10, 10);
			b.focusable(true);
			b.textContent(`COL[${col}]`);
			b.leave();
		}
		b.leave();
		//列ヘッダ
		b.enter(new UiNode(this)).style(GROUP_STYLE).tb(3, 1).lw(0, 10).vscroll("v");
		for (let row = 0; row < ROW; row++) {
			b.enter(new UiTextNode(this)).style(DEFAULT_STYLE).lr(0, 0).th(row*3, 3);
			b.focusable(true);
			b.textContent(`ROW[${row}]`);
			b.leave();
		}
		b.leave();
		//グリッド
		b.enter(new UiNode(this)).style(GROUP_STYLE).tb(3, 1).lr(10, 1).hscroll("h").vscroll("v");
		for (let row = 0; row < ROW; row++) {
			for (let col = 0; col < COL; col++) {
				b.enter(new UiTextNode(this)).style(DEFAULT_STYLE).th(row*3,3).lw(col*10,10);
				b.focusable(true);
				b.textContent(`ITEM[${row},${col}]`);
				b.leave();
			}
		}
		b.leave();
		//垂直スクロールバー
		b.enter(new UiScrollbar(this)).style(SB_STYLE).tb(3, 1).rw(0, 1).vscroll("v").leave();
		//水平スクロールバー
		b.enter(new UiScrollbar(this)).style(SB_STYLE).bh(0, 1).lr(10, 1).hscroll("h").leave();
		//ページを返却
		return b.build();
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