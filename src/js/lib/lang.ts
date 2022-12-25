import {ParamError, StateError, LogicalError, UnsupportedError} from "./lang/Error";
export {ParamError, StateError, LogicalError, UnsupportedError}

import {Asserts} from "./lang/Asserts";
export {Asserts};

import {Types} from "./lang/Types";
export {Types};

import {Strings} from "./lang/Strings";
export {Strings};

import {Arrays} from "./lang/Arrays";
export {Arrays};

import {Logs} from "./lang/Logs";
export {Logs}

export type Value = string|number|boolean|null;

export interface Properties<T> {
	[prop: string]: T|undefined;
}

export interface Clonable<T extends Clonable<T>> {
	clone():T;
}
