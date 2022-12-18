import { Logs, ParamError, Properties, Value } from "../lib/lang";
import { DataRecord, DataSource } from "../lib/ui";

export class TestDataSource extends DataSource {

	private _lastUpdateAt: Date;

	private _records: DataRecord[];

	private _loader:()=>DataRecord[];

	private _loaded:boolean;

	public constructor(loader:()=>DataRecord[]) {
		super();
		this._lastUpdateAt = new Date();
		this._records = [];
		this._loader = loader;
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
			this.applications[0].runAfter(0, () => this.simulateLoad2());
		}
	}

	private simulateLoad2(): void {
		this._records = this._loader();
		this._loaded = true;
		super.fireDataChanged();
	}

}