import { Asserts, Logs, ParamError, Properties, UnsupportedError, Value } from '../lang';
import { DataRecord, DataSource } from './DataSource';
import { KeyProvider, SimpleKeyProvider } from './KeyProvider';

/**
 * データ配列をDataSourceとして扱うクラス
 *
 * オブジェクト作成時、またはsetDataSet()メソッドでデータ配列を設定すると
 * そのデータを元にしたDataSource機能を実現する。
 * 設定するデータ配列の各レコードの同一性判定のため、
 * （１）データを特定するための"key"項目（文字列型）が各レコードに存在する
 * （２）データの同一性を判定するためのRecordComparatorをコンストラクタで指定する
 * の、いずれかの措置が必要である。
 */
export class LocalDataSource extends DataSource {
  private _loaded: boolean;

  private _dataSet: DataRecord[];

  private _lastUpdateAt: number;

  private _criteria: Properties<Value>;

  /**
   * 指定されたデータ配列からDataSourceを作成する
   *
   * @param records
   *  （初期）データ配列
   * @param comparator
   *  オプション、配列の各レコードに"key"フィールドが存在しない場合、別の手段で
   *  レコードの同一性を判定するヘルパー関数を指定する。
   */
  public constructor(
    records: DataRecord[],
    keyProvider: KeyProvider = DataSource.DEFAULT_KEY_PROVIDER
  ) {
    super(keyProvider);
    this._loaded = false;
    this._dataSet = records;
    for (let i = 0; i < records.length; i++) {
      records[i]['__index__'] = i;
    }
    this._lastUpdateAt = 0;
    this._criteria = {};
  }

  public getDataSet(): DataRecord[] {
    return this._dataSet;
  }

  public setDataSet(dataSet: DataRecord[]): void {
    this._dataSet = dataSet;
    this._lastUpdateAt = Date.now();
    if (this._loaded) {
      super.fireDataChanged();
    }
  }

  public lastUpdateAt(): Date {
    return new Date(this._lastUpdateAt);
  }

  public criteria(): Properties<Value> {
    return this._criteria;
  }

  public count(): number {
    if (!this._loaded) {
      return -1;
    }
    return this._dataSet.length;
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
    return this.count();
  }

  public attention(): number {
    if (!this._loaded) {
      return -1;
    }
    return this.indexOf(this._criteria);
  }

  public getRecord(index: number): DataRecord | null {
    if (!this._loaded) {
      return null;
    }
    if (!(0 <= index && index < this.count())) {
      throw new ParamError();
    }
    return this._dataSet[index];
  }

  public select(criteria: Properties<Value>): void {
    window.setTimeout(() => this.load(criteria), 0);
  }

  private load(criteria: Properties<Value>): void {
    this._criteria = criteria;
    this._lastUpdateAt = Date.now();
    this._loaded = true;
    super.fireDataChanged();
  }

  public insert(rec: DataRecord): void {
    Asserts.assume(this._loaded);
    let index = this.indexOf(rec);
    if (index == -1) {
      this._dataSet.push(rec);
      this._lastUpdateAt = Date.now();
      super.fireDataChanged();
    }
  }

  public update(rec: DataRecord): void {
    Asserts.assume(this._loaded);
    let index = this.indexOf(rec);
    if (index != -1) {
      Logs.debug(
        'index %d CUR %s NEW %s',
        index,
        JSON.stringify(this._dataSet[index]),
        JSON.stringify(rec)
      );
      this._dataSet[index] = rec;
      this._lastUpdateAt = Date.now();
      super.fireDataChanged();
    }
  }

  public remove(rec: DataRecord): void {
    Asserts.assume(this._loaded);
    let index = this.indexOf(rec);
    if (index != -1) {
      this._dataSet.splice(index, 1);
      this._lastUpdateAt = Date.now();
      super.fireDataChanged();
    }
  }

  private indexOf(rec: DataRecord): number {
    return this._dataSet.findIndex((e) => this.getKeyOf(e) == this.getKeyOf(rec));
  }
}
