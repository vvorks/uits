import { Value } from "../lang";
import { DataRecord } from "./DataSource";

export interface DataHolder {

	getValue(name:string):Value|DataRecord|null;

	setValue(name:string, value:Value|DataRecord|null):void;

	getRecord():DataRecord|null;

	setReocord(rec:DataRecord):void;

}