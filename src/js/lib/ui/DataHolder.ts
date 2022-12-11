import { Value } from "../lang";

export interface DataHolder {

	getValue(name:string):Value|null;

	setValue(name:string, value:Value|null):void;

}