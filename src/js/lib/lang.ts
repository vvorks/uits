import {ParamError, StateError, LogicalError} from "./lang/Error";
export {ParamError, StateError, LogicalError}

import {Asserts} from "./lang/Asserts";
export {Asserts};

import {Types} from "./lang/Types";
export {Types};

import {Logs} from "./lang/Logs";
export {Logs}

export interface Properties<T> {
	[prop: string]: T;
}

export interface Clonable<T extends Clonable<T>> {
	clone():T;
}
