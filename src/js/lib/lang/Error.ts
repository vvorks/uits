/**
 * パラメータエラー
 */
export class ParamError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 状態エラー
 */
export class StateError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 論理エラー
 */
export class LogicalError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 入出力エラー
 */
export class IOError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * ネットワークエラー
 */
export class NetworkError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 未サポートエラー
 */
export class UnsupportedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
