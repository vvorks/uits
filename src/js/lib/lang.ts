import {ParamError, StateError, LogicalError, UnsupportedError} from "./lang/Error";
export {ParamError, StateError, LogicalError, UnsupportedError}

import {Asserts} from "./lang/Asserts";
export {Asserts};

import {Types} from "./lang/Types";
export {Types};

import {Strings} from "./lang/Strings";
export {Strings};

import {Formatter} from "./lang/Formatter";
export {Formatter};

import {Arrays} from "./lang/Arrays";
export {Arrays};

import {Dates} from "./lang/Dates";
export {Dates}

import {Logs} from "./lang/Logs";
export {Logs}

export type Value = string|number|boolean|null; //TODO Date(とBigIntも？)をValue型の一部として認めるべき？

export interface Properties<T> {
	[prop: string]: T|undefined;
}

export interface Clonable<T extends Clonable<T>> {
	clone():T;
}

export type Predicate<T> = (arg:T) => boolean;
export type Function<T, U> = (arg:T) => U;
