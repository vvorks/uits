import { DataRecord } from './DataSource';

export interface KeyProvider {
  getKey(rec: DataRecord): string;
}

export class SimpleKeyProvider implements KeyProvider {
  private _keyNames: string[];

  public constructor(...keyNames: string[]) {
    this._keyNames = keyNames;
  }

  public getKey(rec: DataRecord): string {
    let b = '';
    let sep = '';
    for (let k of this._keyNames) {
      b += sep;
      b += rec[k];
      sep = ',';
    }
    return b;
  }
}
