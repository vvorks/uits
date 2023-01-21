import
	{ Properties }
	from "~/lib/lang";
import
	{ UiAxis, DataSource, UiImageField, UiListNode, UiNode, UiNodeBuilder, UiPageNode, UiPane, UiDock, UiResult, UiTextField, UiTextButton, UiTextNode }
	from "~/lib/ui";
import
	{ DEFAULT_STYLE, GROUP_STYLE, IMAGE_STYLE, LIST_STYLE }
	from "~/app/TestApplication";

export class PaneTestPage extends UiPageNode {

	protected initialize():void {
		let app = this.application;
		//ページ全体の指定
		let b = new UiNodeBuilder(this, "1rem").style(GROUP_STYLE).inset(1);
		//ドックの設定
		let left1 = new UiPane(app, "left1");
		let left2 = new UiPane(app, "left2");
		b.enter(new UiDock(app, "dock")).style(GROUP_STYLE).inset(1).listen((src, act)=>this.watchDock(src, act));
		{
			//左ペイン
			b.enter(left1).style(DEFAULT_STYLE).location("left").flexSize(4, 20);
			for (let i = 0; i < 3; i++) {
				//メニュー項目
				b.enter(new UiTextButton(app, "text"+i)).style(DEFAULT_STYLE)
					.lr(1,1).th(i*3+1, 2).focusable(true).textContent("メニュー"+i)
					.listen((src, act)=>this.watchTextButton(src, act))
					//.nextFocusFilter((e)=> (e.parent == left1 || e.parent == left2))
					;
				b.leave();
			}
			b.leave();
			//左２ペイン（サブメニューペイン）
			b.enter(left2).style(DEFAULT_STYLE).location("left").flexSize(0, 16);
			b.leave();
			//中央ペイン
			b.enter(new UiPane(app, "center")).style(DEFAULT_STYLE).location("center");
			{
				//背景画像用リスト
				b.enter(new UiListNode(app, "bglist")).inset(1).style(LIST_STYLE).dataSource("hokusai").vertical(false).loop(true);
					b.enter(new UiNode(app, "card")).inset(0);
						b.enter(new UiImageField(app, "e")).inset(0).style(IMAGE_STYLE).leave();
					b.leave();
				b.leave();
				//コンテンツ選択リスト
				b.enter(new UiListNode(app, "list")).bh(0, 4).lr(0,0).style(LIST_STYLE)
						.dataSource("hiroshige").vertical(false).loop(false).scrollLock(true);
					b.enter(new UiNode(app, "card")).tb(0, 0).lw(0, 8);
						b.enter(new UiTextField(app, "title")).inset(0).style(DEFAULT_STYLE).focusable(true).leave();
					b.leave();
				b.leave();
			}
			b.leave();
		}
		b.leave();
		//データソース検索開始
		(app.getDataSource("hokusai") as DataSource).select({});
		(app.getDataSource("hiroshige") as DataSource).select({});
		//自動ページめくり開始
		let interval = 3000 * 1;
		if (interval > 0) {
			app.runInterval(this, 1, interval, () => {
				let focus = app.getFocusOf(this);
				let center = this.findNodeByPath("dock/center") as UiNode;
				if (focus == null || !center.isAncestorOf(focus)) {
					return UiResult.CONSUMED;
				}
				let node = this.findNodeByPath("dock/center/bglist") as UiListNode;
				let result = UiResult.CONSUMED;
				if (node != null) {
					result |= node.scrollRecord(1);
				}
				return result;
			});
		}
	}

	public watchTextButton(src: UiNode, act:string): UiResult {
		let result = UiResult.IGNORED;
		if (act == "click") {
			//left2への要素追加
			let app = this.application;
			let pane = this.findNodeByPath("dock/left2") as UiPane;
			//念のため一旦クリア
			pane.removeChildren();
			//新項目追加
			let text = (src as UiTextButton).textContent;
			let b = new UiNodeBuilder(pane, "1rem");
			for (let i = 0; i < 3; i++) {
				//メニュー項目
				b.enter(new UiTextNode(app, "subtext"+i)).style(DEFAULT_STYLE)
					.lr(0,0).th(i*3+1, 2).focusable(true).textContent(text + " - " + i);
				b.leave();
			}
			//先頭にフォーカスをあてる
			let first = this.findNodeByPath("dock/left2/subtext0") as UiTextNode;
			app.setFocus(first);
			result = UiResult.EATEN;
		}
		return result;
	}

	public watchDock(src: UiNode, act:string): UiResult {
		let result = UiResult.IGNORED;
		if (act == "relocatePane") {
			let pane = this.findNodeByPath("dock/left2") as UiPane;
			if (!pane.isExpanded()) {
				//left2ペーンが閉じたら内容をクリア
				pane.removeChildren();
				result = UiResult.AFFECTED;
			}
		}
		return result;
	}

	protected resetFocus():void {
		let app = this.application;
		let node = this.findNodeByPath("dock/center/list") as UiNode;
		app.setFocus(node);
	}

}