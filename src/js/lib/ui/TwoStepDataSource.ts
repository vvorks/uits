import { Asserts, Properties, UnsupportedError, Value } from '~/lib/lang';
import { LimitedCacheMap } from '~/lib/util';
import { DataRecord, DataSource } from './DataSource';

/** デフォルトのブロック読み込みサイズ */
const DEFAULT_READ_BLOCK_SIZE = 50;

/** 想定データ処理時間／件 */
const ESTIMATED_PROC_TIME_PER_REC = 10;

/**
 * インデックス取得、値取得の二段階構成のデータ取得APIを想定したデータソース
 *
 * @param <K> キー型（ほとんどの場合、string）
 * @param <S> インデックス情報型
 * @param <V> 値情報型
 */
export abstract class TwoStepDataSource<
  K,
  S extends DataRecord,
  V extends DataRecord
> extends DataSource {
  /** 取新（インデックスリスト）取得時刻 */
  private _lastUpdateAt: number;

  /** インデックスリストを取得済みか否か */
  private _loaded: boolean;

  /** 検索条件 */
  private _criteria: Properties<Value>;

  /** インデックスリスト */
  private _indexes: S[];

  /** 値取得ブロックサイズ */
  private _readBlockSize: number;
  /**
   * 値を保持するキャッシュマップ
   */
  private _entries: LimitedCacheMap<K, V>;

  /**
   * コンストラクタ
   *
   * @param entries キャッシュマップ（複数のDataSource間でキャッシュを共有する事を想定）
   */
  public constructor(
    entries: LimitedCacheMap<K, V>,
    readBlockSize: number = DEFAULT_READ_BLOCK_SIZE
  ) {
    super();
    this._lastUpdateAt = 0;
    this._loaded = false;
    this._criteria = {};
    this._indexes = [];
    this._readBlockSize = readBlockSize;
    this._entries = entries;
  }

  /**
   * 最終更新時刻を取得する
   *
   * @returns 最終更新時刻
   */
  public lastUpdateAt(): Date {
    return new Date(this._lastUpdateAt);
  }

  /**
   * 検索条件を取得する
   *
   * @returns 最後に指定された検索条件
   */
  public criteria(): Properties<Value> {
    return this._criteria;
  }

  /**
   * 検索の結果、得られたデータの件数を返す
   *
   * @returns データ件数
   */
  public count(): number {
    if (!this._loaded) {
      return -1;
    }
    return this._indexes.length;
  }

  /**
   * データ取得開始位置を返す。
   *
   * 本実装が想定する検索方式上、このメソッドの値は意味を持たない。
   * したがって、常に０を返却する
   */
  public offset(): number {
    if (!this._loaded) {
      return -1;
    }
    return 0;
  }

  /**
   * （データ取得開始位置からの）データ取得済みの件数を返す。
   *
   * 本実装が想定する検索方式上、このメソッドの値は意味を持たない。
   * したがって、常にcount()と同じ値を返却する
   */
  public limit(): number {
    if (!this._loaded) {
      return -1;
    }
    return this._indexes.length;
  }

  /**
   * 注目位置を返す。
   *
   * 本実装が想定する検索方式上、このメソッドの値は意味を持たない。
   * したがって、常に０を返却する
   */
  public attention(): number {
    if (!this._loaded) {
      return -1;
    }
    return 0;
  }

  /**
   * 指定位置の値レコードを取得する
   *
   * その時点で値を保持していない場合、本メソッドはnullを返す。
   * その後、指定位置を含む値の取得処理を行い、取得完了後に取得通知を送信する。
   * 呼び出し元は、このメソッドでnullが返却された場合には、取得通知により再取得処理を行う事
   *
   * @param index インデックス
   * @returns 値レコード又はnull
   */
  public getRecord(index: number): V | null {
    if (!this._loaded) {
      return null;
    }
    Asserts.require(0 <= index && index < this._indexes.length);
    //指定位置の値取得を試みる
    let key: K = this.getKeyAt(index);
    let value: V | undefined = this._entries.get(key);
    if (value !== undefined) {
      //値がキャッシュ内にあれば、それを返却して終了
      return value;
    } else {
      //値の検索要求を発行
      this.prepareRecord(index);
      //この時点では一旦nullを返却
      return null;
    }
  }

  private async prepareRecord(index: number): Promise<void> {
    //指定位置近傍のキーリストを算出
    let requestKeys: Set<K> = new Set<K>();
    let count = this._indexes.length;
    let readCount = Math.min(this._readBlockSize, count);
    let readIndex = (index - Math.floor(readCount / 2) + count) % count;
    for (let i = 0; i < readCount; i++) {
      let readKey: K = this.getKeyAt(readIndex);
      if (!this._entries.has(readKey)) {
        requestKeys.add(readKey);
      }
      readIndex = (readIndex + 1) % count;
    }
    let keys: K[] = [];
    requestKeys.forEach((k) => keys.push(k));
    //値取得要求を発行
    let values: V[] = await this.requestValues(keys);
    //取得結果をキャッシュに格納
    let delay = values.length * ESTIMATED_PROC_TIME_PER_REC;
    for (let value of values) {
      let key = this.getKeyFromValue(value);
      this._entries.put(key, value, delay);
    }
    //データ更新通知を発行
    this.fireDataChanged();
  }

  /**
   * （非同期）検索要求
   *
   * @param criteria 検索条件
   */
  public select(criteria: Properties<Value>): void {
    this.requestIndexes(criteria).then((indexes) => {
      this._criteria = criteria;
      this._indexes = indexes;
      this._lastUpdateAt = Date.now();
      this._loaded = true;
      this.fireDataChanged();
    });
  }

  /**
   * データ挿入（未サポート）
   */
  public insert(rec: V): void {
    throw new UnsupportedError();
  }

  /**
   * データ更新（未サポート）
   */
  public update(rec: V): void {
    throw new UnsupportedError();
  }

  /**
   * データ削除（未サポート）
   */
  public remove(rec: V): void {
    throw new UnsupportedError();
  }

  /**
   * 指定インデックス位置のキーを取得
   *
   * @param index インデックス
   * @returns キー
   */
  private getKeyAt(index: number): K {
    let indexRec: S = this._indexes[index];
    let key: K = this.getKeyFromIndex(indexRec);
    return key;
  }

  /**
   * インデックスレコードからキー値を取得する
   *
   * @param indexRec インデックスレコード
   * @return キー値
   */
  protected abstract getKeyFromIndex(indexRec: S): K;

  /**
   * 値レコードからキー値を取得する
   *
   * @param valueRec 値レコード
   * @return キー値
   */
  protected abstract getKeyFromValue(valueRec: V): K;

  /**
   * （非同期）検索条件に合致するインデックスレコードリストを取得する
   *
   * @param criteria 検索条件
   * @returns インデックスレコードリストを返却するPromiseオブジェクト
   */
  protected abstract requestIndexes(criteria: Properties<Value>): Promise<S[]>;

  /**
   * （非同期）キーリストが示すキーを持つ値レコードリストを取得する
   *
   * @param keys キーリスト
   * @returns 値レコードリストを返却するPromiseオブジェクト
   */
  protected abstract requestValues(keys: K[]): Promise<V[]>;
}
