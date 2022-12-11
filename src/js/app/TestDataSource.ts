import { Logs, ParamError, Properties, Value } from "../lib/lang";
import { DataRecord, DataSource } from "../lib/ui";

export class TestDataSource extends DataSource {

	private _lastUpdateAt: Date;

	private _records: DataRecord[];

	private _loaded:boolean;

	public constructor(records:DataRecord[]) {
		super();
		this._lastUpdateAt = new Date();
		this._records = records;
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
		return this._records[index];
	}

	public select(criteria:Properties<Value>):void {
		Logs.debug("select");
		this._loaded = false;
		this.simulateLoad1();
	}

	public insert(rec:DataRecord):void {
		//NOP
	}

	public update(rec:DataRecord):void {
		//NOP
	}

	public remove(rec:DataRecord):void {
		//NOP
	}

	private simulateLoad1():void {
		if (this.applications.length > 0) {
			this.applications[0].runAfter(1000, () => this.simulateLoad2());
		}
	}

	private simulateLoad2(): void {
		this._loaded = true;
		super.fireDataChanged();
	}

}