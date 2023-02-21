export class CacheMap<K, V> {
  private _maxEntries: number;

  private _values: Map<K, V> = new Map<K, V>();

  public constructor(maxEntries: number) {
    this._maxEntries = maxEntries;
  }

  public get(key: K): V | undefined {
    const hasKey = this._values.has(key);
    let entry: V | undefined;
    if (hasKey) {
      entry = this._values.get(key);
      this._values.delete(key);
      this._values.set(key, entry as V);
    }
    return entry;
  }

  public put(key: K, value: V): void {
    if (this._values.size >= this._maxEntries) {
      const keyToDelete = this._values.keys().next().value as K;
      this._values.delete(keyToDelete);
    }
    this._values.set(key, value);
  }
}
