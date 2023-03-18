import {
  UiBuilder,
  UiPageNode,
  UiScrollNode,
  UiScrollbar,
  UiTextNode,
  UiStyle,
  UiStyleBuilder,
  Colors,
  UiImageNode,
  UiNode,
} from '~/lib/ui';
import { GROUP_STYLE, SB_STYLE } from '~/app/TestApplication';
import { UiCanvas } from '~/lib/ui/UiCanvas';

export const DEFAULT_STYLE: UiStyle = new UiStyleBuilder()
  .textColor(Colors.BLACK)
  .backgroundColor('rgba(255,255,255,0.5)')
  .borderSize('2px')
  // .borderLeft('0px')
  // .borderTop('4px')
  // .borderRight('8px')
  // .borderBottom('4px')
  .borderRadius('0px')
  // .borderRadiusTopRight('8px')
  // .borderRadiusBottomRight('16px')
  // .borderRadiusBottomLeft('4px')
  .borderColor(Colors.BLUE)
  .fontSize('8pt')
  .lineHeight('1')
  .textAlign('center')
  .verticalAlign('middle')
  .build();

export const FOCUS_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(DEFAULT_STYLE)
  .condition('FOCUS')
  .textColor(Colors.BLUE)
  .borderColor(Colors.RED)
  .build();

const TEST_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAYhJ' +
  'REFUaEPtmV1RxjAQRc+nABwADpAATsABDgAHOAAJOEACSAAF4ADmzpCZTkmT5q9Jmc1LH5qk9+zdJNvJgZ23w871Yw' +
  'C9HTQHRnfgFrgBjjsJ/QIegPul74dS6A4QwAhNANLzp4UAPjtGfi70HThLBfieDOi12KMaQsKigzfIragGA2jsgjng' +
  'AmyLOJBqOiQvgGdPn+FTSOJfgHPgGniaQQwNMBXvdOuw0qHl2rAAPvG7cWCteLkwnAMp4psDuBJbJe+aliq+KYATo4' +
  '9cAjGIHPFNAV5/tz595C0CkSu+KcAV8DjJmyWIEvFNATR5DKJUfHOAEITeuRPWGeXb52OLf5Nt1OeEhKk8KBG/iQNO' +
  '4BxiGtmcyHcpJXwQJeI3dcDnRKn4LgBuYes5L41jC9b3fpNFnCNs7RgDcJGyf+K1OTPrZylkKZSZOlVOYv2kHBUKqD' +
  'X8Azj1TfavLzgErFsR1TgntUKZOI8irxPdezujuXrt74kcy90NoFooMycyBzIDV23Y7h34AUCpeTFLKmKAAAAAAElF' +
  'TkSuQmCC';

/**
 * 巨大な表形式のページデモ(UiCanvas版)
 */
export class GridCanvasPage extends UiPageNode {
  /**
   * ページ初期化
   */
  protected initialize(): void {
    let app = this.application;
    const ROW = 100;
    const COL = 100;
    const WIDTH = 320;
    const HEIGHT = 32;
    const SB = 16;
    let b = new UiBuilder('1px');
    b.element(this).inset(0).style(GROUP_STYLE);
    b.belongs((b) => {
      b.element(new UiCanvas(app, 'canvas')).style(GROUP_STYLE).inset(0);
      b.belongs((b) => {
        //行ヘッダ
        b.element(new UiScrollNode(app, 'rowHeader'))
          .position(WIDTH, 0, SB, null, null, HEIGHT)
          .style(GROUP_STYLE)
          .hscroll('h');
        b.belongs((b) => {
          for (let col = 0; col < COL; col++) {
            b.element(new UiTextNode(app, 'rowHeaderColumn' + col))
              .position(col * WIDTH, 0, null, 0, WIDTH, null)
              .style(DEFAULT_STYLE)
              .textContent(`{{col.${col}}}`)
              .focusable(false);
          }
        });
        //列ヘッダ
        b.element(new UiScrollNode(app, 'colHeader'))
          .position(0, HEIGHT, null, SB, WIDTH, null)
          .style(GROUP_STYLE)
          .vscroll('v');
        b.belongs((b) => {
          for (let row = 0; row < ROW; row++) {
            b.element(new UiTextNode(app, 'colHeaderRow' + row))
              .position(0, row * HEIGHT, 0, null, null, HEIGHT)
              .style(DEFAULT_STYLE)
              .textContent(`{{row.${row}}}`)
              //.imageContent(TEST_DATA)
              //.imageSize('1rem', null)
              .focusable(false);
          }
        });
        //グリッド
        b.element(new UiScrollNode(app, 'grid'))
          .position(WIDTH, HEIGHT, SB, SB, null, null)
          .style(GROUP_STYLE)
          //.focusLock(true)
          .hscroll('h')
          .vscroll('v');
        b.belongs((b) => {
          for (let row = 0; row < ROW; row++) {
            for (let col = 0; col < COL; col++) {
              b.element(new UiTextNode(app, 'cell' + row + '_' + col))
                .bounds(col * WIDTH, row * HEIGHT, WIDTH, HEIGHT)
                .style(DEFAULT_STYLE)
                .focusable(true)
                .ellipsis('…')
                .textContent(`ITEM[${row},${col}]` + TEST_DATA);
            }
          }
        });
        //垂直スクロールバー
        b.element(new UiScrollbar(app, 'vscroll'))
          .position(null, HEIGHT, 0, SB, SB, null)
          .style(SB_STYLE)
          .vscroll('v');
        //水平スクロールバー
        b.element(new UiScrollbar(app, 'hscroll'))
          .position(WIDTH, null, SB, 0, null, SB)
          .style(SB_STYLE)
          .hscroll('h');
      });
    });
  }
}
