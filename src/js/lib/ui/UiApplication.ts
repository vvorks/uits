import { Asserts, Properties, Logs, StateError, ParamError } from "../lang";
import { Metrics } from "./Metrics";
import { UiNode, UiResult } from "./UiNode";
import { UiRootNode } from "./UiRootNode";
import { UiPageNode } from './UiPageNode';
import { KeyCodes } from './KeyCodes';
import { Rect } from "./Rect";
import { DataSource } from "./DataSource";

export enum UiAxis {
	NONE = 0,
	X = 1,
	Y = 2,
	XY = 3
}

enum PageType {
	NORMAL,
	TOAST,
}

type Runnable = ()=>void;

class LivePage {

	private _pageNode:UiPageNode;
	private _type:PageType;
	private _xAxis: number;
	private _yAxis: number;
	private _focusNode: UiNode | null;
	private _clickNode: UiNode | null;

	public constructor(pageNode:UiPageNode, type:PageType = PageType.NORMAL) {
		this._pageNode = pageNode;
		this._type = type;
		this._xAxis = 0;
		this._yAxis = 0;
		this._focusNode = null;
		this._clickNode = null;
	}

	public get pageNode():UiPageNode {
		return this._pageNode;
	}

	public isToast():boolean {
		return this._type == PageType.TOAST;
	}

	public get xAxis(): number {
		return this._xAxis;
	}

	public set xAxis(value: number) {
		this._xAxis = value;
	}

	public get yAxis(): number {
		return this._yAxis;
	}

	public set yAxis(value: number) {
		this._yAxis = value;
	}

	public get focusNode(): UiNode|null {
		return this._focusNode;
	}

	public get focusOrPage():UiNode {
		return this._focusNode != null ? this._focusNode : this._pageNode;
	}

	public focus(newNode: UiNode, axis:UiAxis):UiResult {
		let oldNode:UiNode|null = this._focusNode;
		if (oldNode == newNode) {
			return UiResult.IGNORED;
		}
		let result = UiResult.IGNORED;
		let luca:UiNode|null = oldNode != null && newNode != null ? oldNode.getLucaNodeWith(newNode) : null;
		if (oldNode != null) {
			let node:UiNode|null = oldNode;
			while (node != null && node != luca) {
				result |= node.onFocus(oldNode, false, newNode);
				node = node.parent;
			}
		}
		this._focusNode = newNode;
		if (newNode != null) {
			let node:UiNode|null = newNode;
			while (node != null && node != luca) {
				result |= node.onFocus(newNode, true, oldNode);
				node = node.parent;
			}
		}
		//AXIS更新
		let rect = newNode.getRectOnRoot();
		if (axis & UiAxis.X) {
			this.xAxis = rect.centerX;
		}
		if (axis & UiAxis.Y) {
			this.yAxis = rect.top;
		}
		Logs.info("page %s focus %s axis %d,%d", this._pageNode.name, this._focusNode.name, this.xAxis, this.yAxis);
		return result;
	}

	public get clickNode(): UiNode|null {
		return this._clickNode;
	}

	public click(node: UiNode|null):UiResult {
		let result = UiResult.IGNORED;
		if (this._clickNode != node) {
			if (this._clickNode != null) {
				if (this._clickNode.clicking) {
					this._clickNode.clicking = false;
					result |= UiResult.AFFECTED;
				}
			}
			this._clickNode = node;
			if (this._clickNode != null) {
				if (!this._clickNode.clicking) {
					this._clickNode.clicking = true;
					result |= UiResult.AFFECTED;
				}
			}
		}
		return result;
	}

}

class DataSourceEntry {

	private _tag: string;

	private _dataSource: DataSource|null;

	private _attaches: UiNode[];

	public constructor(tag:string) {
		this._tag = tag;
		this._dataSource = null;
		this._attaches = [];
	}

	public get dataSource():DataSource|null {
		return this._dataSource;
	}

	public set dataSource(ds:DataSource|null) {
		if (this._dataSource != null && ds != null) {
			throw new StateError("");
		}
		this._dataSource = ds;
	}

	public attach(node:UiNode) {
		this._attaches.push(node);
	}

	public detach(node:UiNode) {
		let index = this._attaches.indexOf(node);
		if (index >= 0) {
			this._attaches.splice(index, 1);
		}
	}
	public onDataSourceChanged(): UiResult {
		let result:UiResult = UiResult.IGNORED;
		for (let node of this._attaches) {
			result |= node.onDataSourceChanged(this._tag, this._dataSource as DataSource);
		}
		return result;
	}

}

type PageFactory = (args:Properties<string>) => UiPageNode;

export class UiApplication {

	private _selector:string;

	private _rootElement:HTMLElement|null;

	private _rootNode:UiRootNode|null;

	private _pageFactories:Properties<PageFactory>;

	private _dataSources:Properties<DataSourceEntry>;

	private _pageStack: LivePage[];

	private _captureNode: UiNode|null;

	private _clientWidth:number;

	private _clientHeight:number;

	private _busy:boolean = false;

	private _finallyTasks: Runnable[];

public constructor(selector:string) {
		this._selector = selector;
		this._rootElement = null;
		this._rootNode = null;
		this._pageFactories = {};
		this._dataSources = {};
		this._pageStack = [];
		this._captureNode = null;
		this._clientWidth = 0;
		this._clientHeight = 0;
		this._finallyTasks = [];
		window.onload = (evt:Event) => {this.onLoad(evt)};
	}

	public get rootNode():UiRootNode {
		Asserts.assume(this._rootNode != null);
		return this._rootNode as UiRootNode;
	}

	public get rootElement(): HTMLElement {
		Asserts.assume(this._rootElement != null);
		return this._rootElement as HTMLElement;
	}

	public get clientWidth(): number {
		return this._clientWidth;
	}

	public get clientHeight(): number {
		return this._clientHeight;
	}

	public onLoad(evt:Event):void {
		//root準備
		this._rootNode = new UiRootNode(this, "root");
		this._rootNode.inset = "0px";
		this._rootElement = document.querySelector(this._selector);
		if (this._rootElement == null) {
			this._rootElement = document.body;
		}
		let root = this._rootElement;
		//メトリックス計測
		Metrics.getInstance().measure(root);
		let docElement = document.documentElement;
		this._clientWidth = docElement.clientWidth;
		this._clientHeight = docElement.clientHeight;
		//イベントハンドラ設定
		root.addEventListener("keydown", (evt) => {this.processKeyDown(evt)});
		root.addEventListener("keypress", (evt) => {this.processKeyPress(evt)});
		root.addEventListener("keyup", (evt) => {this.processKeyUp(evt)});
		root.addEventListener("mousemove", (evt) => {this.processMouseMove(evt)})
		root.addEventListener("mousedown", (evt) => {this.processMouseDown(evt)})
		root.addEventListener("mouseup", (evt) => {this.processMouseUp(evt)})
		root.addEventListener("click", (evt) => {this.processMouseClick(evt)})
		root.addEventListener("dblclick", (evt) => {this.processMouseDoubleClick(evt)})
		root.addEventListener("wheel", (evt) => {this.processMouseWheel(evt)})
		window.addEventListener("resize", (evt) => {this.processResize(evt)});
		window.addEventListener('hashchange', (evt) => {this.processHashChanged()});
		//派生クラス初期化
		this.initialize();
		//初回のロード処理
		this.processHashChanged();
	}

	protected initialize():void {
	}

	public addPageFactory(tag:string, func:PageFactory):void {
		this._pageFactories[tag] = func;
	}

	public removePageFactory(tag:string):void {
		delete this._pageFactories[tag];
	}

	public addDataSource(tag:string, ds:DataSource):void {
		let entry = this._dataSources[tag];
		if (entry === undefined) {
			entry = new DataSourceEntry(tag);
			entry.dataSource = ds;
			this._dataSources[tag] = entry;
			ds.addApplication(this);
		}
	}

	public removeDataSource(tag:string):void {
		let entry = this._dataSources[tag];
		if (entry !== undefined) {
			let ds = entry.dataSource;
			if (ds == null) {
				throw new ParamError();
			}
			ds.removeAppliation(this);
			entry.dataSource = null;
		}
	}

	public getDataSource(tag:string):DataSource|null {
		let entry = this._dataSources[tag];
		return (entry !== undefined) ? entry.dataSource : null;
	}

	public attachIntoDataSource(tag:string, node:UiNode) {
		let entry = this._dataSources[tag];
		if (entry === undefined) {
			entry = new DataSourceEntry(tag);
			this._dataSources[tag] = entry;
		}
		entry.attach(node);
	}

	public detachFromDataSource(tag:string, node:UiNode) {
		let entry = this._dataSources[tag];
		if (entry !== undefined) {
			entry.detach(node);
		}
	}

	public transit(tag:string, args:Properties<string>):UiResult {
		let factory:PageFactory|undefined = this._pageFactories[tag];
		if (factory == null) {
			return UiResult.IGNORED;
		} else {
			while (this._pageStack.length > 0) {
				this.back();
			}
			this.call(factory(args));
			return UiResult.EATEN;
		}
	}

	public isFocusable(e:UiNode):boolean {
		return !e.deleted && e.visible && e.enable && e.focusable;
	}

	public isAppearedFocusable(e:UiNode):boolean {
		return this.isFocusable(e) && e.getBlockerNode() == null;
	}

	public isAppearedFocusableAll(e:UiNode):boolean {
		if (!this.isAppearedFocusable(e)) {
			return false;
		}
		let node:UiNode|null = e.parent;
		while (node != null) {
			if (!(!node.deleted && node.visible)) {
				return false;
			}
			node = node.parent;
		}
		return true;
	}

	public call(pageNode:UiPageNode):void {
		let page = new LivePage(pageNode);
		this._pageStack.push(page);
		this.rootNode.appendChild(pageNode);
		pageNode.onMount();
		if (page.focusNode == null || !this.isAppearedFocusable(page.focusNode)) {
			if (!this.resetFocus(pageNode)) {
				Logs.error("LOST FOCUS!");
			}
		}
	}

	public resetFocus(node:UiNode):boolean {
		let page = this.getLivePageOf(node);
		if (page == null) {
			throw new ParamError();
		}
		let list = node.getVisibleDescendantsIf((e)=>this.isAppearedFocusable(e), 1);
		let found = (list.length > 0);
		if (found) {
			page.focus(list[0], UiAxis.XY);
		}
		return found;
	}

	public back():void {
		if (this._pageStack.length == 0) {
			return;
		}
		let page = this._pageStack.pop() as LivePage;
		let pageNode = page.pageNode;
		pageNode.onUnmount();
		this.rootNode.removeChild(pageNode);
	}

	public setFocus(node:UiNode, axis:UiAxis):UiResult {
		let page = this.getLivePageOf(node);
		let result = UiResult.IGNORED;
		if (page != null) {
			page.focus(node, axis);
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	public getFocus():UiNode|null {
		let page = this.getLivePage();
		if (page != null) {
			return page.focusNode;
		}
		return null;
	}

	public getFocusOf(node:UiNode):UiNode|null {
		let page = this.getLivePageOf(node);
		if (page != null) {
			return page.focusNode;
		}
		return null;
	}

	protected getLivePage():LivePage|null {
		let len = this._pageStack.length;
		return len == 0 ? null : this._pageStack[len - 1];
	}

	protected getLivePageOf(node:UiNode):LivePage|null {
		let pageNode = node.getPageNode();
		let len = this._pageStack.length;
		for (let i = len - 1; i >= 0; i--) {
			let page = this._pageStack[i];
			if (pageNode == page.pageNode) {
				return page;
			}
		}
		return null;
	}

	private recoverFocus():UiResult {
		let result = UiResult.IGNORED;
		let page = this.getLivePage();
		if (page != null) {
			if (page.focusNode == null || !this.isAppearedFocusableAll(page.focusNode)) {
				if (!this.resetFocus(page.pageNode)) {
					Logs.error("LOST FOCUS!");
				} else {
					Logs.warn("RECOVER FOCUS!");
					result |= UiResult.AFFECTED;
				}
			} else {
				Logs.debug("focus %d", page.focusNode.id);
			}
		}
		return result;
	}

	public sync() {
		Logs.info("sync");
		this.rootNode.sync();
		this._busy = true;
		window.requestAnimationFrame((t:number) => {
			this._busy = false;
		});

	}

	public runFinally(task:Runnable):void {
		this._finallyTasks.push(task);
	}

	protected flushFinally():void {
		while (this._finallyTasks.length > 0) {
			(this._finallyTasks.shift() as Runnable)();
		}
	}

	public runAfter(msec:number, task:Runnable):void {
		setTimeout(task, msec);
	}

	private processKeyDown(evt:KeyboardEvent):void {
		try {
			//busyチェック
			if (this._busy) {
				Logs.warn("BUSY");
				this.postProcessEvent(evt, UiResult.CONSUMED);
				return;
			}
			//イベント情報取得
			let key = evt.keyCode;
			let ch = evt.charCode;
			let mod = this.getKeyModifier(evt);
			let at = evt.timeStamp;
			Logs.info("keyDown key=0x%x ch=0x%x mod=0x%x", key, ch, mod);
			//UINodeへのキーディスパッチ
			let result:UiResult = UiResult.IGNORED;
			let depth = this._pageStack.length;
			let target = this.getFocus();
			for (let i = depth - 1; i >= 0; i--) {
				let page = this._pageStack[i];
				let node:UiNode|null = page.focusOrPage;
				while (node != null) {
					result = node.onKeyDown(target, key, ch, mod, at);
					if (result & UiResult.CONSUMED) {
						break;
					}
					node = node.parent;
				}
				if ((result & UiResult.CONSUMED) || !page.isToast()) {
					break;
				}
			}
			//UiApplicationのデフォルト処理呼び出し
			if (!(result & UiResult.CONSUMED)) {
				//UiNode側の処理でフォーカスが変化している場合があるので、再取得
				target = this.getFocus();
				if (target != null) {
					result = this.onKeyDown(target, key, ch, mod, at);
				}
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processKeyPress(evt:KeyboardEvent):void {
		try {
			//イベント情報取得
			let key = evt.keyCode;
			let ch = evt.charCode;
			let mod = this.getKeyModifier(evt);
			let at = evt.timeStamp;
			Logs.info("keyPress key=0x%x ch=0x%x mod=0x%x", key, ch, mod);
			//UINodeへのキーディスパッチ
			let result:UiResult = UiResult.IGNORED;
			let depth = this._pageStack.length;
			let target = this.getFocus();
			for (let i = depth - 1; i >= 0; i--) {
				let page = this._pageStack[i];
				let node:UiNode|null = page.focusOrPage;
				while (node != null) {
					result = node.onKeyPress(target, key, ch, mod, at);
					if (result & UiResult.CONSUMED) {
						break;
					}
					node = node.parent;
				}
				if ((result & UiResult.CONSUMED) || !page.isToast()) {
					break;
				}
			}
			//UiApplicationのデフォルト処理呼び出し
			if (!(result & UiResult.CONSUMED)) {
				//UiNode側の処理でフォーカスが変化している場合があるので、再取得
				target = this.getFocus();
				if (target != null) {
					result = this.onKeyPress(target, key, ch, mod, at);
				}
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processKeyUp(evt:KeyboardEvent):void {
		try {
			//イベント情報取得
			let key = evt.keyCode;
			let ch = evt.charCode;
			let mod = this.getKeyModifier(evt);
			let at = evt.timeStamp;
			Logs.info("keyUp key=0x%x ch=0x%x mod=0x%x", key, ch, mod);
			//UINodeへのキーディスパッチ
			let result:UiResult = UiResult.IGNORED;
			let depth = this._pageStack.length;
			let target = this.getFocus();
			for (let i = depth - 1; i >= 0; i--) {
				let page = this._pageStack[i];
				let node:UiNode|null = page.focusOrPage;
				while (node != null) {
					result = node.onKeyUp(target, key, ch, mod, at);
					if (result & UiResult.CONSUMED) {
						break;
					}
					node = node.parent;
				}
				if ((result & UiResult.CONSUMED) || !page.isToast()) {
					break;
				}
			}
			//UiApplicationのデフォルト処理呼び出し
			if (!(result & UiResult.CONSUMED)) {
				//UiNode側の処理でフォーカスが変化している場合があるので、再取得
				target = this.getFocus();
				if (target != null) {
					result = this.onKeyUp(target, key, ch, mod, at);
				}
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private getKeyModifier(evt:KeyboardEvent):number {
		return	(evt.shiftKey ? KeyCodes.MOD_SHIFT  : 0) |
				(evt.ctrlKey  ? KeyCodes.MOD_CTRL   : 0) |
				(evt.altKey   ? KeyCodes.MOD_ALT    : 0) |
				(evt.metaKey  ? KeyCodes.MOD_META   : 0) |
				(evt.repeat   ? KeyCodes.MOD_REPEAT : 0) ;
	}

	private processMouseMove(evt:MouseEvent):void {
		try {
			//busyチェック
			if (this._busy) {
				Logs.warn("BUSY");
				this.postProcessEvent(evt, UiResult.CONSUMED);
				return;
			}
			let x = evt.clientX;
			let y = evt.clientY;
			let mod = this.getMouseModifier(evt);
			let at = evt.timeStamp;
			//Logs.info("mouseMove x=%d y=%d mod=0x%x", x, y, mod);
			let pt:Rect = new Rect().locate(x, y, 1, 1,);
			let target:UiNode = this.getMouseTarget(pt);
			let node:UiNode = target;
			let result = node.onMouseMove(target, pt.x, pt.y, mod, at);
			while (!(result & UiResult.CONSUMED) && node.parent != null) {
				node.translate(pt, +1);
				node = node.parent;
				result |= node.onMouseMove(target, pt.x, pt.y, mod, at);
			}
			if (!(result & UiResult.CONSUMED)) {
				result |= this.onMouseMove(target, pt.x, pt.y, mod, at);
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processMouseDown(evt:MouseEvent):void {
		try {
			//busyチェック
			if (this._busy) {
				Logs.warn("BUSY");
				this.postProcessEvent(evt, UiResult.CONSUMED);
				return;
			}
			let x = evt.clientX;
			let y = evt.clientY;
			let mod = this.getMouseModifier(evt);
			let at = evt.timeStamp;
			Logs.info("mouseDown x=%d y=%d mod=0x%x", x, y, mod);
			let pt:Rect = new Rect().locate(x, y, 1, 1,);
			let target:UiNode = this.getMouseTarget(pt);
			let node:UiNode = target;
			let result = node.onMouseDown(target, pt.x, pt.y, mod, at);
			while (!(result & UiResult.CONSUMED) && node.parent != null) {
				node.translate(pt, +1);
				node = node.parent;
				result |= node.onMouseDown(target, pt.x, pt.y, mod, at);
			}
			if (!(result & UiResult.CONSUMED)) {
				result |= this.onMouseDown(target, pt.x, pt.y, mod, at);
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processMouseUp(evt:MouseEvent):void {
		try {
			let x = evt.clientX;
			let y = evt.clientY;
			let mod = this.getMouseModifier(evt);
			let at = evt.timeStamp;
			Logs.info("mouseUp x=%d y=%d mod=0x%x", x, y, mod);
			let pt:Rect = new Rect().locate(x, y, 1, 1,);
			let target:UiNode = this.getMouseTarget(pt);
			let node:UiNode = target;
			let result = node.onMouseUp(target, pt.x, pt.y, mod, at);
			while (!(result & UiResult.CONSUMED) && node.parent != null) {
				node.translate(pt, +1);
				node = node.parent;
				result |= node.onMouseUp(target, pt.x, pt.y, mod, at);
			}
			if (!(result & UiResult.CONSUMED)) {
				result |= this.onMouseUp(target, pt.x, pt.y, mod, at);
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processMouseClick(evt:MouseEvent):void {
		try {
			let x = evt.clientX;
			let y = evt.clientY;
			let mod = this.getMouseModifier(evt);
			let at = evt.timeStamp;
			Logs.info("mouseClick x=%d y=%d mod=0x%x", x, y, mod);
			let pt:Rect = new Rect().locate(x, y, 1, 1,);
			let target:UiNode = this.getMouseTarget(pt);
			let node:UiNode = target;
			let result = node.onMouseClick(target, pt.x, pt.y, mod, at);
			while (!(result & UiResult.CONSUMED) && node.parent != null) {
				node.translate(pt, +1);
				node = node.parent;
				result |= node.onMouseClick(target, pt.x, pt.y, mod, at);
			}
			if (!(result & UiResult.CONSUMED)) {
				result |= this.onMouseClick(target, pt.x, pt.y, mod, at);
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processMouseDoubleClick(evt:MouseEvent):void {
		try {
			let x = evt.clientX;
			let y = evt.clientY;
			let mod = this.getMouseModifier(evt);
			let at = evt.timeStamp;
			Logs.info("mouseDoubleClick x=%d y=%d mod=0x%x", x, y, mod);
			let pt:Rect = new Rect().locate(x, y, 1, 1,);
			let target:UiNode = this.getMouseTarget(pt);
			let node:UiNode = target;
			let result = node.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
			while (!(result & UiResult.CONSUMED) && node.parent != null) {
				node.translate(pt, +1);
				node = node.parent;
				result |= node.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
			}
			if (!(result & UiResult.CONSUMED)) {
				result |= this.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processMouseWheel(evt:WheelEvent):void {
		try {
			let x = evt.clientX;
			let y = evt.clientY;
			let dx = 0;
			let dy = evt.deltaY; //TODO MULTIPLY WHEEL_SCALE
			let mod = this.getMouseModifier(evt);
			let at = evt.timeStamp;
			Logs.info("mouseWheel x=%d y=%d dx=%d dy=%d mod=0x%x", x, y, dx, dy, mod);
			let pt:Rect = new Rect().locate(x, y, 1, 1,);
			let target:UiNode = this.getMouseTarget(pt);
			let node:UiNode = target;
			let result = node.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
			while (!(result & UiResult.CONSUMED) && node.parent != null) {
				node.translate(pt, +1);
				node = node.parent;
				result |= node.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
			}
			if (!(result & UiResult.CONSUMED)) {
				result |= this.onMouseDoubleClick(target, pt.x, pt.y, mod, at);
			}
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private getMouseModifier(evt:MouseEvent):number {
		//TODO ボタン情報付与
		return	(evt.shiftKey ? KeyCodes.MOD_SHIFT  : 0) |
				(evt.ctrlKey  ? KeyCodes.MOD_CTRL   : 0) |
				(evt.altKey   ? KeyCodes.MOD_ALT    : 0) |
				(evt.metaKey  ? KeyCodes.MOD_META   : 0) ;
	}

	/**
	 * 指定位置に存在するノードを探索する
	 *
	 * @param pt 指定位置
	 * @returns 指定位置に存在するノード。また、副次的ptは返却するノードの座標系に変更される
	 */
	private getMouseTarget(pt:Rect):UiNode {
		let page:LivePage|null = this.getLivePage();
		let node:UiNode;
		if (page == null) {
			node = this.rootNode;
		} else if (this._captureNode == null) {
			node = this.rootNode;
			let child:UiNode|null = page.pageNode;
			while (child != null) {
				node = child;
				node.translate(pt, -1);
				child = node.getVisibleChildAt(pt.x, pt.y);
			}
		} else {
			let curr:UiNode|null = this._captureNode;
			while (curr != null) {
				curr.translate(pt, -1);
				curr = curr.parent;
			}
			node = this._captureNode;
		}
		return node;
	}

	private processResize(evt:UIEvent):void {
		try {
			let result:UiResult = UiResult.IGNORED;
			Logs.info("TODO resize");
			//後処理
			this.postProcessEvent(evt, result);
		} finally {
			this.flushFinally();
		}
	}

	private processHashChanged():void {
		try {
			let hash = decodeURIComponent(window.location.hash);
			let index = hash.indexOf(':');
			let tag;
			let args:Properties<string>;
			if (hash == "") {
				tag = "";
				args = {};
			} else if (index == -1) {
				tag = hash;
				args = {};
			} else {
				tag = hash.substring(0, index);
				args = this.decodeArguments(hash.substring(index + 1));
			}
			let result = this.transit(tag, args);
			//後処理
			this.postProcessEvent(null, result);
		} finally {
			this.flushFinally();
		}
	}

	private decodeArguments(str:string):Properties<string> {
		let result: Properties<string> = {};
		for (let param of str.split("&")) {
			let pair = param.split('=');
			if (pair.length == 1) {
				let key = param;
				result[key] = "";
			} else {
				let key = pair[0];
				let value = pair[1];
				result[key] = value;
			}
		}
		return result;
	}

	public processDataSourceChanged(ds:DataSource):void {
		Logs.info("processDataSourceChanged");
		try {
			let result:UiResult = UiResult.IGNORED;
			for (const [tag, entry] of Object.entries(this._dataSources)) {
				if (entry !== undefined) {
					if (ds == entry.dataSource) {
						result |= entry.onDataSourceChanged();
					}
				}
			}
			//後処理
			this.postProcessEvent(null, result);
		} finally {
			this.flushFinally();
		}
	}

	private postProcessEvent(evt:Event|null, result:UiResult):void {
		result |= this.recoverFocus();
		if (result & UiResult.AFFECTED) {
			this.sync();
		}
		if (result & UiResult.CONSUMED) {
			if (evt != null) {
				evt.preventDefault();
			}
		}
	}

	protected onKeyDown(target:UiNode, key:number, ch:number, mod:number, at:number):UiResult {
		let result:UiResult = UiResult.IGNORED;
		let tRect = target.getRectOnRoot();
		let next:UiNode|null = null;
		let axis = UiAxis.NONE;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
		case KeyCodes.LEFT:
			next = this.getNearestNode(target, c => c.getRectOnRoot().right <= tRect.left);
			axis = UiAxis.X;
			break;
		case KeyCodes.RIGHT:
			next = this.getNearestNode(target, c => c.getRectOnRoot().left >= tRect.right);
			axis = UiAxis.X;
			break;
		case KeyCodes.UP:
			next = this.getNearestNode(target, c => c.getRectOnRoot().bottom <= tRect.top);
			axis = UiAxis.Y;
			break;
		case KeyCodes.DOWN:
			next = this.getNearestNode(target, c => c.getRectOnRoot().top >= tRect.bottom);
			axis = UiAxis.Y;
			break;
		case KeyCodes.TAB:
			next = this.getAdjacentNode(target, +1);
			axis = UiAxis.XY;
			result |= UiResult.CONSUMED;
			break;
		case KeyCodes.TAB|KeyCodes.MOD_SHIFT:
			next = this.getAdjacentNode(target, -1);
			axis = UiAxis.XY;
			result |= UiResult.CONSUMED;
			break;
		case KeyCodes.ENTER:
			result |= (this.getLivePageOf(target) as LivePage).click(target);
			break;
		case KeyCodes.KEY_Q|KeyCodes.MOD_CTRL:
			//debug print
			let met = Metrics.getInstance();
			Logs.debug("emSize %d exSize %d inSize %d", met.emSize, met.exSize, met.inSize);
			let nodes = this.rootNode.getDescendantsIf(() => true);
			for (let node of nodes) {
				let rect = node.getRect();
				let dom = node.domElement;
				Logs.debug("%s rect %4d,%4d,%4d,%4d", node.name,
					rect.x, rect.y, rect.width, rect.height);
				if (dom != null) {
					Logs.debug("%s dom  %4d,%4d,%4d,%4d", node.name,
						dom.offsetLeft, dom.offsetTop, dom.offsetWidth, dom.offsetHeight);
				}
			}
		default:
			break;
		}
		if (next != null) {
			result |= this.scrollFor(next);
			result |= this.setFocus(next, axis);
		}
		return result;
	}

	public scrollFor(node:UiNode):UiResult {
		let result = UiResult.IGNORED;
		let target = node;
		let parent = node.parent;
		while (parent != null) {
			result |= parent.scrollFor(target);
			target = parent;
			parent = target.parent;
		}
		return result;
	}

	protected onKeyPress(target:UiNode, key:number, ch:number, mod:number, at:number):UiResult {
		let result = UiResult.IGNORED;
		return result;
	}

	protected onKeyUp(target:UiNode, key:number, ch:number, mod:number, at:number):UiResult {
		let result = UiResult.IGNORED;
		switch (key|(mod & KeyCodes.MOD_ACS)) {
			case KeyCodes.ENTER:
			result |= (this.getLivePageOf(target) as LivePage).click(null);
			break;
		}
		return result;
	}

	protected getNearestNode(curr:UiNode, filter:(c:UiNode)=>boolean):UiNode|null {
		let page = this.getLivePageOf(curr) as LivePage;
		let next:UiNode|null = null;
		let minDegree = 0;
		let minDistance = 0;
		let candidates = page.pageNode.getVisibleDescendantsIf((c) => {
			if (!(c != curr && this.isFocusable(c) && filter(c))) {
				return false;
			}
			let blocker = c.getBlockerNode();
			let luca = c.getLucaNodeWith(curr);
			return (blocker == null || blocker == luca || blocker.isAncestorOf(luca));
		});
		for (let c of candidates) {
			let luca = c.getLucaNodeWith(curr);
			let degree:number = curr.getDegree(luca);
			let cRect = c.getRectOnRoot();
			let distance = cRect.distance(page.xAxis, page.yAxis);
			if (next == null || degree < minDegree ||
				(degree == minDegree && distance < minDistance)) {
				next = c;
				minDegree = degree;
				minDistance = distance;
			}
		}
		return next;
	}

	protected getAdjacentNode(curr:UiNode, dir:number):UiNode|null {
		let page = this.getLivePageOf(curr) as LivePage;
		let candidates = page.pageNode.getVisibleDescendantsIf((c) => {
			if (!this.isFocusable(c)) {
				return false;
			}
			let blocker = c.getBlockerNode();
			let luca = c.getLucaNodeWith(curr);
			return (blocker == null || blocker == luca || blocker.isAncestorOf(luca));
		});
		let index = candidates.indexOf(curr);
		let n = candidates.length;
		return index == -1 ? null : candidates[(index + dir + n) % n];
	}

	protected onMouseMove(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	protected onMouseDown(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	protected onMouseUp(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	protected onMouseClick(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		let result = UiResult.IGNORED;
		if (this.isFocusable(target)) {
			this.setFocus(target, UiAxis.XY);
			result |= UiResult.AFFECTED;
		}
		return result;
	}

	protected onMouseDoubleClick(target:UiNode, x:number, y:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

	protected onMouseWheel(target:UiNode, x:number, y:number, dx:number, dy:number, mod:number, at:number):UiResult {
		return UiResult.IGNORED;
	}

}
