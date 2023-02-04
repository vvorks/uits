import { Value } from '~/lib/lang';
import { DataRecord } from '~/lib/ui/DataSource';

export interface RecordHolder {
  getValue(name: string): Value | DataRecord | null;

  setValue(name: string, value: Value | DataRecord | null): void;

  getRecord(): DataRecord | null;

  setRecord(rec: DataRecord): void;
}
