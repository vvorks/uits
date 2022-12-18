import { Asserts, Logs, StateError, Value } from "../lang";
import { Colors } from "./Colors";
import { DataHolder } from "./DataHolder";
import { DataRecord, DataSource } from "./DataSource";
import { Rect } from "./Rect";
import { UiApplication, UiAxis } from "./UiApplication";
import { Flags, UiNode, UiResult } from "./UiNode";
import { UiStyle, UiStyleBuilder } from "./UiStyle";

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

	private _index:number = 0;

	private _record:DataRecord|null = null;

	public clone():UiRecord {
		return new UiRecord(this);
	}

	public get className():string {
		return "UiRecord";
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
		for (let c of this.getDescendantsIf(()=>true)) {
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

}

/**
 * リスト属性
 */
enum ListFlags {
	VERTICAL		= 0x00000001,
	LOOP			= 0x00000002,
	ITEM_FOCUSABLE	= 0x00000004,
	INITIAL			= VERTICAL|LOOP
}

/**
 * 垂直及び水平の仮想データリストノード
 *
 * TODO
 *		水平モードのテスト
 *		周囲にリスト以外のノードがあった場合のカーソル移動確認
 *		データが更新された時のふるまい（特に減少したときのカーソルの調整）
 * 		カーソル移動の不具合修正
 */
export class UiListNode extends UiNode {

	private _listFlags:number;

	private _template: UiRecord | null;

	private _templateRect: Rect | null;

	private _recSize: number;

	private _pageSize:number;

	private _recsPerPage:number;

	private _pageTopIndex:number;

	private _dataSource:DataSource|null;

	public clone():UiListNode {
		return new UiListNode(this);
	}

	public get className():string {
		return "UiListNode";
	}

	public constructor(param:any, name?:string) {
		super(param, name);
		if (param instanceof UiListNode) {
			let src = param as UiListNode;
			this._listFlags = src._listFlags;
			this._template = src._template;
			this._templateRect = src._templateRect;
			this._recSize = src._recSize;
			this._pageSize = src._pageSize;
			this._recsPerPage = src._recsPerPage;
			this._pageTopIndex = src._pageTopIndex;
			this._dataSource = src._dataSource;
		} else {
			this._listFlags = ListFlags.INITIAL;
			this._template = null;
			this._templateRect = null;
			this.vertical = true; //TODO kari
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
			this._templateRect = this.getChildrenRect();
			this._template = this.makeTemplate(this._templateRect);
		}
		this.measureSize();
		this.prepareArea();
		this.prepareRecs();
		this.relocateRecs();
		this.renumberRecs(true);
		this.setRecsVisiblity();
		super.onMount();
		if (this.dataSourceName != null) {
			this.application.attachIntoDataSource(this.dataSourceName, this);
		}
	}

	public onDataSourceChanged(tag:string, ds:DataSource):UiResult {
		if (tag != this.dataSourceName) {
			return UiResult.IGNORED;
		}
		if (this.count() < 0) {
			//最初の通知
			let oldFocusable = this.focusable;
			this._dataSource = ds;
			this.resetTopIndex();
			this.adjustScroll();
			this.renumberRecs(true);
			this.setRecsVisiblity();
			let newFocusable = this.focusable;
			if (oldFocusable && !newFocusable && this.application.getFocusOf(this) == this) {
				this.application.resetFocus(this);
			}
		} else {
			//２回目以降の通知
			let info = this.saveFocus();
			this.resetTopIndex();
			this.adjustScroll();
			this.renumberRecs(true);
			this.setRecsVisiblity();
			this.restoreFocus(info);
		}
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

	private makeTemplate(rTemplate:Rect):UiRecord {
		let template = new UiRecord(this.application);
		if (this.vertical) {
			template.left = "0px";
			template.right = "0px"
			template.top = "0px";
			template.height = `${rTemplate.height}px`;
			for (let c of this._children) {
				let rChild = c.getRect();
				c.top = `${rChild.top - rTemplate.top}px`;
				c.height = `${rChild.height}px`;
				c.bottom = null;
			}
		} else {
			template.left = "0px";
			template.width = `${rTemplate.width}px`;
			template.top = "0px";
			template.bottom = "0px";
			for (let c of this._children) {
				let rChild = c.getRect();
				c.left = `${rChild.left - rTemplate.left}px`;
				c.width = `${rChild.width}px`;
				c.right = null;
			}
		}
		template.adoptChildren(this);
		template.style = RECORD_STYLE;
		this.itemFocusable = template.getVisibleDescendantsIf(
				(e)=>this.application.isFocusable(e), 1).length > 0;
		return template;
	}

	protected measureSize():void {
		if (this._templateRect == null) {
			throw new StateError();
		}
		let rTemplate = this._templateRect;
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
		if (this._templateRect == null) {
			throw new StateError();
		}
		let rTemplate = this._templateRect;
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
		if (this._template == null || this._templateRect == null) {
			throw new StateError();
		}
		let n = this._children.length;
		let r = this._templateRect as Rect;
		if (this.vertical) {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let y = r.top + i * (r.top + r.height);
				rec.top = `${y}px`
			}
		} else {
			for (let i = 0; i < n; i++) {
				let rec = this._children[i] as UiRecord;
				let x = r.left + i * (r.left + r.width);
				rec.left = `${x}px`
			}
		}
	}

	protected resetTopIndex():boolean {
		let count = Math.max(0, this.count());
		let limit = 0;
		let index = this._pageTopIndex;
		if (this.loop && count >= this._recsPerPage) {
			limit = count - 1;
		} else {
			limit = Math.max(0, count - this._recsPerPage);
		}
		this._pageTopIndex = Math.min(Math.max(0, index), limit);
		let changed = this._pageTopIndex != index;
		return changed;
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

	public scrollFor(node:UiNode):UiResult {
		let result = super.scrollFor(node);
		if (this.vertical) {
			result |= this.slideVertical();
		} else {
			result |= this.slideHorizontal();
		}
		return result;
	}

	protected slideVertical():UiResult {
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let y = scroll.y;
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

	protected slideHorizontal():UiResult {
		let scroll = this.getScrollRect();
		let margin = this._recSize * MARGIN;
		let x = scroll.x;
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

}