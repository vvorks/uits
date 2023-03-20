/** 期限付き項目 */
class LimitedEntry<V> {
  /** 有効期限 */
  private _limit: number;

  /** 値 */
  private _value: V;

  /**
   *  コンストラクタ
   *
   * @param value 値
   * @param limit 有効期限（EPOC時刻をミリ秒単位で指定）
   */
  public constructor(value: V, limit: number) {
    this._value = value;
    this._limit = limit;
  }

  /** 有効期限を取得 */
  public get limit(): number {
    return this._limit;
  }

  /** 値を取得 */
  public get value(): V {
    return this, this._value;
  }
}

/** 期限付き(LRU)キャッシュマップ */
export class LimitedCacheMap<K, V> {
  /** 値一覧 */
  private _values: Map<K, LimitedEntry<V>>;

  /** 項目数上限 */
  private _maxEntries: number;

  /**
   * コンストラクタ
   *
   * @param maxEntries
   */
  public constructor(maxEntries: number) {
    this._values = new Map<K, LimitedEntry<V>>();
    this._maxEntries = maxEntries;
  }

  /**
   * 値の存在状態を取得
   *
   * @param key キー
   * @returns 値が存在する場合、真
   */
  public has(key: K): boolean {
    return this._values.has(key);
  }

  /**
   * 値を取得
   *
   * @param key キー
   * @returns 値又はundefined
   */
  public get(key: K): V | undefined {
    if (!this._values.has(key)) {
      return undefined;
    }
    let entry = this._values.get(key) as LimitedEntry<V>;
    this._values.delete(key);
    this._values.set(key, entry);
    return entry.value;
  }

  /**
   * 有効期限が切れていない値を取得
   * @param key キー
   * @param time 指定した時間で有効期限判定　ミリ秒で指定　規定値は現在時間
   * @returns 値又はundefined
   */
  public getNotExpired(key: K, time: number = Date.now()): V | undefined {
    if (!this._values.has(key)) {
      return undefined;
    }
    let entry = this._values.get(key) as LimitedEntry<V>;
    this._values.delete(key);
    if (entry.limit < time) {
      return undefined;
    }
    this._values.set(key, entry);
    return entry.value;
  }

  /**
   * 項目を設定
   *
   * @param key キー
   * @param value 値
   * @param after 有効期限（現在時刻からの相対時刻をミリ秒単位で指定、既定値は5秒）
   */
  public put(key: K, value: V, after: number = 5 * 1000) {
    let now = Date.now();
    this.shrink(now);
    this._values.set(key, new LimitedEntry<V>(value, now + after));
  }

  private shrink(now: number) {
    if (this._values.size >= this._maxEntries) {
      let itr = this._values.keys();
      let next = itr.next();
      while (this._values.size >= this._maxEntries && !next.done) {
        let oldestKey = next.value;
        let oldestEntry = this._values.get(oldestKey) as LimitedEntry<V>;
        if (oldestEntry.limit >= now) {
          break;
        }
        this._values.delete(oldestKey);
      }
    }
  }
}
