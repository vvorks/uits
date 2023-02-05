import type { UiApplication } from './UiApplication';
import { Properties } from '../lang';
import { UiNode, UiResult } from './UiNode';
import { Colors } from './Colors';
import { HistoryState } from './HistoryManager';
import { UiKeyboard } from './UiKeyboard';
import { KeyCodes } from './KeyCodes';

const NBSP = '\u00A0';

/**
 * （ソフトキーボードによる）文字列編集ノード
 */
export class UiEditNode extends UiNode {
  private static readonly VIRTUAL_WIDTH = 16384;

  /** 濁音、半濁音、小文字変換テーブル */
  // prettier-ignore
  private static readonly VOICE_MAP: Properties<string> = {
    あ: 'ぁ',    ア: 'ァ',
    ぁ: 'あ',    ァ: 'ア',
    い: 'ぃ',    イ: 'ィ',
    ぃ: 'い',    ィ: 'イ',
    う: 'ぅ',    ウ: 'ヴ',
    ぅ: 'う',    ヴ: 'ゥ',
                 ゥ: 'ウ',
    え: 'ぇ',    エ: 'ェ',
    ぇ: 'え',    ェ: 'エ',
    お: 'ぉ',    オ: 'ォ',
    ぉ: 'お',    ォ: 'オ',
    か: 'が',    カ: 'ガ',
    が: 'か',    ガ: 'ヵ',
                 ヵ: 'カ',
    き: 'ぎ',    キ: 'ギ',
    ぎ: 'き',    ギ: 'キ',
    く: 'ぐ',    ク: 'グ',
    ぐ: 'く',    グ: 'ク',
    け: 'げ',    ケ: 'ゲ',
    げ: 'け',    ゲ: 'ヶ',
                 ヶ: 'ケ',
    こ: 'ご',    コ: 'ゴ',
    ご: 'こ',    ゴ: 'コ',
    さ: 'ざ',    サ: 'ザ',
    ざ: 'さ',    ザ: 'サ',
    し: 'じ',    シ: 'ジ',
    じ: 'し',    ジ: 'シ',
    す: 'ず',    ス: 'ズ',
    ず: 'す',    ズ: 'ス',
    せ: 'ぜ',    セ: 'ゼ',
    ぜ: 'せ',    ゼ: 'セ',
    そ: 'ぞ',    ソ: 'ゾ',
    ぞ: 'そ',    ゾ: 'ソ',
    た: 'だ',    タ: 'ダ',
    だ: 'た',    ダ: 'タ',
    ち: 'ぢ',    チ: 'ヂ',
    ぢ: 'ち',    ヂ: 'チ',
    つ: 'っ',    ツ: 'ッ',
    っ: 'づ',    ッ: 'ヅ',
    づ: 'つ',    ヅ: 'ツ',
    て: 'で',    テ: 'デ',
    で: 'て',    デ: 'テ',
    と: 'ど',    ト: 'ド',
    ど: 'と',    ド: 'ト',
    は: 'ば',    ハ: 'バ',
    ば: 'ぱ',    バ: 'パ',
    ぱ: 'は',    パ: 'ハ',
    ひ: 'び',    ヒ: 'ビ',
    び: 'ぴ',    ビ: 'ピ',
    ぴ: 'ひ',    ピ: 'ヒ',
    ふ: 'ぶ',    フ: 'ブ',
    ぶ: 'ぷ',    ブ: 'プ',
    ぷ: 'ふ',    プ: 'フ',
    へ: 'べ',    ヘ: 'ベ',
    べ: 'ぺ',    ベ: 'ペ',
    ぺ: 'へ',    ペ: 'ヘ',
    ほ: 'ぼ',    ホ: 'ボ',
    ぼ: 'ぽ',    ボ: 'ポ',
    ぽ: 'ほ',    ポ: 'ホ',
    や: 'ゃ',    ヤ: 'ャ',
    ゃ: 'や',    ャ: 'ヤ',
    ゆ: 'ゅ',    ユ: 'ュ',
    ゅ: 'ゆ',    ュ: 'ユ',
    よ: 'ょ',    ヨ: 'ョ',
    ょ: 'よ',    ョ: 'ヨ',
    わ: 'ゎ',    ワ: 'ヮ',
    ゎ: 'わ',    ヮ: 'ワ',
  };

  private _textContent: string;
  private _saveContent: string;
  private _editStart: number;
  private _editEnd: number;
  private _cursorPos: number;
  private _divLeft: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiEditNode {
    return new UiEditNode(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiEditNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiEditNode) {
      super(param as UiEditNode);
      let src = param as UiEditNode;
      this._textContent = src._textContent;
      this._saveContent = src._saveContent;
      this._editStart = src._editStart;
      this._editEnd = src._editEnd;
      this._cursorPos = src._cursorPos;
      this._divLeft = src._divLeft;
    } else {
      super(param as UiApplication, name as string);
      this._textContent = '';
      this._saveContent = '';
      this._editStart = 0;
      this._editEnd = 0;
      this._cursorPos = 0;
      this._divLeft = 0;
    }
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement {
    let border = this.getBorderSize();
    let dom = super.createDomElement(target, tag);
    let div = document.createElement('div');
    let style = div.style;
    style.position = 'absolute';
    style.left = `${border.left - this._divLeft}px`;
    style.width = `${UiEditNode.VIRTUAL_WIDTH}px`;
    style.top = `${border.top}px`;
    style.bottom = `${border.bottom}px`;
    dom.appendChild(div);
    return dom;
  }

  protected renderContent(): void {
    //スタイル取得
    let defaultStyle = this.style.getEffectiveStyle(this);
    let editingStyle = defaultStyle.getConditionalStyle('FOCUS');
    let editingFore: string;
    let editingBack: string;
    if (editingStyle == null) {
      editingFore = Colors.BLUE;
      editingBack = defaultStyle.backgroundColor;
    } else {
      editingFore = editingStyle.textColor;
      editingBack = editingStyle.backgroundColor;
    }
    let cursorFore: string;
    let cursorBack: string;
    if (!this.editing) {
      cursorFore = defaultStyle.textColor;
      cursorBack = defaultStyle.backgroundColor;
    } else {
      cursorFore = editingBack;
      cursorBack = editingFore;
    }

    //文字列追加処理初期処理
    let text = this._textContent;
    let sb = '';
    let cursorId = this.id + '-cursor';
    //編集領域前文字列
    if (0 < this._editStart) {
      sb += text.substring(0, this._editStart);
    }
    //編集領域SPAN
    if (this._editStart < this._editEnd) {
      //編集領域SPAN開始
      sb += `<span style="color:${editingFore};background-color:${editingBack}">`;
      //編集領域～カーソル位置までのテキスト追加
      if (this._editStart < this._cursorPos) {
        sb += text.substring(this._editStart, this._cursorPos);
      }
      //編集領域中のカーソル先頭文字をカーソル色反転で追加
      if (this._cursorPos < this._editEnd) {
        sb += `<span id="${cursorId}" style="color:${cursorFore};background-color:${cursorBack}">`;
        sb += text.substring(this._cursorPos, this._cursorPos + 1);
        sb += '</span>';
        //編集領域中のカーソル以降を追加
        if (this._cursorPos + 1 < this._editEnd) {
          sb += text.substring(this._cursorPos + 1, this._editEnd);
        }
      }
      //編集領域終了タグ追加
      sb += '</span>';
    }
    if (this._cursorPos < this._editEnd) {
      //カーソルが編集領域内にある場合
      if (this._editEnd < text.length) {
        //編集領域以降の文字列を追加
        sb += text.substring(this._editEnd);
      }
    } else if (this._cursorPos < text.length) {
      //カーソルがデータ末尾でない場合
      sb += `<span id="${cursorId}" style="color:${cursorFore};background-color:${cursorBack}">`;
      sb += text.substring(this._cursorPos, this._cursorPos + 1);
      sb += '</span>';
      if (this._cursorPos + 1 < text.length) {
        sb += text.substring(this._cursorPos + 1);
      }
    } else {
      //カーソルがデータ末尾なので、ダミー文字を追加挿入
      sb += text.substring(this._editEnd);
      sb += `<span id="${cursorId}" style="color:${cursorFore};background-color:${cursorBack}">`;
      sb += NBSP;
    }
    //DOMノード更新
    let dom = this.domElement as HTMLElement;
    let div = dom.firstChild as HTMLDivElement;
    let cssStyle = div.style;
    cssStyle.textAlign = 'left';
    cssStyle.bottom = defaultStyle.borderBottom;
    div.innerHTML = sb;
    //スクロール処理
    this.application.runFinally(() => {
      let cursorSpan = document.getElementById(cursorId) as HTMLSpanElement;
      this.ensureCursorVisible(cursorSpan.offsetLeft, cursorSpan.offsetWidth);
    });
  }

  private ensureCursorVisible(cursorLeft: number, cursorWidth: number): void {
    let border = this.getBorderSize();
    let dom = this.domElement as HTMLElement;
    let div = dom.firstChild as HTMLDivElement;
    let style = div.style;
    let width = this.innerWidth;
    let left = this._divLeft;
    let margin = Math.floor(width / 3);
    if (left > cursorLeft) {
      left = cursorLeft - margin;
    } else if (left + width < cursorLeft + cursorWidth + border.right) {
      left = cursorLeft + cursorWidth + border.right - width + margin;
    }
    left = Math.min(Math.max(0, left), UiEditNode.VIRTUAL_WIDTH - width);
    if (this._divLeft != left) {
      this._divLeft = left;
      style.left = `${border.left - this._divLeft}px`;
    }
  }

  public get textContent(): string {
    return this.unescapeString(this._textContent);
  }

  public set textContent(text: string) {
    this._textContent = this.escapeString(text);
    this.resetPosition();
  }

  private escapeString(s: string): string {
    return s.replace(new RegExp(' ', 'g'), NBSP);
  }

  private unescapeString(s: string): string {
    return s.replace(new RegExp(NBSP, 'g'), ' ');
  }

  private resetPosition(): void {
    let text = this._textContent;
    if (!this.editing) {
      this._cursorPos = 0;
      this._editStart = 0;
      this._editEnd = 0;
    } else {
      let len = text.length;
      this._cursorPos = len;
      this._editStart = len;
      this._editEnd = len;
    }
    this.onContentChanged();
  }

  /**
   * （UiKeyboard向け） 文字追加
   *
   * @param text 追加文字列
   */
  public editAppend(text: string): void {
    text = this.escapeString(text);
    if (this._cursorPos < this._textContent.length) {
      this._textContent =
        this._textContent.substring(0, this._cursorPos) +
        text +
        this._textContent.substring(this._cursorPos);
    } else {
      this._textContent += text;
    }
    this._cursorPos += text.length;
    this._editEnd += text.length;
    this.onContentChanged();
  }

  /**
   * （UiKeyboard向け） 入力済み文字の変形（濁音、半濁音、小文字）
   *
   * @param text 追加文字列
   */
  public editModifyLastChar(): void {
    if (this._cursorPos > 0) {
      let lastChar = this._textContent.substring(this._cursorPos - 1, this._cursorPos);
      let modified = UiEditNode.VOICE_MAP[lastChar];
      if (modified !== undefined) {
        this._textContent =
          this._textContent.substring(0, this._cursorPos - 1) +
          modified +
          this._textContent.substring(this._cursorPos);
        this.onContentChanged();
      }
    }
  }

  /**
   * （UiKeyboard向け） 一時削除
   *
   * @param text 追加文字列
   */
  public editBackspace(): void {
    if (this._cursorPos > 0) {
      this._textContent =
        this._textContent.substring(0, this._cursorPos - 1) +
        this._textContent.substring(this._cursorPos);
      this._editEnd--;
      this._cursorPos--;
      this._editStart = Math.min(this._editStart, this._cursorPos);
      this.onContentChanged();
    }
  }

  /**
   * （UiKeyboard向け） カーソル移動
   *
   * @param text 追加文字列
   */
  public editMoveCursor(dir: number): void {
    if (this._editStart < this._editEnd) {
      let delta =
        Math.min(Math.max(this._editStart, this._cursorPos + dir), this._editEnd) - this._cursorPos;
      if (delta != 0) {
        this._cursorPos += delta;
        this.onContentChanged();
      }
    } else {
      let delta =
        Math.min(Math.max(0, this._cursorPos + dir), this._textContent.length) - this._cursorPos;
      if (delta != 0) {
        this._cursorPos += delta;
        this._editStart += delta;
        this._editEnd += delta;
        this.onContentChanged();
      }
    }
  }

  /**
   * （UiKeyboard向け） 入力文字確定
   *
   * @param text 追加文字列
   */
  public editConfirm(): UiResult {
    if (this._editStart == this._editEnd) {
      return UiResult.IGNORED;
    } else {
      this._editStart = this._editEnd;
      this._cursorPos = this._editEnd;
      this.onContentChanged();
      return UiResult.AFFECTED;
    }
  }

  /**
   * （UiKeyboard向け） 編集処理開始
   *
   * @param text 追加文字列
   */
  private editStart(): UiResult {
    this._saveContent = this._textContent;
    this.application.call(new UiKeyboard(this.application, '', this), new HistoryState('', {}));
    this.editing = true;
    this.resetPosition();
    return UiResult.AFFECTED;
  }

  /**
   * （UiKeyboard向け） 編集処理完了
   *
   * @param text 追加文字列
   */
  public editDone(commit: boolean): UiResult {
    this.editing = false;
    if (!commit) {
      this._textContent = this._saveContent;
    }
    this.resetPosition();
    return UiResult.AFFECTED;
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ENTER:
        result |= this.editStart();
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.editStart();
  }
}
