import type { UiApplication } from './UiApplication';
import { Value } from '../lang';
import { DataRecord } from './DataSource';
import { RecordHolder } from './RecordHolder';
import { UiScrollNode, UiScrollNodeSetter } from './UiScrollNode';
import { HasSetter } from './UiBuilder';

export class UiFormNodeSetter extends UiScrollNodeSetter {
  public static readonly INSTANCE = new UiFormNodeSetter();
  public record(rec: DataRecord): this {
    let node = this.node as UiFormNode;
    node.setRecord(rec);
    return this;
  }
}

export class UiFormNode extends UiScrollNode implements RecordHolder, HasSetter<UiFormNodeSetter> {
  /** 本ノードが持つ唯一のデータレコード */
  private _record: DataRecord | null;

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
    } else {
      super(param as UiApplication, name as string);
      this._record = null;
    }
  }

  public getSetter(): UiFormNodeSetter {
    return UiFormNodeSetter.INSTANCE;
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
      this.doAction(this._record);
    }
  }

  protected doAction(rec: DataRecord): void {
    if (this.mounted) {
      for (let c of this.getDescendants()) {
        c.onRecordHolderChanged(this);
      }
      this.fireActionEvent('update', rec);
    }
  }

  protected afterMount() {
    for (let c of this.getDescendants()) {
      c.onRecordHolderChanged(this);
    }
  }
}
