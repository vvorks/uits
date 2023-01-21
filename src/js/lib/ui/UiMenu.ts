import
	{ Logs,
ParamError, Types, UnsupportedError, Value }
	from "~/lib/lang";
import { Flags, UiLocation, UiNode, UiResult } from "~/lib/ui/UiNode";
import { UiApplication, UiAxis } from "~/lib/ui/UiApplication";
import { DataRecord, DataSource } from "~/lib/ui/DataSource";
import { CssLength } from "~/lib/ui/CssLength";
import { UiNodeBuilder } from "~/lib/ui/UiNodeBuilder";
import { DEFAULT_STYLE } from "~/app/TestApplication"; //TODO おきて破り！要再定義
import { KeyCodes } from "~/lib/ui/KeyCodes";
import { DataHolder } from "~/lib/ui/DataHolder";
import { UiTextNode } from "~/lib/ui/UiTextNode";

/** テンプレート名を保持するフィールドの名前 */
const FIELD_TEMPLATE = "template";

/** 切り替えコンテントを示すフィールドの名前 */
const FIELD_CONTENT = "content";

/** 次メニューパスを示すフィールドの名前 */
const FIELD_SUBMENU = "submenu";

type CssSource = string|number;

export class UiMenuItem extends UiNode implements DataHolder {

	private _record:DataRecord|null;

	public clone():UiMenuItem {
		return new UiMenuItem(this);
	}

	public constructor(app:UiApplication, name:string);
	public constructor(src:UiMenuItem);
	public constructor(param:any, name?:string) {
		if (param instanceof UiMenuItem) {
			super(param as UiMenuItem);
			let src = param as UiMenuItem;
			this._record = src._record;
		} else {
			super(param as UiApplication, name as string);
			this._record = null;
		}
	}

	public getValue(name: string): Value | DataRecord {
		if (this._record == null) {
			return null;
		}
		let value = this._record[name];
		return (value === undefined) ? null : value;
	}

	public setValue(name: string, value: Value | DataRecord): void {
		throw new UnsupportedError();
	}

	public getRecord(): DataRecord | null {
		return this._record;
	}

	public setReocord(rec: DataRecord): void {
		this._record = rec;
		for (let c of this.getDescendants()) {
			c.onDataHolderChanged(this);
		}
	}

	private get owner():UiMenu {
		return (this.parent as UiNode).parent as UiMenu;

	}

	public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
		let result = UiResult.IGNORED;
		let k = key|mod;
		if (k == this.getTriggerKey() || k == KeyCodes.ENTER) {
			if (this._record != null) {
				if (this._record[FIELD_CONTENT] != null) {
					result = this.owner.changeContent(this._record[FIELD_CONTENT] as string);
				} else if (this._record[FIELD_SUBMENU] != null) {
					result = this.owner.forwardSubmenu(this._record[FIELD_SUBMENU] as string);
				}
			}
		} else if (k == this.getBackKey()) {
			result = this.owner.backwardMenu();
		}
		return result;
	}

	private getTriggerKey():number {
		switch (this.owner.location) {
			case "left":	return KeyCodes.RIGHT;
			case "right":	return KeyCodes.LEFT;
			case "top":		return KeyCodes.DOWN;
			case "bottom":	return KeyCodes.UP;
			default:		return KeyCodes.UNUSED;
		}
	}

	private getBackKey():number {
		switch (this.owner.location) {
			case "left":	return KeyCodes.LEFT;
			case "right":	return KeyCodes.RIGHT;
			case "top":		return KeyCodes.UP;
			case "bottom":	return KeyCodes.DOWN;
			default:		return KeyCodes.UNUSED;
		}
	}
}

export class UiMenu extends UiNode {

	private _location: UiLocation;

	private _extensionSizes: CssLength[];

	private _template: UiNode|null;

	private _contentNodePath: string|null;

	private _dataSource:DataSource|null;

	private _defaultWidth: number;

	private _defaultHeight: number;

	private _currentLevel: number;

	private _lastLevel: number;

	private _focusItems:UiNode[];

	public clone():UiMenu {
		return new UiMenu(this);
	}

	public constructor(app:UiApplication, name?:string);
	public constructor(src:UiMenu);
	public constructor(param:any, name?:string) {
		if (param instanceof UiMenu) {
			super(param as UiMenu);
			let src = param as UiMenu;
			this._location = src._location;
			this._template = src._template;
			this._contentNodePath = src._contentNodePath;
			this._dataSource = src._dataSource;
			this._extensionSizes = src._extensionSizes;
			this._defaultWidth = src._defaultWidth;
			this._defaultHeight = src._defaultHeight;
			this._currentLevel = src._currentLevel;
			this._lastLevel = src._lastLevel;
			this._focusItems = src._focusItems.slice(0, src._focusItems.length);
		} else {
			super(param as UiApplication, name as string);
			this._location = "left";
			this._template = null;
			this._contentNodePath = null;
			this._dataSource = null;
			this._extensionSizes = [new CssLength(0)];
			this._defaultWidth = 0;
			this._defaultHeight = 0;
			this._currentLevel = 1;
			this._lastLevel = 0;
			this._focusItems = [this];
		}
	}

	public get location():UiLocation {
		return this._location;
	}

	public set location(location:UiLocation) {
		this._location = location;
	}

	public get extentionSizes():CssSource[] {
		let result:CssSource[] = [];
		for (let c of this._extensionSizes) {
			result.push(c.toString());
		}
		return result;
	}

	public set extentionSizes(sizes:CssSource[]) {
		let levels = Math.floor(Math.sqrt(sizes.length));
		let levels2 = levels * levels;
		let data:CssLength[] = [];
		for (let i = 0; i < levels2; i++) {
			let s = sizes[i];
			data.push(new CssLength(s));
		}
		this._extensionSizes = data;
		this._focusItems = new Array(levels);
		this._focusItems.fill(this);
	}

	public get levels():number {
		return Math.floor(Math.sqrt(this._extensionSizes.length));
	}

	public get focusable():boolean {
		return super.getFlag(Flags.FOCUSABLE) || this.count() <= 0;
	}

	public get contentNodePath():string|null {
		return this._contentNodePath;
	}

	public set contentNodePath(path:string|null) {
		this._contentNodePath = path;
	}

	public onMount():void {
		if (this._template == null) {
			this._template = this.makeTemplate();
		}
		this._defaultWidth = this.innerWidth;
		this._defaultHeight = this.innerHeight;
		this.prepareBlocks();
		this.relocateBlocks(0);
		super.onMount();
	}

	private makeTemplate():UiNode {
		let template = new UiNode(this.application, "template");
		let buffer:UiNode[] = [];
		for (let c of this._children) {
			if (c instanceof UiMenuItem) {
				buffer.push(c);
			} else {
				Logs.warn("UiMenu has only UiMenuItem as a child element.");
			}
		}
		this.removeChildren();
		for (let c of buffer) {
			template.appendChild(c);
		}
		return template;
	}

	public count():number {
		return this._dataSource != null ? this._dataSource.count() : -1;
	}

	public getRecord(index:number):DataRecord|null {
		return this._dataSource != null ? this._dataSource.getRecord(index) : null;
	}

	public onDataSourceChanged(tag:string, ds:DataSource, at:number):UiResult {
		if (tag != this.dataSourceName) {
			return UiResult.IGNORED;
		}
		if (this.count() < 0) {
			//最初の通知
			let oldFocusable = this.focusable;
			this._dataSource = ds;
			this.reloadRecs(false);
			let newFocusable = this.focusable;
			if (oldFocusable && !newFocusable && this.application.getFocusOf(this) == this) {
				this.application.resetFocus(this);
			}
		} else {
			//２回目以降
			this.reloadRecs(true);
		}
		this.fireHScroll();
		this.fireVScroll();
		return UiResult.EATEN;
	}

	private prepareBlocks():void {
		this.removeChildren();
		let app = this.application;
		let b = new UiNodeBuilder(this, "1px");
		switch (this._location) {
		case "left":
			b.enter(new UiNode(app, "1")).tb(0, 0).lw(0, this._defaultWidth).style(DEFAULT_STYLE).leave();
			for (let i = 2; i <= this.levels; i++) {
				b.enter(new UiNode(app, `${i}`)).tb(0, 0).lw(this._defaultWidth, 0).style(DEFAULT_STYLE).leave();
			}
			break;
		case "right":
			b.enter(new UiNode(app, "1")).tb(0, 0).rw(0, this._defaultWidth).style(DEFAULT_STYLE).leave();
			for (let i = 2; i <= this.levels; i++) {
				b.enter(new UiNode(app, `${i}`)).tb(0, 0).rw(this._defaultWidth, 0).style(DEFAULT_STYLE).leave();
			}
			break;
		case "top":
			b.enter(new UiNode(app, "1")).lr(0, 0).th(0, this._defaultHeight).style(DEFAULT_STYLE).leave();
			for (let i = 2; i <= this.levels; i++) {
				b.enter(new UiNode(app, `${i}`)).lr(0, 0).th(this._defaultHeight, 0).style(DEFAULT_STYLE).leave();
			}
			break;
		case "bottom":
			b.enter(new UiNode(app, "1")).lr(0, 0).bh(0, this._defaultHeight).leave();
			for (let i = 2; i <= this.levels; i++) {
				b.enter(new UiNode(app, `${i}`)).lr(0, 0).bh(this._defaultHeight, 0).style(DEFAULT_STYLE).leave();
			}
			break;
		}
	}

	private relocateBlocks(level:number):void {
		if (!(0 <= level && level <= this.levels)) {
			throw new ParamError();
		}
		Logs.debug("relocateBlocks %d", level);
		if (level == 0) {
			this.relocateBlocks0();
		} else {
			this.relocateBlocks1(level);
		}
		this._lastLevel = level;
	}

	private relocateBlocks0():void {
		let firstBlock:UiNode;
		switch (this._location) {
		case "left":
			firstBlock = this.findNodeByPath("1") as UiNode;
			firstBlock.width = this._defaultWidth;
			firstBlock.visible = true;
			for (let i = 2; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				block.left = this._defaultWidth;
				block.width = 0;
				block.visible = false;
			}
			this.innerWidth = this._defaultWidth;
			break;
		case "right":
			firstBlock = this.findNodeByPath("1") as UiNode;
			firstBlock.width = this._defaultWidth;
			firstBlock.visible = true;
			for (let i = 2; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				block.right = this._defaultWidth;
				block.width = 0;
				block.visible = false;
			}
			this.innerWidth = this._defaultWidth;
			break;
		case "top":
			firstBlock = this.findNodeByPath("1") as UiNode;
			firstBlock.height = this._defaultHeight;
			firstBlock.visible = true;
			for (let i = 2; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				block.top = this._defaultHeight;
				block.height = 0;
				block.visible = false;
			}
			this.innerHeight = this._defaultHeight;
			break;
		case "bottom":
			firstBlock = this.findNodeByPath("1") as UiNode;
			firstBlock.height = this._defaultHeight;
			firstBlock.visible = true;
			for (let i = 2; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				block.bottom = this._defaultHeight;
				block.height = 0;
				block.visible = false;
			}
			this.innerHeight = this._defaultHeight;
			break;
		}
	}

	private relocateBlocks1(level:number):void {
		let index = (level - 1) * level;
		let totalSize = 0;
		switch (this._location) {
		case "left":
			for (let i = 1; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				let extSize = this._extensionSizes[index + i - 1];
				let size = extSize.toPixel(()=>this._defaultWidth);
				block.left = totalSize;
				block.width = size;
				block.visible = (size > 0 ? true : false);
				totalSize += size;
			}
			this.innerWidth = totalSize;
			break;
		case "right":
			for (let i = 1; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				let extSize = this._extensionSizes[index + i - 1];
				let size = extSize.toPixel(()=>this._defaultWidth);
				block.right = totalSize;
				block.width = size;
				block.visible = (size > 0 ? true : false);
				totalSize += size;
			}
			this.innerWidth = totalSize;
			break;
		case "top":
			for (let i = 1; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				let extSize = this._extensionSizes[index + i - 1];
				let size = extSize.toPixel(()=>this._defaultHeight);
				block.top = totalSize;
				block.height = size;
				block.visible = (size > 0 ? true : false);
				totalSize += size;
			}
			this.innerHeight = totalSize;
			break;
		case "bottom":
			for (let i = 1; i <= this.levels; i++) {
				let block = this.findNodeByPath(`${i}`) as UiNode;
				let extSize = this._extensionSizes[index + i - 1];
				let size = extSize.toPixel(()=>this._defaultHeight);
				block.bottom = totalSize;
				block.height = size;
				block.visible = (size > 0 ? true : false);
				totalSize += size;
			}
			this.innerHeight = totalSize;
			break;
		}
		let app = this.application;
		let focusItem = this._focusItems[level - 1];
		if (focusItem instanceof UiMenuItem) {
			app.setFocus(focusItem);
		}
	}

	private reloadRecs(doRelocate:boolean):UiResult {
		let app = this.application;
		let ds = this._dataSource as DataSource;
		let criteria = ds.criteria();
		let path = this.getPathAsArray(criteria.path as string);
		let level = path.length + 1;
		let block = this.findNodeByPath(`${level}`) as UiNode;
		block.removeChildren();
		let pos = 0;
		let firstChild:UiNode|null = null;
		for (let i = 0; i < ds.count(); i++) {
			let rec = ds.getRecord(i) as DataRecord;
			let template = rec[FIELD_TEMPLATE] as string;
			let node = (this._template as UiNode).getChildByName(template);
			if (node != null) {
				let item = node.clone() as UiMenuItem;
				item.focusable = true;
				item.setReocord(rec);
				block.appendChild(item);
				if (firstChild == null) {
					firstChild = item;
				}
				let rect = item.getRect();
				switch (this._location) {
				case "left":	case "right":
					item.top = pos;
					pos += rect.height;
					break;
				case "top":		case "bottom":
					item.left = pos;
					pos += rect.width;
					break;
				}
			}
		}
		if (doRelocate) {
			if (this._lastLevel != 0 && this._lastLevel != level) {
				this._currentLevel = level;
				this.relocateBlocks(level);
				if (firstChild != null) {
					app.setFocus(firstChild);
				}
			}
		}
		return UiResult.AFFECTED;
	}

	private getPathAsArray(path:string):string[] {
		let result:string[] = [];
		for (let p of path.split("/")) {
			if (p.length > 0) {
				result.push(p);
			}
		}
		return result;
	}

	public changeContent(content:string):UiResult {
		let app = this.application;
		let result = UiResult.IGNORED;
		Logs.debug("changeContent 1");
		if (this._contentNodePath != null) {
			Logs.debug("changeContent 2 %s", this._contentNodePath);
			let contentNode = this.findNodeByPath(this._contentNodePath);
			if (contentNode != null) {
				//save focus
				this._focusItems[this._currentLevel - 1] = app.getFocusOf(this) as UiNode;
				//kari
				Logs.debug("changeContent 3");
				(contentNode as UiTextNode).textContent = content;
				this.application.setFocus(contentNode);
				result = UiResult.EATEN;
			}
		}
		return result;
	}

	public forwardSubmenu(submenu:string):UiResult {
		let app = this.application;
		let result = UiResult.IGNORED;
		if (this._dataSource != null) {
			//save focus
			this._focusItems[this._currentLevel - 1] = app.getFocusOf(this) as UiNode;
			this._dataSource.select({path:submenu});
			result = UiResult.EATEN;
		}
		return result;
	}

	public backwardMenu():UiResult {
		let result = UiResult.IGNORED;
		if (this._currentLevel > 1) {
			this._currentLevel--;
			this.relocateBlocks(this._currentLevel);
			result = UiResult.EATEN;
		}
		return result;
	}

	public onFocus(target: UiNode, gained: boolean, other: UiNode | null): UiResult {
		if (gained) {
			if (target == this || this.isAncestorOf(target)) {
				this.relocateBlocks(this._currentLevel);
			}
		} else {
			if (target == this || this.isAncestorOf(target)) {
				this.relocateBlocks(0);
			}
		}
		return super.onFocus(target, gained, other);
	}

}