import { Properties } from '../lang';
import { Colors } from './Colors';
import { HistoryState } from './HistoryManager';
import { KeyCodes } from './KeyCodes';
import type { UiApplication } from './UiApplication';
import { UiKeyboard } from './UiKeyboard';
import { UiNode, UiNodeSetter, UiResult } from './UiNode';

const NBSP = '\u00A0';
export class UiEditNodeSetter extends UiNodeSetter {
  public static readonly INSTANCE = new UiEditNodeSetter();
  public placeHolder(value: string): this {
    let node = this.node as UiEditNode;
    node.placeHolder = value;
    return this;
  }
}
/**
 * （ソフトキーボードによる）文字列編集ノード
 */
export class UiEditNode extends UiNode {
  /** 編集中に文字列が変更された場合に送付されるアクションのタグ名 */
  public static readonly EVENT_TAG_CHANGED = 'changed';

  /** 編集が終了した場合に送付されるアクションのタグ名 */
  public static readonly EVENT_TAG_FINISHED = 'finished';

  /** 編集をキャンセルした場合に送付されるアクションのタグ名 */
  public static readonly EVENT_TAG_CANCELED = 'canceled';

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
  private _placeHolder: string;
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
      this._placeHolder = src._placeHolder;
    } else {
      super(param as UiApplication, name as string);
      this._textContent = '';
      this._saveContent = '';
      this._editStart = 0;
      this._editEnd = 0;
      this._cursorPos = 0;
      this._divLeft = 0;
      this._placeHolder = '';
    }
  }
  protected createDomElement(target: UiNode, tag: string): HTMLElement | null {
    let dom = super.createDomElement(target, tag);
    if (dom == null) {
      return dom;
    }
    let border = this.getBorderSize();
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
  public getSetter(): UiEditNodeSetter {
    return UiEditNodeSetter.INSTANCE;
  }
  public set placeHolder(text: string) {
    this._placeHolder = text;
  }
  public get placeHolder() {
    return this._placeHolder;
  }

  protected renderContent(): void {
    if (this._textContent.length == 0 && this._placeHolder != '') {
      this.renderPlaceHolderContent();
    } else {
      this.renderEditContent();
    }
  }
  protected renderPlaceHolderContent(): void {
    let dom = this.domElement as HTMLElement;
    let div = dom.firstChild as HTMLDivElement;
    let defaultStyle = this.style.getEffectiveStyle(this);
    let editingStyle = defaultStyle.getConditionalStyle('FOCUS');
    let editingBack: string;
    if (editingStyle == null) {
      editingBack = defaultStyle.backgroundColor;
    } else {
      editingBack = editingStyle.backgroundColor;
    }
    let sb = `<span style="color:${Colors.GRAY};background-color:${editingBack}">`;
    sb += this._placeHolder;
    sb += '</span>';
    div.innerHTML = sb;
  }
  protected renderEditContent(): void {
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
    this.fireTextAction(UiEditNode.EVENT_TAG_CHANGED);
  }

  /**
   * （UiKeyboard向け） 入力済み文字の変形（濁音、半濁音、小文字）
   *
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
        this.fireTextAction(UiEditNode.EVENT_TAG_CHANGED);
      }
    }
  }

  /**
   * （UiKeyboard向け） 一字削除
   *
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
      this.fireTextAction(UiEditNode.EVENT_TAG_CHANGED);
    }
  }
  /**
   * （UiKeyboard向け） 全削除
   */
  public editClearAll(): void {
    if (this._cursorPos > 0) {
      this._textContent = '';
      this._editEnd = 0;
      this._cursorPos = 0;
      this._editStart = 0;
      this.onContentChanged();
      this.fireTextAction(UiEditNode.EVENT_TAG_CHANGED);
    }
  }
  /**
   * （UiKeyboard向け） カーソル移動
   *
   * @param dir 移動量
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
   * @param commit 編集完了
   */
  public editDone(commit: boolean): UiResult {
    this.editing = false;
    if (!commit) {
      this._textContent = this._saveContent;
    }
    this.resetPosition();
    this.fireTextAction(commit ? UiEditNode.EVENT_TAG_FINISHED : UiEditNode.EVENT_TAG_CANCELED);
    return UiResult.AFFECTED;
  }

  private fireTextAction(tag: string): void {
    this.fireActionEvent(tag, this.textContent);
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
