import { Value } from '../lang';
import { DataRecord } from './DataSource';
import { RecordHolder } from './RecordHolder';
import type { UiApplication } from './UiApplication';
import { UiNode, UiNodeSetter } from './UiNode';

export class UiFormNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiFormNodeSetter();
  public record(rec: DataRecord): this {
    let node = this.node as UiFormNode;
    node.setInitialRecord(rec);
    return this;
  }
}

export class UiFormNode extends UiNode implements RecordHolder {
  /** 本ノードが持つ唯一のデータレコード */
  private _record: DataRecord | null;
  /** 共有名一覧 */
  private _sharedNames: Set<string>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiFormNode {
    return new UiFormNode(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string);
  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiFormNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiFormNode) {
      super(param as UiFormNode);
      let src = param as UiFormNode;
      this._record = src._record;
      this._sharedNames = src._sharedNames;
    } else {
      super(param as UiApplication, name as string);
      this._record = null;
      this._sharedNames = new Set<string>();
    }
  }

  protected initialize(): void {
    this.collectSharedNames(this._sharedNames);
  }

  private collectSharedNames(sharedNames: Set<string>): Set<string> {
    let names = new Set<string>();
    for (let t of this.getDescendants()) {
      let name = t.name;
      if (names.has(name)) {
        sharedNames.add(name);
      } else {
        names.add(name);
      }
    }
    return sharedNames;
  }

  public getRecord(): DataRecord | null {
    return this._record;
  }

  public setRecord(rec: DataRecord | null): void {
    this._record = rec;
    if (this._record != null) {
      this.doAction(this._record);
    }
  }

  public setInitialRecord(rec: DataRecord): void {
    this._record = rec;
  }

  public getValue(name: string): DataRecord | Value {
    if (this._record == null) {
      return null;
    }
    let value = this._record[name];
    return value === undefined ? null : value;
  }

  public setValue(name: string, value: DataRecord | Value): void {
    if (this._record == null) {
      return;
    }
    if (this._record[name] != value) {
      this._record[name] = value;
      if (this._sharedNames.has(name)) {
        for (let c of this.getDescendantsIf((e) => e.dataFieldName == name)) {
          c.onRecordHolderChanged(this);
        }
      }
    }
    this.doAction(this._record);
  }

  protected doAction(rec: DataRecord): void {
    this.fireActionEvent('update', rec);
  }
}
