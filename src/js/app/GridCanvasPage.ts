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
  .fontSize('12pt')
  .lineHeight('1.5')
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
    let b = new UiBuilder('32px');
    b.element(this).inset(0).style(GROUP_STYLE);
    b.belongs((b) => {
      b.element(new UiCanvas(app, 'canvas')).inset(0);
      b.belongs((b) => {
        //行ヘッダ
        b.element(new UiScrollNode(app, 'rowHeader'))
          .position(10, 0, 2, null, null, 1)
          .style(GROUP_STYLE)
          .hscroll('h');
        b.belongs((b) => {
          for (let col = 0; col < COL; col++) {
            b.element(new UiTextNode(app, 'rowHeaderColumn' + col))
              .position(col * 10, 0, null, 0, 10, null)
              .style(DEFAULT_STYLE)
              .textContent(`{{col.${col}}}`)
              .focusable(false);
          }
        });
        //列ヘッダ
        b.element(new UiScrollNode(app, 'colHeader'))
          .position(0, 1, null, 1, 10, null)
          .style(GROUP_STYLE)
          .vscroll('v');
        b.belongs((b) => {
          for (let row = 0; row < ROW; row++) {
            b.element(new UiTextNode(app, 'colHeaderRow' + row))
              .position(0, row, 0, null, null, 1)
              .style(DEFAULT_STYLE)
              .textContent(`{{row.${row}}}`)
              //.imageContent(TEST_DATA)
              //.imageSize('1rem', null)
              .focusable(false);
          }
        });
        //グリッド
        b.element(new UiScrollNode(app, 'grid'))
          .position(10, 1, 2, 2, null, null)
          .style(GROUP_STYLE)
          //.focusLock(true)
          .hscroll('h')
          .vscroll('v');
        b.belongs((b) => {
          for (let row = 0; row < ROW; row++) {
            for (let col = 0; col < COL; col++) {
              b.element(new UiTextNode(app, 'cell' + row + '_' + col))
                .bounds(col * 10, row, 10, 1)
                .style(DEFAULT_STYLE)
                .focusable(true)
                .textContent(`ITEM[${row},${col}]`);
            }
          }
        });
        //垂直スクロールバー
        b.element(new UiScrollbar(app, 'vscroll'))
          .position(null, 1, 0, 1, 1, null)
          .style(SB_STYLE)
          .vscroll('v');
        //水平スクロールバー
        b.element(new UiScrollbar(app, 'hscroll'))
          .position(10, null, 1, 0, null, 1)
          .style(SB_STYLE)
          .hscroll('h');
      });
    });
  }
}
