import { KeyProvider, SimpleKeyProvider } from './KeyProvider';
import { Logs, Properties, Value } from '~/lib/lang';
import type { UiApplication } from '~/lib/ui/UiApplication';

export type DataRecord = Properties<Value | DataRecord>;

enum Flags {
  NONE = 0,
  LAZY = 1,
}

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
   * 動作条件フラグ
   */
  private _flags: Flags;

  /**
   * キープロバイダ
   */
  private _keyProvider: KeyProvider;

  private _errorCode: number;

  protected constructor(keyProvider: KeyProvider = DataSource.DEFAULT_KEY_PROVIDER) {
    this._applications = [];
    this._flags = Flags.NONE;
    this._keyProvider = keyProvider;
    this._errorCode = 0;
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

  /**誰からもアタッチされていない状態でアタッチされたときに呼ばれる */
  public attach() {}

  /**誰からもアタッチされなくなった時に呼ばれる */
  public detach() {
    this.doCancel();
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
   * lazyモードの取得
   */
  public get lazy(): boolean {
    return this.getFlags(Flags.LAZY);
  }

  /**
   * lazyモードの設定
   */
  public set lazy(on: boolean) {
    this.setFlags(Flags.LAZY, on);
  }

  /**
   * lazyモードの時、実検索処理をスタートさせる。
   */
  public wake(): void {}

  protected getFlags(bits: Flags): boolean {
    return !!(this._flags & bits);
  }

  protected setFlags(bit: Flags, on: boolean): void {
    if (on) {
      this._flags |= bit;
    } else {
      this._flags &= ~bit;
    }
  }

  public hasError(): boolean {
    return this._errorCode != 0;
  }

  protected clearError(): void {
    this._errorCode = 0;
  }

  public getErrorCode(): number {
    return this._errorCode;
  }

  protected setErrorCode(errorCode: number): void {
    this._errorCode = errorCode;
  }

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

  private doCancel() {
  }
}
