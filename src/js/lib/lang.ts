import { ParamError, StateError, LogicalError, UnsupportedError } from '~/lib/lang/Error';
export { ParamError, StateError, LogicalError, UnsupportedError };

import { Asserts } from '~/lib/lang/Asserts';
export { Asserts };

import { Types } from '~/lib/lang/Types';
export { Types };

import { Strings } from '~/lib/lang/Strings';
export { Strings };

import { Formatter } from '~/lib/lang/Formatter';
export { Formatter };

import { Arrays } from '~/lib/lang/Arrays';
export { Arrays };

import { Dates } from '~/lib/lang/Dates';
export { Dates };

import { Logs } from '~/lib/lang/Logs';
export { Logs };

//TODO Date(とBigIntも？)をValue型の一部として認めるべき？
export type Value = string | number | boolean | null;

export interface Properties<T> {
  [prop: string]: T | undefined;
}

export interface Clonable<T extends Clonable<T>> {
  clone(): T;
}

export type Predicate<T> = (arg: T) => boolean;
export type Function<T, U> = (arg: T) => U;
