import
	{ Asserts, StateError, Value }
	from "~/lib/lang";
import { Colors } from "~/lib/ui/Colors";
import { DataHolder } from "~/lib/ui/DataHolder";
import { DataRecord, DataSource } from "~/lib/ui/DataSource";
import { KeyCodes } from "~/lib/ui/KeyCodes";
import { Rect } from "~/lib/ui/Rect";
import { Scrollable } from "~/lib/ui/Scrollable";
import { UiApplication, UiAxis } from "~/lib/ui/UiApplication";
import { Flags, UiNode, UiResult } from "~/lib/ui/UiNode";
import { UiPageNode } from "~/lib/ui/UiPageNode";
import { UiStyle, UiStyleBuilder } from "~/lib/ui/UiStyle";

/**
 * レコードノード用スタイル
 */
const RECORD_STYLE:UiStyle = new UiStyleBuilder()
	.backgroundColor(Colors.TRANSPARENT)
	.borderSize("0px")
	.build();

/**
 * マージン定数
 */
const MARGIN = 3;

class FocusInfo {
	public readonly recordIndex:number;
	public readonly fieldIndex:number;
	public constructor(rec:number, fld:number) {
		this.recordIndex = rec;
		this.fieldIndex = fld;
	}
}

/**
 * レコードノード
 */
class UiRecord extends UiNode implements DataHolder {

	private _index:number;

	private _record:DataRecord|null;

	private _sharedNames: Set<string>;

	public clone():UiRecord {
		return new UiRecord(this);
	}

	public constructor(app:UiApplication, name:string);
	public constructor(src:UiRecord);
	public constructor(param:any, name?:string) {
		if (param instanceof UiRecord) {
			super(param as UiRecord);
			let src = param as UiRecord;
			this._index = src._index;
			this._record = src._record;
			this._sharedNames = src._sharedNames;
		} else {
			super(param as UiApplication, name as string);
			this._index = 0;
			this._record = null;
			this._sharedNames = new Set<string>();
		}
	}

	public adoptChildren(other: UiNode): void {
		super.adoptChildren(other);
		this.collectSharedNames(this._sharedNames);
	}

	private collectSharedNames(sharedNames:Set<string>):Set<string> {
		let names = new Set<string>();
		for (let t of this.getDescendants()) {
			let name = t.name;
			if (names.has(name)) {
				sharedNames.add(name);
			} else {
				names.add(name);
			}
		}
		return sharedNames;
	}

	public get index():number {
		return this._index;
	}

	public setIndex(newIndex:number, forceReload:boolean):void {
		if (this._index == newIndex && !forceReload) {
			return;
		}
		this._index = newIndex;
		this._record = (newIndex < 0) ? null : this.owner.getRecord(newIndex);
		for (let c of this.getDescendants()) {
			c.onDataHolderChanged(this);
		}
	}

	public getValue(name: string): Value|DataRecord|null {
		if (this._record == null) {
			return null;
		}
		let value = this._record[name];
		return (value === undefined) ? null : value;
	}

	public setValue(name: string, value: Value|DataRecord|null): void {
		if (this._record == null) {
			return;
		}
		if (this._record[name] != value) {
			this._record[name] = value;
			if (this._sharedNames.has(name)) {
				for (let c of this.getDescendantsIf((e) => (e.name == name))) {
					c.onDataHolderChanged(this);
				}
			}
			this.owner.setRecord(this._record);
		}
	}

	public getRecord():DataRecord|null {
		return this._record;
	}

	public setReocord(rec:DataRecord):void {
		this._record = rec;
		this.owner.setRecord(this._record);
	}

	protected get owner():UiListNode {
		return this.parent as UiListNode;
	}


	public getPathSegment(): string {
		return "" + this.getRelativeIndex();
	}

	private getRelativeIndex():number {
		return this.owner.getIndexOfChild(this);
	}

}

/**
 * リスト属性
 */
enum ListFlags {
	VERTICAL		= 0x00000001,
	LOOP			= 0x00000002,
	ITEM_FOCUSABLE	= 0x00000004,
	SCROLL_LOCK		= 0x00000008,
	INITIAL			= VERTICAL|LOOP
}

/**
 * 垂直及び水平の仮想データリストノード
 */
export class UiListNode extends UiNode {

	private _listFlags:number;

	private _template: UiRecord | null;

	private _templateRect: Rect | null;

	private _templateBottom: number | null;

	private _templateRight: number | null;

	private _recSize: number;

	private _pageSize:number;

	private _recsPerPage:number;

	private _pageTopIndex:number;

	private _dataSource:DataSource|null;

	public clone():UiListNode {
		return new UiListNode(this);
	}

	constructor(app:UiApplication, name:string);
	constructor(src:UiListNode);
	public constructor(param:any, name?:string) {
		if (param instanceof UiListNode) {
			super(param as UiListNode);
			let src = param as UiListNode;
			this._listFlags = src._listFlags;
			this._template = src._template;
			this._templateRect = src._templateRect;
			this._templateBottom = src._templateBottom;
			this._templateRight = src._templateRight;
			this._recSize = src._recSize;
			this._pageSize = src._pageSize;
			this._recsPerPage = src._recsPerPage;
			this._pageTopIndex = src._pageTopIndex;
			this._dataSource = src._dataSource;
		} else {
			super(param as UiApplication, name as string);
			this._listFlags = ListFlags.INITIAL;
			this._template = null;
			this._templateRect = null;
			this._templateBottom = null;
			this._templateRight = null;
			this.vertical = true;
			this._recSize = 0;
			this._pageSize = 0;
			this._recsPerPage = 0;
			this._pageTopIndex = 0;
			this._dataSource = null;
		}
	}

	public get focusable():boolean {
		return super.getFlag(Flags.FOCUSABLE) || (this.itemFocusable && this.count() <= 0);
	}

	public get vertical():boolean {
		return this.getListFlag(ListFlags.VERTICAL);
	}

	public set vertical(on:boolean) {
		Asserts.assume(this._template == null);
		this.setListFlag(ListFlags.VERTICAL, on);
	}

	public get loop():boolean {
		return this.getListFlag(ListFlags.LOOP);
	}

	public set loop(on:boolean) {
		Asserts.assume(this._template == null);
		this.setListFlag(ListFlags.LOOP, on);
	}

	protected get itemFocusable():boolean {
		return this.getListFlag(ListFlags.ITEM_FOCUSABLE);
	}

	protected set itemFocusable(on:boolean) {
		this.setListFlag(ListFlags.ITEM_FOCUSABLE, on);
	}

	public get scrollLock():boolean {
		return this.getListFlag(ListFlags.SCROLL_LOCK);
	}

	public set scrollLock(on:boolean) {
		Asserts.assume(this._template == null);
		this.setListFlag(ListFlags.SCROLL_LOCK, on);
	}

	protected getListFlag(bit:ListFlags):boolean {
		return !!(this._listFlags & bit);
	}

	protected setListFlag(bit:ListFlags, on:boolean):boolean {
		let changed:boolean = (this.getListFlag(bit) != on);
		if (changed) {
			if (on) {
				this._listFlags |= bit;
			} else {
				this._listFlags &= ~bit;
			}
		}
		return changed;
	}

	public count():number {
		return this._dataSource != null ? this._dataSource.count() : -1;
	}

	public getRecord(index:number):DataRecord|null {
		return this._dataSource != null ? this._dataSource.getRecord(index) : null;
	}

	public setRecord(rec:DataRecord):void {
		if (this._dataSource != null) {
			this._dataSource.update(rec)
		}
	}

	public onMount():void {
		if (this._template == null) {
			this._template = this.makeTemplate();
		}
		this.measureSize();
		this.prepareArea();
		this.prepareRecs();
		this.relocateRecs();
		this.renumberRecs(true);
		this.setRecsVisiblity();
		super.onMount();
	}

	public onResize(): UiResult {
		super.onResize();
		if (this._templateRect == null) {
			throw new StateError();
		}
		if (this._templateRight != null) {
			this._templateRect.width =
				(this.innerWidth - this._templateRight) - this._templateRect.x;
		}
		if (this._templateBottom != null) {
			this._templateRect.height =
				(this.innerHeight - this._templateBottom) - this._templateRect.y;
		}
		this.measureSize();
		this.prepareArea();
		this.prepareRecs();
		this.relocateRecs();
		this.renumberRecs(true);
		this.setRecsVisiblity();
		return UiResult.AFFECTED;
	}

	public onDataSourceChanged(tag:string, ds:DataSource, at:number):UiResult {
		if (tag != this.dataSourceName) {
			return UiResult.IGNORED;
		}
		if (this.count() < 0) {
			//最初の通知
			let oldFocusable = this.focusable;
			this._dataSource = ds;
			this._pageTopIndex = this.validateIndex(0); //TODO 仮
			this.adjustScroll();
			this.renumberRecs(true);
			this.setRecsVisiblity();
			let newFocusable = this.focusable;
			if (oldFocusable && !newFocusable && this.application.getFocusOf(this) == this) {
				this.application.resetFocus(this);
			}
			(this.getPageNode() as UiPageNode).setHistoryStateAgain();
		} else {
			//２回目以降の通知
			let info = this.saveFocus();
			this._pageTopIndex = this.validateIndex(this._pageTopIndex);
			this.adjustScroll();
			this.renumberRecs(true);
			this.setRecsVisiblity();
			this.restoreFocus(info);
		}
		this.fireHScroll();
		this.fireVScroll();
		return UiResult.EATEN;
	}

	private saveFocus():FocusInfo|null {
		let app = this.application;
		let focus = app.getFocusOf(this);
		if (focus != null && this.isAncestorOf(focus)) {
			let rec = this.getUiRecordOf(focus);
			if (rec != null) {
				let recIndex = this._children.indexOf(rec);
				let fldIndex = rec.getDescendantIndex(focus);
				if (recIndex >= 0 && fldIndex >= 0) {
					return new FocusInfo(recIndex, fldIndex);
				}
			}
		}
		return null;
	}

	private restoreFocus(info:FocusInfo|null):void {
		if (info == null) {
			return;
		}
		if (this._children[info.recordIndex].visible) {
			return;
		}
		for (let i = info.recordIndex - 1; i >= 0; i--) {
			let rec = this._children[i];
			if (rec.visible) {
				let restore = rec.getDescendantAt(info.fieldIndex);
				if (restore != null) {
					this.application.setFocus(restore, this.vertical ? UiAxis.Y : UiAxis.X);
				}
				break;
			}
		}
	}

	private getUiRecordOf(node:UiNode):UiRecord|null {
		let e:UiNode|null = node;
		while (e != null && !(e instanceof UiRecord)) {
			e = e.parent;
		}
		return (e != null) ? e as UiRecord : null;
	}

	private makeTemplate():UiRecord {
		let rTemplate = this.getChildrenRect();
		let maxRight = 0;
		let maxBottom = 0;
		for (let c of this._children) {
			let r = c.getRect();
			if (c.right != null) {
				maxRight = Math.max(maxRight, r.right);
			}
			if (c.bottom != null) {
				maxBottom = Math.max(maxBottom, r.bottom);
			}
		}
		this._templateRect = rTemplate;
		let template = new UiRecord(this.application, "template");
		if (this.vertical) {
			this._templateBottom = (rTemplate.bottom == maxBottom ? this.innerHeight - maxBottom: null);
			template.left = "0px";
			template.right = "0px";
			template.top = `${rTemplate.top}px`;
			template.height = `${rTemplate.height}px`;
			for (let c of this._children) {
				let rChild = c.getRect();
				if (c.top != null) {
					c.top = `${rChild.top - rTemplate.top}px`;
				}
			}
		} else {
			this._templateRight = (rTemplate.right == maxRight ? this.innerWidth - maxRight : null);
			template.left = `${rTemplate.left}px`;
			template.width = `${rTemplate.width}px`;
			template.top = "0px";
			template.bottom = "0px";
			for (let c of this._children) {
				let rChild = c.getRect();
				if (c.left != null) {
					c.left = `${rChild.left - rTemplate.left}px`;
				}
			}
		}
		template.adoptChildren(this);
		template.style = RECORD_STYLE;
		this.itemFocusable = template.getVisibleDescendantsIf(
				(e)=>this.application.isFocusable(e), 1).length > 0;
		return template;
	}

	protected getTemplateRect(): Rect {
		if (this._templateRect == null) {
			throw new StateError();
		}
		return this._templateRect as Rect;
	}

	protected measureSize():void {
		let rTemplate = this.getTemplateRect();
		if (this.vertical) {
			this._recSize = rTemplate.top + rTemplate.height;
			this._pageSize = this.innerHeight;
		} else {
			this._recSize = rTemplate.left + rTemplate.width;
			this._pageSize = this.innerWidth;
		}
		this._recsPerPage = Math.ceil(this._pageSize / this._recSize);
	}

	protected prepareArea():void {
		let rTemplate = this.getTemplateRect();
		let n = this._recsPerPage + MARGIN * 2;
		if (this.vertical) {
			this.scrollLeft = "0px";
			this.scrollTop = `${this._recSize * MARGIN}px`;
			this.scrollWidth = "0px";
			this.scrollHeight = `${this._recSize * n + rTemplate.top}px`;
		} else {
			this.scrollLeft = `${this._recSize * MARGIN}px`;
			this.scrollTop = "0px";
			this.scrollWidth = `${this._recSize * n + rTemplate.left}px`;
			this.scrollHeight = "0px";
		}
	}

	protected prepareRecs():void {
		if (this._template == null) {
			throw new StateError();
		}
		let m = this._children.length;
		let n = this._recsPerPage + MARGIN * 2;
		if (m < n) {
			for (let i = m; i < n; i++) {
				let rec = this._template.clone();
				this.appendChild(rec);
			}
		} else if (m > n) {
			for (let i = m - 1; i >= n; i--) {
				this.removeChildAt(i);
			}
		}
	}

	protected relocateRecs():void {
		if (this._template == null) {
			throw new StateError();
		}
		let n = this._children.length;
		let r = this.getTemplateRect();
		if (this.vertical) {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let y = r.top + i * (r.top + r.height);
				rec.top = `${y}px`
				rec.height = `${r.height}px`;
			}
		} else {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let x = r.left + i * (r.left + r.width);
				rec.left = `${x}px`
				rec.width = `${r.width}px`;
			}
		}
	}

	protected validateIndex(index:number):number {
		let count = Math.max(0, this.count());
		let limit = 0;
		if (this.loop && count >= this._recsPerPage) {
			limit = count - 1;
		} else {
			limit = Math.max(0, count - this._recsPerPage);
		}
		return Math.min(Math.max(0, index), limit);
	}

	protected adjustScroll() {
		let count = this.count();
		if (count < this._recsPerPage) {
			let margin = this._recSize * MARGIN;
			if (this.vertical) {
				this.scrollTop = `${margin}px`;
			} else {
				this.scrollLeft = `${margin}px`;
			}
		}
	}

	protected renumberRecs(forceReload:boolean): void {
		let n = this._children.length;
		let count = this.count();
		if (count <= 0) {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				rec.setIndex(-1, forceReload);
			}
		} else {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let index = (this._pageTopIndex - MARGIN + i + count) % count;
				rec.setIndex(index, forceReload);
			}
		}
	}

	protected setRecsVisiblity():void {
		let n = this._children.length;
		let count = Math.max(0, this.count());
		if (this.loop && count >= this._recsPerPage) {
			// ループスクロール時は全件表示
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				rec.visible = true;
			}
		} else {
			// 論理データ範囲外は非表示
			let sp = Math.max(0, MARGIN - this._pageTopIndex);
			let ep = Math.min(n, MARGIN - this._pageTopIndex + count);
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				rec.visible = (sp <= i && i < ep);
			}
		}
	}

	public scrollFor(curr:UiNode, next:UiNode):UiResult {
		if (this.scrollLock) {
			let currRec = this.getRecordOf(curr);
			let nextRec = this.getRecordOf(next);
			if (currRec != null && nextRec != null) {
				if (this._pageTopIndex < this.count() - this._recsPerPage) {
					let dx = 0;
					let dy = 0;
					if (nextRec.index > currRec.index) {
						dx = +this._recSize * (this.vertical ? 0 : 1);
						dy = +this._recSize * (this.vertical ? 1 : 0);
					} else if (nextRec.index < currRec.index && this._pageTopIndex > 0) {
						dx = -this._recSize * (this.vertical ? 0 : 1);
						dy = -this._recSize * (this.vertical ? 1 : 0);
					}
					if (dx != 0 || dy != 0) {
						return this.scrollInside(dx, dy);
					}
				}
			}
		}
		return super.scrollFor(curr, next);
	}

	protected getRecordOf(node:UiNode):UiRecord|null {
		if (node instanceof UiRecord) {
			return node as UiRecord;
		}
		let recs = node.getAncestorsIf(e => e instanceof UiRecord, 1);
		if (recs.length > 0) {
			return recs[0] as UiRecord;
		}
		return null;
	}

	protected setScroll(x:number, y:number, step:number):void {
		super.setScroll(x, y, step);
		if (step >= 1.0) {
			if (this.vertical) {
				this.slideVertical(0);
			} else {
				this.slideHorizontal(0);
			}
		}
	}

	protected slideVertical(dy:number):UiResult {
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let y = scroll.y + dy;
		let result = UiResult.IGNORED;
		let count = this.count();
		let index = this._pageTopIndex;
		while (y < margin) {
			this._children.unshift(this._children.pop() as UiNode);
			y += this._recSize;
			index = (index - 1 + count) % count;
		}
		while (scroll.height - (y + this._pageSize) < margin) {
			this._children.push(this._children.shift() as UiNode);
			y -= this._recSize;
			index = (index + 1 + count) % count;
		}
		if (this._pageTopIndex != index) {
			this._pageTopIndex = index;
			this.renumberRecs(false);
			result |= UiResult.AFFECTED;
		}
		if (y != scroll.y) {
			this.scrollTop = `${y}px`;
			this.relocateRecs();
			this.setRecsVisiblity();
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	protected slideHorizontal(dx:number):UiResult {
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let x = scroll.x + dx;
		let result = UiResult.IGNORED;
		let count = this.count();
		let index = this._pageTopIndex;
		while (x < margin) {
			this._children.unshift(this._children.pop() as UiNode);
			x += this._recSize;
			index = (index - 1 + count) % count;
		}
		while (scroll.width - (x + this._pageSize) < margin) {
			this._children.push(this._children.shift() as UiNode);
			x -= this._recSize;
			index = (index + 1 + count) % count;
		}
		if (this._pageTopIndex != index) {
			this._pageTopIndex = index;
			this.renumberRecs(false);
			result |= UiResult.AFFECTED;
		}
		if (x != scroll.x) {
			this.scrollLeft = `${x}px`;
			this.relocateRecs();
			this.setRecsVisiblity();
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	public onVScroll(source:Scrollable, offset:number, limit:number, count:number):void {
		this._pageTopIndex = this.validateIndex(Math.floor(offset / this._recSize));
		this.adjustScroll();
		this.renumberRecs(true);
		this.setRecsVisiblity();
		let remain = (offset % this._recSize) + (MARGIN * this._recSize);
		this.scrollTop = `${remain}px`;
	}

	public onHScroll(source:Scrollable, offset:number, limit:number, count:number):void {
		this._pageTopIndex = this.validateIndex(Math.floor(offset / this._recSize));
		this.adjustScroll();
		this.renumberRecs(true);
		this.setRecsVisiblity();
		let remain = (offset % this._recSize) + (MARGIN * this._recSize);
		this.scrollLeft = `${remain}px`;
	}

	public fireVScroll():void {
		let page = this.getPageNode() as UiPageNode;
		let count = Math.max(0, this.count());
		if (!this.vertical) {
			super.fireVScroll();
		} else if (!(this.mounted && this.vScrollName != null)) {
			//NOP
		} else if (count >= this._recsPerPage) {
			let scroll = this.getScrollRect();
			let rTemplate = this.getTemplateRect();
			let margin = this._recSize * MARGIN;
			let index = this._pageTopIndex;
			let offset = index * this._recSize + (scroll.y - margin);
			let limit = this._pageSize;
			let totalSize = count * this._recSize + rTemplate.top;
			page.dispatchVScroll(this.vScrollName, this, offset, limit, totalSize);
		} else {
			page.dispatchVScroll(this.vScrollName, this, 0, this._pageSize, this._pageSize);
		}
	}

	public fireHScroll():void {
		let page = this.getPageNode() as UiPageNode;
		let count = Math.max(0, this.count());
		if (this.vertical) {
			super.fireHScroll();
		} else if (!(this.mounted && this.hScrollName != null)) {
			//NOP
		} else if (count >= this._recsPerPage) {
			let scroll = this.getScrollRect();
			let rTemplate = this.getTemplateRect();
			let margin = this._recSize * MARGIN;
			let index = this._pageTopIndex;
			let offset = index * this._recSize + (scroll.x - margin);
			let limit = this._pageSize;
			let totalSize = count * this._recSize + rTemplate.left;
			page.dispatchHScroll(this.hScrollName, this, offset, limit, totalSize);
		} else {
			page.dispatchHScroll(this.hScrollName, this, 0, this._pageSize, this._pageSize);
		}
	}

	public onMouseWheel(target:UiNode, x:number, y:number,
			dx:number, dy:number, mod:number, at:number):UiResult {
		let count = Math.max(0, this.count());
		if (count < this._recsPerPage) {
			return UiResult.IGNORED;
		}
		let result = UiResult.CONSUMED;
		if (mod & KeyCodes.MOD_SHIFT) {
			let dt = dx;
			dx = dy;
			dy = dt;
		}
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let rTemplate = this.getTemplateRect();
		if (this.vertical) {
			if (!this.loop) {
				let maxOffset = count * this._recSize + rTemplate.top - this._pageSize;
				let oldOffset = this._pageTopIndex * this._recSize + (scroll.y - margin);
				let newOffset = Math.min(Math.max(0, oldOffset + dy), maxOffset);
				dy = newOffset - oldOffset;
			}
			result |= this.slideVertical(dy);
		} else {
			if (!this.loop) {
				let maxOffset = count * this._recSize + rTemplate.left - this._pageSize;
				let oldOffset = this._pageTopIndex * this._recSize + (scroll.x - margin);
				let newOffset = Math.min(Math.max(0, oldOffset + dx), maxOffset);
				dx = newOffset - oldOffset;
			}
			result |= this.slideHorizontal(dx);
		}
		return result;
	}

	public scrollRecord(dir:number): UiResult {
		let dx:number;
		let dy:number;
		if (this.vertical) {
			dx = 0;
			dy = this._recSize * Math.sign(dir);
		} else {
			dx = this._recSize * Math.sign(dir);
			dy = 0;
		}
		return this.scrollInside(dx, dy);
	}
}