import {
  ParamError,
  StateError,
  LogicalError,
  IOError,
  NetworkError,
  UnsupportedError,
} from '~/lib/lang/Error';
export { ParamError, StateError, LogicalError, IOError, NetworkError, UnsupportedError };

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

import { Value as RawValue } from '~/lib/lang/Values';
export type Value = RawValue;

import { Values } from '~/lib/lang/Values';
export { Values };

export interface Properties<T> {
  [prop: string]: T | undefined;
}

export interface Clonable<T extends Clonable<T>> {
  clone(): T;
}

export type Predicate<T> = (arg: T) => boolean;
export type Function<T, U> = (arg: T) => U;

export function singleton<T>(func: () => T): () => T {
  return new (class {
    private obj: T | null = null;
    private realFunc: () => T = func;
    public doit: () => T = () => {
      if (this.obj == null) {
        this.obj = this.realFunc();
      }
      return this.obj;
    };
  })().doit;
}
