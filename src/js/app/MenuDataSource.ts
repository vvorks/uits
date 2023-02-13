import { Asserts, Properties, UnsupportedError, Value } from '~/lib/lang';
import { DataRecord, DataSource } from '~/lib/ui';

const MENU_DATA: Properties<DataRecord[]> = {
  '/': [
    { template: 'leaf', type: 'launch', content: '#search', title: '検索' },
    { template: 'node', type: 'branch', submenu: '/category', title: 'カテゴリ' },
    { template: 'void', type: 'filler' },
    { template: 'leaf', type: 'launch', content: '#live', title: 'ライブ' },
    { template: 'leaf', type: 'launch', content: '#settings', title: '設定' },
  ],
  '/category': [
    { template: 'leaf', type: 'launch', content: '#content:category=movie', title: '映画' },
    { template: 'leaf', type: 'launch', content: '#content:category=story', title: 'ドラマ' },
    { template: 'leaf', type: 'launch', content: '#content:category=music', title: '音楽' },
    { template: 'leaf', type: 'launch', content: '#content:category=news', title: 'ニュース' },
    {
      template: 'leaf',
      type: 'launch',
      content: '#content:category=documentary',
      title: 'ドキュメンタリー',
    },
  ],
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

  public offset(): number {
    return 0;
  }

  public limit(): number {
    return this.count();
  }

  public attention(): number {
    return 0;
  }

  public getRecord(index: number): DataRecord | null {
    Asserts.require(0 <= index && index < this.count());
    return this._currentRecs[index];
  }

  public select(criteria: Properties<Value>): void {
    window.setTimeout(() => this.reload(criteria));
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
