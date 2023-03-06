import { Logs, Properties } from '~/lib/lang';

export class HistoryState {
  /** ハッシュタグ */
  private _hashTag: string;

  private _arguments: Properties<string>;

  public constructor(param: string, args?: Properties<string>) {
    if (args === undefined) {
      let hash = param;
      if (hash == '') {
        this._hashTag = '';
        this._arguments = {};
      } else {
        let index = hash.indexOf(':');
        if (index == -1) {
          this._hashTag = hash.substring(1);
          this._arguments = {};
        } else {
          this._hashTag = hash.substring(1, index);
          this._arguments = this.decodeArguments(hash.substring(index + 1));
        }
      }
    } else {
      this._hashTag = param;
      this._arguments = args;
    }
  }

  private decodeArguments(str: string): Properties<string> {
    let result: Properties<string> = {};
    for (let param of str.split('&')) {
      let pair = param.split('=');
      if (pair.length == 1) {
        let key = pair[0];
        result[key] = '';
      } else {
        let key = pair[0];
        let value = pair[1];
        result[key] = value;
      }
    }
    return result;
  }

  private encodeArguments(props: Properties<string>): string {
    let b = '';
    let sep = '';
    for (const [key, value] of Object.entries(props)) {
      if (value != '') {
        b += sep + key + '=' + value;
      } else {
        b += sep + key;
      }
      sep = '&';
    }
    return b;
  }

  public get tag(): string {
    return this._hashTag;
  }

  public get arguments(): Properties<string> {
    return this._arguments;
  }

  public get hash(): string {
    if (this._hashTag == '') {
      return '';
    } else if (Object.entries(this._arguments).length == 0) {
      return '#' + this._hashTag;
    } else {
      return '#' + this._hashTag + ':' + this.encodeArguments(this._arguments);
    }
  }
}

class PageHistory {
  private _states: HistoryState[];

  public constructor(initialState: HistoryState[]) {
    this._states = initialState;
  }

  public getPageStates(): HistoryState[] {
    return this._states;
  }

  public setPageStates(states: HistoryState[]): void {
    this._states = states;
  }
}

type HistoryElement = {
  index: number;
};

type PostProc = () => void;

export class HistoryManager {
  private _index: number = 0;

  private _nextIndex: number = 0;

  private _hisotries: PageHistory[] = [];

  private _postProcs: PostProc[] = [];

  public constructor() {
    //起動ページの履歴状態更新
    window.history.replaceState({ index: 0 }, '');
  }

  public forward() {
    Logs.info('forward');
    window.history.forward();
  }

  public back() {
    Logs.info('back');
    window.history.back();
  }

  public restartTo(tag: string, args: Properties<string>) {
    Logs.info('restartTo %s %s', tag, JSON.stringify(args));
    let newState = new HistoryState(tag, args);
    if (0 < this._hisotries.length) {
      this._hisotries[0].setPageStates([newState]);
    } else {
      this._hisotries.push(new PageHistory([newState]));
    }
    let hash = newState.hash;
    if (this._index > 0) {
      //ブラウザの履歴機能で先頭ページに戻す
      window.history.go(-this._index);
      //go()は非同期なのでpopState()で後処理実行
      this._postProcs.push(() => {
        //URL書き換え
        window.location.replace(hash);
      });
    } else {
      //URL書き換え
      window.location.replace(hash);
    }
  }

  public forwardTo(tag: string, args: Properties<string>) {
    Logs.info('forwardTo %s %s', tag, JSON.stringify(args));
    //新ページ情報を（事前に）記録
    let newIndex = this._index + 1;
    let newState = new HistoryState(tag, args);
    this._hisotries[newIndex] = new PageHistory([newState]);
    //（疑似）ページ遷移
    let hash = newState.hash;
    //hash書き換え（副作用として履歴が追加される）
    window.location.hash = hash;
    //（副作用で）追加された履歴のデータを更新
    window.history.replaceState({ index: newIndex } as HistoryElement, '', hash);
  }

  public exit(): void {
    Logs.info('exit');
    if (this._index > 0) {
      //ブラウザの履歴機能で先頭ページに戻す
      window.history.go(-this._index);
      //go()は非同期なのでpopState()で後処理実行
      this._postProcs.push(() => {
        window.history.back();
        this.closeWindow();
      });
    } else {
      window.history.back();
      this.closeWindow();
    }
  }

  /**
   * Window(tab)を閉じる。ブラウザによって実行できない場合あり
   */
  private closeWindow(): void {
    let w = window;
    let x = w.open('', '_self');
    if (x != null) {
      x.close();
    }
  }

  public popState(state: any): void {
    if (state === undefined || state === null) {
      this._nextIndex = this._index + 1;
    } else {
      let newState = state as HistoryElement;
      this._nextIndex = newState.index;
    }
    //go()後の後処理
    if (this._postProcs.length > 0) {
      for (let func of this._postProcs) {
        func();
      }
      this._postProcs.splice(0);
    }
  }

  public saveHistoryStates(states: HistoryState[]): void {
    if (this._index < this._hisotries.length) {
      this._hisotries[this._index].setPageStates(states);
    }
  }

  public loadHistoryStates(hash: string): HistoryState[] {
    let result: HistoryState[];
    this._index = this._nextIndex;
    if (this._index < this._hisotries.length) {
      result = this._hisotries[this._index].getPageStates();
    } else {
      this._hisotries.push(new PageHistory([new HistoryState(hash)]));
      this._index = this._hisotries.length - 1;
      result = this._hisotries[this._index].getPageStates();
    }
    return result;
  }
}
