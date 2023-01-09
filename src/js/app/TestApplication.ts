import {
	UiApplication,
	UiNode, UiResult,
	UiStyle, UiStyleBuilder,
	DataSource,
	Colors, KeyCodes, DataRecord, COMPONENT_THUMB
} from "../lib/ui";
import { GridPage } from "./GridPage";
import { HorizontalListPage } from "./HorizontalListPage";
import { SlidePage } from "./SlidePage";
import { TestDataSource } from "./TestDataSource";
import { VerticalListPage } from "./VerticalListPage";
import { VolumeToast } from "./VolumeToast";
import hokusai1 from "@images/hokusai1.jpg";
import hokusai2 from "@images/hokusai2.jpg";
import hokusai3 from "@images/hokusai3.jpg";
import hokusai4 from "@images/hokusai4.jpg";
import hokusai5 from "@images/hokusai5.jpg";
import resource from "@texts/resource.json";
import { Dates, Formatter, Logs } from "../lib/lang";
import { PaneTestPage } from "./PaneTestPage";

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

export const IMAGE_STYLE = new UiStyleBuilder()
	.basedOn(DEFAULT_STYLE)
	.textAlign("justify")
	.build();

export const SMALL_STYLE:UiStyle = new UiStyleBuilder()
	.basedOn(DEFAULT_STYLE)
	.fontSize("10pt")
	.build();

export const SMALL_FOCUS:UiStyle = new UiStyleBuilder()
	.basedOn(SMALL_STYLE)
	.condition("FOCUS")
	.textColor(Colors.BLUE)
	.borderColor(Colors.RED)
	.build();

	export const SMALL_CLICKING:UiStyle = new UiStyleBuilder()
	.basedOn(SMALL_FOCUS)
	.condition("CLICKING")
	.textColor(Colors.RED)
	.build();

const LONG_NAME_JA =
	"寿限無寿限無五劫のすりきれ海砂利水魚の水行末雲来末風来末食う寝るところに住むところ" +
	"やぶらこうじのぶらこうじパイポパイポパイポのシューリンガンシューリンガンのグーリンダイ" +
	"グーリンダイのポンポコピーのポンポコナの長久命の長助";

const LONG_NAME_ES =
	"Pablo Diego José Francisco de Paula Juan Nepomuceno Cipriano de la Santísima Trinidad Ruiz y Picasso";

const CITIES = [
	"日本橋",		"品川宿",		"川崎宿",		"神奈川宿",		"保土ヶ谷宿",
	"戸塚宿",		"藤沢宿",		"平塚宿",		"大磯宿",		"小田原宿",
	"箱根宿",		"三島宿",		"沼津宿",		"原宿",			"吉原宿",
	"蒲原宿",		"由比宿",		"興津宿",		"江尻宿",		"府中宿",
	"鞠子宿",		"岡部宿",		"藤枝宿",		"島田宿",		"金谷宿",
	"日坂宿",		"掛川宿",		"袋井宿",		"見付宿",		"浜松宿",
	"舞坂宿",		"新居宿",		"白須賀宿",		"二川宿",		"吉田宿",
	"御油宿",		"赤坂宿",		"藤川宿",		"岡崎宿",		"池鯉鮒宿",
	"鳴海宿",		"宮宿",			"桑名宿",		"四日市宿",		"石薬師宿",
	"庄野宿",		"亀山宿",		"関宿",			"坂下宿",		"土山宿",
	"水口宿",		"石部宿",		"草津宿",		"大津宿",		"三条大橋",
];

export class TestApplication extends UiApplication {

	private _datas:number[] = [40, 4, 14, 2, 30];

	private _pos: number = 0;

	protected initialize(at:number):void {

		this.addPageFactory("#vlist", (args) => new VerticalListPage(this, args));
		this.addPageFactory("#hlist", (args) => new HorizontalListPage(this, args));
		this.addPageFactory("#grid", (args) => new GridPage(this, args));
		this.addPageFactory("#slide", (args) => new SlidePage(this, args));
		this.addPageFactory("#pane", (args) => new PaneTestPage(this, args));
		this.addPageFactory("#volume", (args) => new VolumeToast(this, args));

		this.addDataSource("sample", new TestDataSource(() => {
			let theData: DataRecord[] = [];
			let date = new Date();
			for (let i = 0; i < this._datas[this._pos]; i++) {
				theData.push({
					"a": i,
					"b": date.getTime(),
					"c": {
						"key": "1",
						"title": "時政",
					},
					"d": (i % 2) == 0 ? LONG_NAME_JA : LONG_NAME_ES,
					"e": false,
					"f": (i % 3) + 1
				});
				date = Dates.getNextMonth(date);
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

		this.addDataSource("hokusai", new TestDataSource(() => {
			let jpegs = [hokusai1, hokusai2, hokusai3, hokusai4, hokusai5];
			let theData: DataRecord[] = [];
			for (let i = 0; i < 5; i++) {
				theData.push({
					"a": "Aでーす" + "[" + i + "]",
					"b": "Bでーす" + "[" + i + "]",
					"c": "Cでーす" + "[" + i + "]",
					"d": "Dでーす" + "[" + i + "]",
					"e": jpegs[i],
					"f": "Fでーす" + "[" + i + "]",
					"g": "Gでーす" + "[" + i + "]",
					"h": "Hでーす" + "[" + i + "]",
					"i": "Iでーす" + "[" + i + "]",
				});
			}
			return theData;
		}));

		this.addDataSource("hiroshige", new TestDataSource(() => {
			let theData: DataRecord[] = [];
			for (let s of CITIES) {
				theData.push({"title": s});
			}
			return theData;
		}));

		this.setTextResource(resource);


		let nav = window.navigator;
		let locale = nav.languages && nav.languages.length > 0 ? nav.languages[0] : nav.language;
		Logs.debug("locale %s", locale);

		Formatter.parse("%4.3d%.5d%6.d%-07s").format(100);

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