import {ParamError, StateError, LogicalError} from "./lang/Error";
export {ParamError, StateError, LogicalError}

import {Asserts} from "./lang/Asserts";
export {Asserts};

import {Types} from "./lang/Types";
export {Types};

import {Logs} from "./lang/Logs";
export {Logs}

import { Properties as RawProperties } from "./lang/Properties";
export interface Properties<T> extends RawProperties<T> {}
