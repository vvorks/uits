import { Properties, Value } from '~/lib/lang';
import type { UiApplication } from '~/lib/ui/UiApplication';
import { KeyProvider, SimpleKeyProvider } from './KeyProvider';

export type DataRecord = Properties<Value | DataRecord>;

/**
 * データアクセスを実現する（抽象）クラス
 */
export abstract class DataSource {
  public static readonly DEFAULT_KEY_PROVIDER = new SimpleKeyProvider('key');

  /**
   * 通知先アプリケーションリスト
   */
  private _applications: UiApplication[];

  /**
   * キープロバイダ
   */
  private _keyProvider: KeyProvider;

  protected constructor(keyProvider: KeyProvider = DataSource.DEFAULT_KEY_PROVIDER) {
    this._applications = [];
    this._keyProvider = keyProvider;
  }

  /**
   * 通知先アプリケーションを登録する
   *
   * @param app アプリケーション
   */
  public addApplication(app: UiApplication): void {
    this._applications.push(app);
  }

  /**
   * 通知先アプリケーションを登録解除する
   *
   * @param app アプリケーション
   */
  public removeAppliation(app: UiApplication): void {
    let index = this._applications.indexOf(app);
    if (index >= 0) {
      this._applications.splice(index, 1);
    }
  }

  /**
   * データ更新通知を発行する
   */
  protected fireDataChanged() {
    for (let app of this._applications) {
      app.processDataSourceChanged(this);
    }
  }

  protected get applications(): UiApplication[] {
    return this._applications;
  }

  /**
   * DataSourceが保持する全てのDataRecordの最終更新時刻の最大値を返す
   * DataSourceの利用者はlastUpdateAt値を監視し、
   * 変化があった場合には全データを再取得する必要がある
   */
  public abstract lastUpdateAt(): Date;

  /**
   * DataSourceが保持するDataRecordの検索条件を返す
   */
  public abstract criteria(): Properties<Value>;

  /**
   * DataSourceが保持するDataRecordの件数を返す
   *
   * 通常は０以上の数値を返すが、データ読み込みが完了していない場合、-1を返す
   * その場合、DataSourceの利用者は完了通知を受領後に再取得を行う事
   */
  public abstract count(): number;

  /**
   * このデータソースが特定のデータ範囲のみを保持している場合、その先頭の位置を示す
   * （データ全体を保持している場合には０となる）
   * データ読み込みが完了していない場合、-1を返す
   */
  public abstract offset(): number;

  /**
   * このデータソースが特定のデータ範囲のみを保持している場合、その先頭の位置(offset)からの保持件数を示す
   * （データ全体を保持している場合にはcount()の結果と等しくなる）
   * データ読み込みが完了していない場合、-1を返す
   */
  public abstract limit(): number;

  /**
   * 検索時に指定された条件に基づき、最も適した値の位置を返す。
   * 検索直後にoffset/limitがある場合、その範囲中のいずれかとなる事を保証する
   * データ読み込みが完了していない場合、-1を返す
   */
  public abstract attention(): number;

  /**
   * DataSourceの指定位置のDataRecordを返す
   *
   * 通常は非nullのDataRecordを返すが、データ読み込みが完了していない場合、nullを返す
   * その場合、DataSourceの利用者は完了通知を受領後に再取得を行う事
   *
   * @param index DataRecord位置
   */
  public abstract getRecord(index: number): DataRecord | null;

  /**
   * データ読み込みを（再)実行する。
   *
   * このAPI呼び出しがデータ読み込み指示となるので検索条件が無指定でも必ず呼び出す事
   *
   * @param criteria 検索条件
   */
  public abstract select(criteria: Properties<Value>): void;

  /**
   * データを挿入する
   *
   * @param rec 挿入するデータ
   */
  public abstract insert(rec: DataRecord): void;

  /**
   * データを更新する
   *
   * @param rec 更新するデータ
   */
  public abstract update(rec: DataRecord): void;

  /**
   * データを削除する
   *
   * @param rec 削除するデータ
   */
  public abstract remove(rec: DataRecord): void;

  public getKeyOf(rec: DataRecord): string {
    return this._keyProvider.getKey(rec);
  }
}
