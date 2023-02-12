import { Asserts, Properties, Value } from '~/lib/lang';
import { DataRecord, DataSource } from '~/lib/ui';

export class TestDataSource extends DataSource {
  private _lastUpdateAt: Date;

  private _records: DataRecord[];

  private _loader: (criteria: Properties<Value>) => DataRecord[];

  private _loaded: boolean;

  private _criteria: Properties<Value>;

  private _key: string;

  public constructor(loader: (criteria: Properties<Value>) => DataRecord[]) {
    super();
    this._lastUpdateAt = new Date();
    this._records = [];
    this._loader = loader;
    this._loaded = false;
    this._key = '';
    this._criteria = {};
  }

  public lastUpdateAt(): Date {
    return this._lastUpdateAt;
  }

  public criteria(): Properties<Value> {
    return this._criteria;
  }

  public count(): number {
    if (!this._loaded) {
      return -1;
    }
    return this._records.length;
  }

  public offset(): number {
    if (!this._loaded) {
      return -1;
    }
    return 0;
  }

  public limit(): number {
    if (!this._loaded) {
      return -1;
    }
    return this._records.length;
  }

  public attention(): number {
    if (!this._loaded) {
      return -1;
    }
    for (let i = 0; i < this._records.length; i++) {
      let rec = this._records[i];
      if (rec['key'] == this._key) {
        return i;
      }
    }
    return 0;
  }

  public getRecord(index: number): DataRecord | null {
    if (!this._loaded) {
      return null;
    }
    Asserts.require(0 <= index && index < this.count());
    let result = this._records[index];
    result['_index_'] = index;
    return result;
  }

  public select(criteria: Properties<Value>): void {
    this._loaded = false;
    this.simulateLoad1(criteria);
  }

  public insert(rec: DataRecord): void {
    this._records.push(rec);
    super.fireDataChanged();
  }

  public update(rec: DataRecord): void {
    let index = rec['_index_'] as number;
    this._records[index] = rec;
    super.fireDataChanged();
  }

  public remove(rec: DataRecord): void {
    let index = rec['_index_'] as number;
    this._records.splice(index, 0);
    super.fireDataChanged();
  }

  private simulateLoad1(criteria: Properties<Value>): void {
    window.setTimeout(() => this.simulateLoad2(criteria), 0);
  }

  private simulateLoad2(criteria: Properties<Value>): void {
    this._records = this._loader(criteria);
    this._criteria = criteria;
    this._key = criteria['key'] as string;
    this._loaded = true;
    super.fireDataChanged();
  }
}
