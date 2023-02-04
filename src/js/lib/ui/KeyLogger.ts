import { Asserts, Logs } from '../lang';

/** バッファ容量既定値 */
const DEFAULT_CAPACITY = 16;

/**
 * キーシーケンス項目
 */
interface KeySequenceItem {
  /** キーコード */
  keyCode: number;
  /** 押下時間 */
  elapsedTime: number;
}

/**
 * キーシーケンス
 */
export interface KeySequence {
  /** キーシーケンス名（オプション） */
  name?: string;
  /** キーシーケンス項目の並び */
  sequence: KeySequenceItem[];
}

/**
 * キー履歴
 */
interface KeyHistory {
  /** キーコード*/
  keyCode: number;

  /** 打鍵時刻 */
  pressAt: number;

  /** 離鍵離鍵 */
  releaseAt: number;
}

/**
 * キーロガー
 */
export class KeyLogger {
  /** 履歴バッファ容量 */
  private _capacity: number;
  /** キー履歴バッファ */
  private _buffer: KeyHistory[];

  /**
   * コンストラクタ
   *
   * @param capacity 初期容量（既定値：16）
   */
  public constructor(capacity: number = DEFAULT_CAPACITY) {
    Asserts.require(capacity > 1);
    this._capacity = capacity;
    this._buffer = [];
  }

  /**
   * バッファ容量を取得する
   */
  public get capacity(): number {
    return this._capacity;
  }

  /**
   * バッファ容量を設定する
   */
  public set capacity(capacity: number) {
    this._capacity = capacity;
  }

  /**
   * 打鍵を記録する
   *
   * @param keyCode キーコード
   * @param at イベント発生時刻
   */
  public logKeyDown(keyCode: number, at: number): void {
    // prepare process
    let n = this._buffer.length;
    // skip repeat
    for (let i = n - 1; i >= 0; i--) {
      let history = this._buffer[i];
      if (history.keyCode == keyCode && history.pressAt != 0 && history.releaseAt == 0) {
        return;
      }
    }
    //add history
    this.addHistory({ keyCode: keyCode, pressAt: at, releaseAt: 0 });
  }

  /**
   * 離鍵を記録する
   *
   * @param keyCode キーコード
   * @param at イベント発生時刻
   */
  public logKeyUp(keyCode: number, at: number): void {
    // prepare process
    let n = this._buffer.length;
    // find last press & update it
    for (let i = n - 1; i >= 0; i--) {
      let history = this._buffer[i];
      if (history.keyCode == keyCode && history.pressAt != 0 && history.releaseAt == 0) {
        history.releaseAt = at;
        return;
      }
    }
    //add history
    this.addHistory({ keyCode: keyCode, pressAt: at, releaseAt: at });
  }

  /**
   * キー履歴を追加する
   *
   * @param history キー履歴
   */
  private addHistory(history: KeyHistory): void {
    // purge old history
    if (this._buffer.length >= this._capacity) {
      this._buffer.shift();
    }
    // log key press
    this._buffer.push(history);
  }

  /**
   * キー履歴をクリアする（但し、末尾に位置する打鍵中の履歴は残す）
   */
  public clear(): void {
    let n = this._buffer.length;
    if (n > 0) {
      if (this._buffer[n - 1].releaseAt == 0) {
        n--;
      }
      this._buffer.splice(0, n);
    }
  }

  /**
   * 指定キーの最後のKeyDown時刻を返す（長押し判定用）
   *
   * @param keyCode 対象キーコード
   * @returns 最後に押下した時刻。存在しなかった場合、-1
   */
  public getLastDownAt(keyCode: number): number {
    // prepare process
    let n = this._buffer.length;
    // find last press & update it
    for (let i = n - 1; i >= 0; i--) {
      let history = this._buffer[i];
      if (history.keyCode == keyCode && history.pressAt != 0 && history.releaseAt == 0) {
        return history.pressAt;
      }
    }
    return -1;
  }

  /**
   * 現在のキー履歴に合致するキーシーケンスを検索
   *
   * @param sequences キーシーケンス配列
   * @param at 現在時刻（打鍵中履歴のリリース時刻補完の為）
   * @returns キー履歴に合致したキーシーケンス。またはnull
   */
  public findKeySequence(sequences: KeySequence[], at: number): KeySequence | null {
    for (let seq of sequences) {
      if (this.endsWith(seq, at)) {
        return seq;
      }
    }
    return null;
  }

  /**
   * 現在のキー履歴が指定されたキーシーケンスに合致するかを判定
   *
   * @param seq キーシーケンス
   * @param at 現在時刻（打鍵中履歴のリリース時刻補完の為）
   * @returns キー履歴に合致した場合、真
   */
  public endsWith(seq: KeySequence, at: number): boolean {
    let n = this._buffer.length;
    let m = seq.sequence.length;
    if (m <= n) {
      let diff = n - m;
      for (let i = n - 1; i >= diff; i--) {
        let h = this._buffer[i];
        let hk = h.keyCode;
        let ht = (h.releaseAt == 0 ? at : h.releaseAt) - h.pressAt;
        let s = seq.sequence[i - diff];
        if (hk != s.keyCode || ht < s.elapsedTime) {
          return false;
        }
      }
      let h = this._buffer[n - 1];
      return true;
    } else {
      return false;
    }
  }
}
