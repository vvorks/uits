import { Colors } from '~/lib/ui/Colors';
import { KeyCodes } from '~/lib/ui/KeyCodes';
import { Rect } from '~/lib/ui/Rect';
import { GROUP_STYLE, UiApplication } from '~/lib/ui/UiApplication';
import { UiDeckNode } from '~/lib/ui/UiDeckNode';
import { UiNode, UiResult } from '~/lib/ui/UiNode';
import { UiBuilder } from '~/lib/ui/UiBuilder';
import { UiPageNode } from '~/lib/ui/UiPageNode';
import { UiStyle, UiStyleBuilder } from '~/lib/ui/UiStyle';
import { UiTextNode } from '~/lib/ui/UiTextNode';
import { UiEditNode } from './UiEditNode';

const KEYTOP_SIZE = 24;
const KEYTOP_SPACING = 4;
const KKC = false;

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
   * ????????????????????????
   *
   * @returns ??????
   */
  public clone(): UiKeytop {
    return new UiKeytop(this);
  }

  /**
   * ???????????????????????????
   *
   * @param app ????????????????????????
   * @param name ????????????
   */
  constructor(app: UiApplication, info: KeyInfo);

  /**
   * ??????????????????????????????
   *
   * @param src ?????????
   */
  constructor(src: UiKeytop);

  /**
   * ???????????????????????????
   *
   * @param param ?????????????????????
   * @param name ?????????????????????
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
    switch (key | (mod & KeyCodes.MOD_MACS)) {
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

export class UiKeyboard extends UiPageNode {
  private static readonly JA_KEYS: KeyInfo[] = [
    //??????
    new KeyInfo('???', '???', 0, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 2, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 3, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 4, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 5, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 6, 1, 1, (kb, ki) => kb.doInput(ki)),
    //????????????????????????
    new KeyInfo('???', '???', 0, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 7, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 4, 8, 1, 1, (kb, ki) => kb.doInput(ki)),
    //??????
    new KeyInfo('???', '???', 0, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('?????????', null, 4, 9, 1, 2, (kb, ki) => kb.doModify()),
    //??????
    new KeyInfo('???', '???', 0, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 1, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 2, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo('???', '???', 3, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //???????????????
    new KeyInfo('BS', null, 0, 11, 1, 2, (kb, ki) => kb.doBackspace()),
    new KeyInfo('ABC', null, 1, 11, 1, 2, (kb, ki) => kb.doSelect('en')),
    new KeyInfo('ENTER', null, 2, 11, 1, 2, (kb, ki) => kb.doEnter()),
    new KeyInfo('SHIFT', null, 3, 11, 1, 2, (kb, ki) => kb.doShift()),
    new KeyInfo('???', null, 4, 11, 1, 1, (kb, ki) => kb.doMove(-1)),
    new KeyInfo('???', null, 4, 12, 1, 1, (kb, ki) => kb.doMove(+1)),
  ];

  private static readonly EN_KEYS: KeyInfo[] = [
    //?????????
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
    //?????????
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
    //?????????
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
    //?????????
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
    //?????????
    new KeyInfo('^', '~', 4, 0, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(YEN, '|', 4, 1, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(' ', ' ', 4, 2, 1, 7, (kb, ki) => kb.doSpace()),
    new KeyInfo('[', '{', 4, 9, 1, 1, (kb, ki) => kb.doInput(ki)),
    new KeyInfo(']', '}', 4, 10, 1, 1, (kb, ki) => kb.doInput(ki)),
    //???????????????
    new KeyInfo('BS', null, 0, 11, 1, 2, (kb, ki) => kb.doBackspace()),
    new KeyInfo('??????', null, 1, 11, 1, 2, (kb, ki) => kb.doSelect('ja')),
    new KeyInfo('ENTER', null, 2, 11, 1, 2, (kb, ki) => kb.doEnter()),
    new KeyInfo('SHIFT', null, 3, 11, 1, 2, (kb, ki) => kb.doShift()),
    new KeyInfo('???', null, 4, 11, 1, 1, (kb, ki) => kb.doMove(-1)),
    new KeyInfo('???', null, 4, 12, 1, 1, (kb, ki) => kb.doMove(+1)),
  ];

  private _owner: UiEditNode;

  private _shift: boolean;

  constructor(app: UiApplication, name: string, owner: UiEditNode);
  constructor(src: UiKeyboard);
  public constructor(param: any, name?: string, owner?: UiEditNode) {
    if (param instanceof UiKeyboard) {
      super(param as UiKeyboard);
      let src = param as UiKeyboard;
      this._owner = src._owner;
      this._shift = src._shift;
    } else {
      super(param as UiApplication, name as string);
      this._owner = owner as UiEditNode;
      this._shift = false;
    }
  }

  public clone(): UiKeyboard {
    return new UiKeyboard(this);
  }

  protected initialize(): void {
    //????????????
    let app = this.application;
    //???????????????
    let maxWidth = 0;
    let maxHeight = 0;
    for (let k of UiKeyboard.JA_KEYS) {
      let r = k.asRect(KEYTOP_SIZE, KEYTOP_SIZE, KEYTOP_SPACING, KEYTOP_SPACING);
      maxWidth = Math.max(maxWidth, r.right + KEYTOP_SPACING);
      maxHeight = Math.max(maxHeight, r.bottom + KEYTOP_SPACING);
    }
    maxHeight += KEYTOP_SPACING;
    //?????????????????????
    let b = new UiBuilder('1px');
    b.element(this).style(GROUP_STYLE);
    b.belongs((b) => {
      //?????????????????????
      b.element(new UiDeckNode(app, 'deck')).inset(0, KEYTOP_SPACING, 0, 0);
      b.belongs((b) => {
        //??????????????????????????????
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
        //???????????????????????????
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
    //Popup?????????????????????
    this.left = '0px';
    this.right = '0px';
    this.bottom = '24px';
    this.width = `${maxWidth}px`;
    this.height = `${maxHeight}px`;
  }

  private doInput(info: KeyInfo): void {
    let editArea = this._owner;
    editArea.editAppend(this._shift && info.caps != null ? info.caps : info.text);
    if (!KKC) {
      editArea.editConfirm();
    }
  }

  private doModify(): void {
    let editArea = this._owner;
    editArea.editModifyLastChar();
  }

  private doSpace(): void {
    let editArea = this._owner;
    editArea.editAppend(' ');
    if (!KKC) {
      editArea.editConfirm();
    }
  }

  private doBackspace(): void {
    let editArea = this._owner;
    editArea.editBackspace();
  }

  private doSelect(locale: string): void {
    let deck = this.findNodeByPath('deck') as UiDeckNode;
    deck.select(locale);
  }

  private doEnter(): void {
    let editArea = this._owner;
    let result = editArea.editConfirm();
    if (result == UiResult.IGNORED) {
      this.closeKeyboard(true);
    }
  }

  private doShift(): void {
    this._shift = !this._shift;
    for (let c of this.getDescendantsIf((e) => e instanceof UiKeytop)) {
      (c as UiKeytop).onShiftChanged(this._shift);
    }
  }

  private doMove(dir: number): void {
    let editArea = this._owner;
    editArea.editMoveCursor(dir);
  }

  private closeKeyboard(commit: boolean) {
    let editArea = this._owner;
    this.application.dispose(this);
    editArea.editDone(commit);
  }

  public onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.ESCAPE:
        this.closeKeyboard(false);
        result |= UiResult.EATEN;
        break;
      default:
        result |= super.onKeyDown(target, key, ch, mod, at);
        break;
    }
    return result;
  }
}
