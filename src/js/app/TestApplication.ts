import {
	UiApplication,
	UiNode, UiResult, UiNodeBuilder,
	UiPageNode, UiListNode, UiTextNode, UiScrollbar,
	UiTextField, UiCheckbox, UiLookupField,
	UiStyle, UiStyleBuilder,
	DataSource,
	Colors, KeyCodes, DataRecord, COMPONENT_THUMB
} from "../lib/ui";
import { GridPage } from "./GridPage";
import { HorizontalListPage } from "./HorizontalListPage";
import { TestDataSource } from "./TestDataSource";
import { VerticalListPage } from "./VerticalListPage";
import { VolumeToast } from "./VolumeToast";

export const DEFAULT_STYLE:UiStyle = new UiStyleBuilder()
	.textColor(Colors.BLACK)
	.backgroundColor(Colors.WHITE)
	.borderSize("2px")
	//.borderRadius("8px")
	.borderColor(Colors.BLUE)
	.fontSize("12pt")
	.lineHeight("1.5")
	.textAlign("center")
	.verticalAlign("middle")
	.build();

export const FOCUS_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(DEFAULT_STYLE)
	.condition("FOCUS")
	.textColor(Colors.BLUE)
	.borderColor(Colors.RED)
	.build();

export const CLICKING_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(FOCUS_STYLE)
	.condition("CLICKING")
	.textColor(Colors.RED)
	.build();

export const GROUP_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.GREEN)
	.borderSize("0px")
	.build();

export const TOAST_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(GROUP_STYLE)
	.backgroundColor(Colors.YELLOW)
	.build();

export const LIST_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.SILVER)
	.borderSize("0px")
	.build();

export const SB_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.GRAY)
	.borderSize("0px")
	.build();

export const THUMB_STYLE:UiStyle = new UiStyleBuilder()
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

	protected initialize(at:number):void {

		this.addPageFactory("#vlist", (args) => new VerticalListPage(this, args));
		this.addPageFactory("#hlist", (args) => new HorizontalListPage(this, args));
		this.addPageFactory("#grid", (args) => new GridPage(this, args));
		this.addPageFactory("#volume", (args) => new VolumeToast(this, args));

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

	protected onKeyDown(target:UiNode, key:number, ch:number, mod:number, at:number):UiResult {
		let result:UiResult = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.KEY_Q|KeyCodes.MOD_CTRL:
			(this.getDataSource("sample") as DataSource).select({});
			break;
		case KeyCodes.PAGEUP:
		case KeyCodes.PAGEDOWN:
			result = this.toast("#volume", {}); //kari
			break;
		default:
			result = super.onKeyDown(target, key, ch, mod, at);
			break;
		}
		return result;
	}

}