import { Logs, ParamError, Properties, Value } from "../lib/lang";
import { DataRecord, DataSource } from "../lib/ui";

const LONG_NAME_JA =
	"寿限無寿限無五劫のすりきれ海砂利水魚の水行末雲来末風来末食う寝るところに住むところ" +
	"やぶらこうじのぶらこうじパイポパイポパイポのシューリンガンシューリンガンのグーリンダイ" +
	"グーリンダイのポンポコピーのポンポコナの長久命の長助";

const LONG_NAME_ES =
	"Pablo Diego José Francisco de Paula Juan Nepomuceno Cipriano de la Santísima Trinidad Ruiz y Picasso";

export class TestDataSource extends DataSource {

	private _lastUpdateAt: Date;

	private _records: DataRecord[];

	private _loaded:boolean;

	public constructor() {
		super();
		this._lastUpdateAt = new Date();
		this._records = [];
		this._loaded = false;
	}

	public lastUpdateAt(): Date {
		return this._lastUpdateAt;
	}

	public count():number {
		if (!this._loaded) {
			return -1;
		}
		return this._records.length;
	}

	public getRecord(index:number):DataRecord|null {
		if (!(0 <= index && index < this.count())) {
			throw new ParamError();
		}
		if (!this._loaded) {
			return null;
		}
		let result = this._records[index];
		result["_index_"] = index;
		return result;
	}

	public select(criteria:Properties<Value>):void {
		this._loaded = false;
		this.simulateLoad1();
	}

	public insert(rec:DataRecord):void {
		this._records.push(rec);
		super.fireDataChanged();
	}

	public update(rec:DataRecord):void {
		let index = rec["_index_"] as number;
		this._records[index] = rec;
		super.fireDataChanged();
	}

	public remove(rec:DataRecord):void {
		let index = rec["_index_"] as number;
		this._records.splice(index, 0);
		super.fireDataChanged();
	}

	private simulateLoad1():void {
		if (this.applications.length > 0) {
			this.applications[0].runAfter(1000, () => this.simulateLoad2());
		}
	}

	private _datas:number[] = [40, 4, 14, 2, 30];
	private _pos: number = 0;

	private simulateLoad2(): void {
		let theData: DataRecord[] = [];
		for (let i = 0; i < this._datas[this._pos]; i++) {
			theData.push({
				"a": i,
				"b": i * 2,
				"c": i * 3,
				"d": (i % 2) == 0 ? LONG_NAME_JA : LONG_NAME_ES,
				"e": false
			});
		}
		this._pos = (this._pos + 1) % this._datas.length;
		this._records = theData;
		this._loaded = true;
		super.fireDataChanged();
	}

}