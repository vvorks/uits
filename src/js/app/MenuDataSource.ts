import
	{ ParamError, Properties, UnsupportedError, Value }
	from "~/lib/lang";
import
	{ DataRecord, DataSource }
	from "~/lib/ui";

const MENU_DATA:Properties<DataRecord[]> = {
	"/": [
		{template:"leaf", content:"#search",	title:"検索"},
		{template:"node", submenu:"/category",	title:"カテゴリ"},
		{template:"leaf", content:"#live",		title:"ライブ"},
		{template:"leaf", content:"#settings",	title:"設定"},
	],
	"/category": [
		{template:"leaf", content:"#content:category=movie",		title:"映画"},
		{template:"leaf", content:"#content:category=story",		title:"ドラマ"},
		{template:"leaf", content:"#content:category=music",		title:"音楽"},
		{template:"leaf", content:"#content:category=news",			title:"ニュース"},
		{template:"leaf", content:"#content:category=documentary",	title:"ドキュメンタリー"},
	]
};

export class MenuDataSource extends DataSource {

	private _criteria: Properties<Value> = {};

	private _currentRecs: DataRecord[] = [];

	public lastUpdateAt(): Date {
		return new Date(0);
	}

	public criteria(): Properties<Value> {
		return this._criteria;
	}

	public count(): number {
		return this._currentRecs.length;
	}

	public getRecord(index: number): DataRecord | null {
		if (!(0 <= index && index < this.count())) {
			throw new ParamError();
		}
		return this._currentRecs[index];
	}

	public select(criteria: Properties<Value>): void {
		window.setTimeout(()=>this.reload(criteria));
	}

	private reload(criteria: Properties<Value>) {
		this._criteria = criteria;
		let data = MENU_DATA[criteria.path as string];
		if (data !== undefined) {
			this._currentRecs = data;
		} else {
			this._currentRecs = [];
		}
		super.fireDataChanged();
	}

	public insert(rec: DataRecord): void {
		throw new UnsupportedError();
	}
	public update(rec: DataRecord): void {
		throw new UnsupportedError();
	}

	public remove(rec: DataRecord): void {
		throw new UnsupportedError();
	}

}