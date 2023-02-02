import { Logs, Properties } from '~/lib/lang';
import { Colors } from '~/lib/ui/Colors';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import { FIELD_STYLE, GROUP_STYLE, UiApplication } from '~/lib/ui/UiApplication';
import { UiDeckNode } from '~/lib/ui/UiDeckNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiBuilder } from '~/lib/ui/UiBuilder';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiStyle, UiStyleBuilder } from '~/lib/ui/UiStyle';
import { UiTextField } from '~/lib/ui/UiTextField';
import { UiTextNode } from '~/lib/ui/UiTextNode';

const KEYTOP_SIZE = 24;
const KEYTOP_SPACING = 4;
const EDITAREA_HEIGHT = 30;

const KEYTOP_STYLE: UiStyle = new UiStyleBuilder()
  .textColor(Colors.BLACK)
  .backgroundColor(Colors.WHITE)
  .textAlign('center')
  .verticalAlign('middle')
  .borderRadius(`${KEYTOP_SIZE / 2}`)
  .fontSize('16px')
  .build();

const KEYTOP_FOCUS: UiStyle = new UiStyleBuilder()
  .basedOn(KEYTOP_STYLE)
  .condition('FOCUS')
  .textColor(Colors.WHITE)
  .backgroundColor(Colors.BLUE)
  .build();

const NBSP = '\u00A0';

const YEN = '\u00A5';

class KeyInfo {
  private _text: string;
  private _caps: string | null;
  private _row: number;
  private _col: number;
  private _rowspan: number;
  private _colspan: number;
  private _action: (me: UiKeyboard, ki: KeyInfo) => void;

  public constructor(
    text: string,
    caps: string | null,
    r: number,
    c: number,
    rs: number,
    cs: number,
    action: (me: UiKeyboard, ki: KeyInfo) => void
  ) {
    this._text = text;
    this._caps = caps;
    this._row = r;
    this._col = c;
    this._rowspan = rs;
    this._colspan = cs;
    this._action = action;
  }

  public get text(): string {
    return this._text;
  }
  public get caps(): string | null {
    return this._caps;
  }

  public asRect(xs: number, ys: number, xo: number, yo: number): Rect {
    return new Rect().locate(
      this._col * (xs + xo) + xo,
      this._row * (ys + yo) + yo,
      this._colspan * (xs + xo) - xo,
      this._rowspan * (ys + yo) - yo
    );
  }

  public action(kbd: UiKeyboard) {
    this._action(kbd, this);
  }
}

class UiKeytop extends UiTextNode {
  private _info: KeyInfo;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiKeytop {
    return new UiKeytop(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, info: KeyInfo);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiKeytop);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  constructor(param: any, info?: KeyInfo) {
    super(param);
    if (param instanceof UiKeytop) {
      let src = param as UiKeytop;
      this._info = src._info;
    } else {
      super(param as UiApplication, (info as KeyInfo).text);
      this._info = info as KeyInfo;
    }
    this.textContent = this._info.text;
  }

  public get info(): KeyInfo {
    return this._info;
  }

  public onShiftChanged(shift: boolean): void {
    if (shift && this.info.caps != null) {
      this.textContent = this._info.caps;
    } else {
      this.textContent = this._info.text;
    }
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
      case KeyCodes.ENTER:
        result |= this.fireAction();
        break;
    }
    return result;
  }

  public onMouseClick(target: UiNode, x: number, y: number, mod: number, at: number): UiResult {
    return this.fireAction();
  }

  private fireAction(): UiResult {
    let kbd = this.getPageNode() as UiKeyboard;
    this._info.action(kbd);
    return UiResult.EATEN;
  }
}

class UiEditArea extends UiNode {
  private static readonly VIRTUAL_WIDTH = 16384;

  /** 濁音、半濁音、小文字変換テーブル */
  private static readonly VOICE_MAP: Properties<string> = {
    あ: 'ぁ',
    い: 'ぃ',
    う: 'ぅ',
    え: 'ぇ',
    お: 'ぉ',
    ぁ: 'あ',
    ぃ: 'い',
    ぅ: 'う',
    ぇ: 'え',
    ぉ: 'お',

    か: 'が',
    き: 'ぎ',
    く: 'ぐ',
    け: 'げ',
    こ: 'ご',
    が: 'か',
    ぎ: 'き',
    ぐ: 'く',
    げ: 'け',
    ご: 'こ',

    さ: 'ざ',
    し: 'じ',
    す: 'ず',
    せ: 'ぜ',
    そ: 'ぞ',
    ざ: 'さ',
    じ: 'し',
    ず: 'す',
    ぜ: 'せ',
    ぞ: 'そ',

    た: 'だ',
    ち: 'ぢ',
    て: 'で',
    と: 'ど',
    だ: 'た',
    ぢ: 'ち',
    で: 'て',
    ど: 'と',
    つ: 'っ',
    っ: 'づ',
    づ: 'つ',

    は: 'ば',
    ひ: 'び',
    ふ: 'ぶ',
    へ: 'べ',
    ほ: 'ぼ',
    ば: 'ぱ',
    び: 'ぴ',
    ぶ: 'ぷ',
    べ: 'ぺ',
    ぼ: 'ぽ',
    ぱ: 'は',
    ぴ: 'ひ',
    ぷ: 'ふ',
    ぺ: 'へ',
    ぽ: 'ほ',

    や: 'ゃ',
    ゆ: 'ゅ',
    よ: 'ょ',
    ゃ: 'や',
    ゅ: 'ゆ',
    ょ: 'よ',

    わ: 'ゎ',
    ゎ: 'わ',

    ア: 'ァ',
    イ: 'ィ',
    エ: 'ェ',
    オ: 'ォ',
    ァ: 'ア',
    ィ: 'イ',
    ェ: 'エ',
    ォ: 'オ',
    キ: 'ギ',
    ク: 'グ',
    コ: 'ゴ',
    ギ: 'キ',
    グ: 'ク',
    ゴ: 'コ',

    ウ: 'ヴ',
    ヴ: 'ゥ',
    ゥ: 'ウ',
    カ: 'ガ',
    ガ: 'ヵ',
    ヵ: 'カ',
    ケ: 'ゲ',
    ゲ: 'ヶ',
    ヶ: 'ケ',

    サ: 'ザ',
    シ: 'ジ',
    ス: 'ズ',
    セ: 'ゼ',
    ソ: 'ゾ',
    ザ: 'サ',
    ジ: 'シ',
    ズ: 'ス',
    ゼ: 'セ',
    ゾ: 'ソ',

    タ: 'ダ',
    チ: 'ヂ',
    テ: 'デ',
    ト: 'ド',
    ダ: 'タ',
    ヂ: 'チ',
    デ: 'テ',
    ド: 'ト',
    ツ: 'ッ',
    ッ: 'ヅ',
    ヅ: 'ツ',

    ハ: 'バ',
    ヒ: 'ビ',
    フ: 'ブ',
    ヘ: 'ベ',
    ホ: 'ボ',
    バ: 'パ',
    ビ: 'ピ',
    ブ: 'プ',
    ベ: 'ペ',
    ボ: 'ポ',
    パ: 'ハ',
    ピ: 'ヒ',
    プ: 'フ',
    ペ: 'ヘ',
    ポ: 'ホ',

    ヤ: 'ャ',
    ユ: 'ュ',
    ヨ: 'ョ',
    ャ: 'ヤ',
    ュ: 'ユ',
    ョ: 'ヨ',

    ワ: 'ヮ',
    ヮ: 'ワ',
  };

  private _textContent: string;
  private _editStart: number;
  private _editEnd: number;
  private _cursorPos: number;

  private _divLeft: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiEditArea {
    return new UiEditArea(this);
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
  constructor(src: UiEditArea);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiEditArea) {
      super(param as UiEditArea);
      let src = param as UiEditArea;
      this._textContent = src._textContent;
      this._editStart = src._editStart;
      this._editEnd = src._editEnd;
      this._cursorPos = src._cursorPos;
      this._divLeft = src._divLeft;
    } else {
      super(param as UiApplication, name as string);
      this._textContent = '';
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
    style.width = `${UiEditArea.VIRTUAL_WIDTH}px`;
    style.top = `${border.top}px`;
    style.bottom = `${border.bottom}px`;
    dom.appendChild(div);
    return dom;
  }

  protected renderContent(): void {
    //スタイル取得
    let defaultStyle = this.style.getEffectiveStyle(this);
    let editingStyle = defaultStyle.getConditionalStyle('FOCUS');
    let editingFore;
    let editingBack;
    if (editingStyle == null) {
      editingFore = Colors.BLUE;
      editingBack = defaultStyle.backgroundColor;
    } else {
      editingFore = editingStyle.textColor;
      editingBack = editingStyle.backgroundColor;
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
        sb += `<span id="${cursorId}" style="color:${editingBack};background-color:${editingFore}">`;
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
      sb += `<span id="${cursorId}" style="color:${editingBack};background-color:${editingFore}">`;
      sb += text.substring(this._cursorPos, this._cursorPos + 1);
      sb += '</span>';
      if (this._cursorPos + 1 < text.length) {
        sb += text.substring(this._cursorPos + 1);
      }
    } else {
      //カーソルがデータ末尾なので、ダミー文字を追加挿入
      sb += text.substring(this._editEnd);
      sb += `<span id="${cursorId}" style="color:${editingFore};background-color:${editingFore}">`;
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
    if (left > cursorLeft) {
      left = cursorLeft;
    } else if (left + width < cursorLeft + cursorWidth + border.right) {
      left = cursorLeft + cursorWidth + border.right - width;
    }
    left = Math.min(Math.max(0, left), UiEditArea.VIRTUAL_WIDTH - width);
    if (this._divLeft != left) {
      this._divLeft = left;
      style.left = `${border.left - this._divLeft}px`;
    }
  }

  public reset(text: string): void {
    this._textContent = text;
    this._cursorPos = text.length;
    this._editStart = text.length;
    this._editEnd = text.length;
    this.onContentChanged();
  }

  public append(text: string): void {
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

  public modifyLastChar(): void {
    if (this._cursorPos > 0) {
      let lastChar = this._textContent.substring(this._cursorPos - 1, this._cursorPos);
      let modified = UiEditArea.VOICE_MAP[lastChar];
      if (modified !== undefined) {
        this._textContent =
          this._textContent.substring(0, this._cursorPos - 1) +
          modified +
          this._textContent.substring(this._cursorPos);
        this.onContentChanged();
      }
    }
  }

  public backspace(): void {
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

  public moveCursor(dir: number): void {
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

  public confirm(): UiResult {
    if (this._editStart == this._editEnd) {
      return UiResult.IGNORED;
    } else {
      this._editStart = this._editEnd;
      this._cursorPos = this._editEnd;
      this.onContentChanged();
      return UiResult.AFFECTED;
    }
  }

  public get textContent(): string {
    return this._textContent;
  }
}

export class UiKeyboard extends UiPageNode {
  private static readonly JA_KEYS: KeyInfo[] = [
    //あ行
    new KeyInfo('あ', 'ア', 0, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('い', 'イ', 1, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('う', 'ウ', 2, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('え', 'エ', 3, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('お', 'オ', 4, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    //か行
    new KeyInfo('か', 'カ', 0, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('き', 'キ', 1, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('く', 'ク', 2, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('け', 'ケ', 3, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('こ', 'コ', 4, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    //さ行
    new KeyInfo('さ', 'サ', 0, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('し', 'シ', 1, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('す', 'ス', 2, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('せ', 'セ', 3, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('そ', 'ソ', 4, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    //た行
    new KeyInfo('た', 'タ', 0, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ち', 'チ', 1, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('つ', 'ツ', 2, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('て', 'テ', 3, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('と', 'ト', 4, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    //な行
    new KeyInfo('な', 'ナ', 0, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('に', 'ニ', 1, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ぬ', 'ヌ', 2, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ね', 'ネ', 3, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('の', 'ノ', 4, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    //は行
    new KeyInfo('は', 'ハ', 0, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ひ', 'ヒ', 1, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ふ', 'フ', 2, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('へ', 'ヘ', 3, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ほ', 'ホ', 4, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    //ま行
    new KeyInfo('ま', 'マ', 0, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('み', 'ミ', 1, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('む', 'ム', 2, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('め', 'メ', 3, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('も', 'モ', 4, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    //や行。（句読点）
    new KeyInfo('や', 'ヤ', 0, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ゆ', 'ユ', 1, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('よ', 'ヨ', 2, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('、', '、', 3, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('。', '。', 4, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    //ら行
    new KeyInfo('ら', 'ラ', 0, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('り', 'リ', 1, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('る', 'ル', 2, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('れ', 'レ', 3, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ろ', 'ロ', 4, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    //わ行
    new KeyInfo('わ', 'ワ', 0, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('を', 'ヲ', 1, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ん', 'ン', 2, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('ー', 'ー', 3, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('゛゜小', null, 4, 9, 1, 2, (kb, ki) => kb.doModify()),
    //記号
    new KeyInfo('・', '・', 0, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('「', '【', 1, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('」', '】', 2, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('～', '…', 3, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //制御ボタン
    new KeyInfo('BS', null, 0, 11, 1, 2, (kb, ki) => kb.doBackspace()),
    new KeyInfo('ABC', null, 1, 11, 1, 2, (kb, ki) => kb.doSelect('en')),
    new KeyInfo('ENTER', null, 2, 11, 1, 2, (kb, ki) => kb.doEnter()),
    new KeyInfo('SHIFT', null, 3, 11, 1, 2, (kb, ki) => kb.doShift()),
    new KeyInfo('◀', null, 4, 11, 1, 1, (kb, ki) => kb.doMove(-1)),
    new KeyInfo('▶', null, 4, 12, 1, 1, (kb, ki) => kb.doMove(+1)),
  ];

  private static readonly EN_KEYS: KeyInfo[] = [
    //１段目
    new KeyInfo('1', '!', 0, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('2', '"', 0, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('3', '#', 0, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('4', '$', 0, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('5', '%', 0, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('6', '&', 0, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('7', "'", 0, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('8', '(', 0, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('9', ')', 0, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('0', '0', 0, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('-', '=', 0, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //２段目
    new KeyInfo('q', 'Q', 1, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('w', 'W', 1, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('e', 'E', 1, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('r', 'R', 1, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('t', 'T', 1, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('y', 'Y', 1, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('u', 'U', 1, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('i', 'I', 1, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('o', 'O', 1, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('p', 'P', 1, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('@', '`', 1, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //３段目
    new KeyInfo('a', 'A', 2, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('s', 'S', 2, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('d', 'D', 2, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('f', 'F', 2, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('g', 'G', 2, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('h', 'H', 2, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('j', 'J', 2, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('k', 'K', 2, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('l', 'L', 2, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(';', '+', 2, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(':', '*', 2, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //４段目
    new KeyInfo('z', 'Z', 3, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('x', 'X', 3, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('c', 'C', 3, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('v', 'V', 3, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('b', 'B', 3, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('n', 'N', 3, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('m', 'M', 3, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(',', '<', 3, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('.', '>', 3, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('/', '?', 3, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('\\', '_', 3, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //５段目
    new KeyInfo('^', '~', 4, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(YEN, '|', 4, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(' ', ' ', 4, 2, 1, 7, (kb, ki) => kb.doSpace()),
    new KeyInfo('[', '{', 4, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(']', '}', 4, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //制御ボタン
    new KeyInfo('BS', null, 0, 11, 1, 2, (kb, ki) => kb.doBackspace()),
    new KeyInfo('かな', null, 1, 11, 1, 2, (kb, ki) => kb.doSelect('ja')),
    new KeyInfo('ENTER', null, 2, 11, 1, 2, (kb, ki) => kb.doEnter()),
    new KeyInfo('SHIFT', null, 3, 11, 1, 2, (kb, ki) => kb.doShift()),
    new KeyInfo('◀', null, 4, 11, 1, 1, (kb, ki) => kb.doMove(-1)),
    new KeyInfo('▶', null, 4, 12, 1, 1, (kb, ki) => kb.doMove(+1)),
  ];

  private _owner: UiTextField;

  private _shift: boolean;

  constructor(app: UiApplication, name: string, owner: UiTextField);
  constructor(src: UiKeyboard);
  public constructor(param: any, name?: string, owner?: UiTextField) {
    if (param instanceof UiKeyboard) {
      super(param as UiKeyboard);
      let src = param as UiKeyboard;
      this._owner = src._owner;
      this._shift = src._shift;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiTextField;
      this._shift = false;
    }
  }

  public clone(): UiKeyboard {
    return new UiKeyboard(this);
  }

  protected initialize(): void {
    //処理準備
    let app = this.application;
    //サイズ計算
    let maxWidth = 0;
    let maxHeight = 0;
    for (let k of UiKeyboard.JA_KEYS) {
      let r = k.asRect(KEYTOP_SIZE, KEYTOP_SIZE, KEYTOP_SPACING, KEYTOP_SPACING);
      maxWidth = Math.max(maxWidth, r.right + KEYTOP_SPACING);
      maxHeight = Math.max(maxHeight, r.bottom + KEYTOP_SPACING);
    }
    maxHeight += EDITAREA_HEIGHT + KEYTOP_SPACING; //for input area
    //キーボード作成
    let b = new UiBuilder('1px');
    b.element(this).style(GROUP_STYLE);
    b.belongs((b) => {
      //入力表示領域
      b.element(new UiEditArea(app, 'edit'))
        .position(KEYTOP_SPACING, KEYTOP_SPACING, KEYTOP_SPACING, null, null, EDITAREA_HEIGHT)
        .style(FIELD_STYLE);
      //キーボード領域
      b.element(new UiDeckNode(app, 'deck')).inset(0, KEYTOP_SPACING + EDITAREA_HEIGHT, 0, 0);
      b.belongs((b) => {
        //日本語キーボード領域
        b.element(new UiNode(app, 'ja')).inset(0).style(GROUP_STYLE);
        b.belongs((b) => {
          for (let k of UiKeyboard.JA_KEYS) {
            let r = k.asRect(KEYTOP_SIZE, KEYTOP_SIZE, KEYTOP_SPACING, KEYTOP_SPACING);
            b.element(new UiKeytop(app, k))
              .bounds(r.left, r.top, r.width, r.height)
              .style(KEYTOP_STYLE)
              .focusable(true);
          }
        });
        //英数キーボード領域
        b.element(new UiNode(app, 'en')).inset(0).style(GROUP_STYLE);
        b.belongs((b) => {
          for (let k of UiKeyboard.EN_KEYS) {
            let r = k.asRect(KEYTOP_SIZE, KEYTOP_SIZE, KEYTOP_SPACING, KEYTOP_SPACING);
            b.element(new UiKeytop(app, k))
              .bounds(r.left, r.top, r.width, r.height)
              .style(KEYTOP_STYLE)
              .focusable(true);
          }
        });
      });
    });
    //Popupの表示位置設定
    this.left = '0px';
    this.right = '0px';
    this.bottom = '24px';
    this.width = `${maxWidth}px`;
    this.height = `${maxHeight}px`;
  }

  protected afterMount(): void {
    //初期データ設定
    let value = this._owner.getValue();
    Logs.debug('initial value is %s', value);
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    editArea.reset(this.escapeString(value));
  }

  private escapeString(s: string): string {
    return s.replace(new RegExp(' ', 'g'), NBSP);
  }

  private unescapeString(s: string): string {
    return s.replace(new RegExp(NBSP, 'g'), ' ');
  }

  private doInput(info: KeyInfo): void {
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    editArea.append(this._shift && info.caps != null ? info.caps : info.text);
  }

  private doModify(): void {
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    editArea.modifyLastChar();
  }

  private doSpace(): void {
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    editArea.append(NBSP);
  }

  private doBackspace(): void {
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    editArea.backspace();
  }

  private doSelect(locale: string): void {
    let deck = this.findNodeByPath('deck') as UiDeckNode;
    deck.select(locale);
  }

  private doEnter(): void {
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    let result = editArea.confirm();
    if (result == UiResult.IGNORED) {
      let value = editArea.textContent;
      this._owner.setValue(this.unescapeString(value));
      this.application.dispose(this);
    }
  }

  private doShift(): void {
    this._shift = !this._shift;
    for (let c of this.getDescendantsIf((e) => e instanceof UiKeytop)) {
      (c as UiKeytop).onShiftChanged(this._shift);
    }
  }

  private doMove(dir: number): void {
    let editArea = this.findNodeByPath('edit') as UiEditArea;
    editArea.moveCursor(dir);
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
      case KeyCodes.ESCAPE:
        this.application.dispose(this);
        result |= UiResult.EATEN;
        break;
      default:
        result |= super.onKeyDown(target, key, ch, mod, at);
        break;
    }
    return result;
  }
}
