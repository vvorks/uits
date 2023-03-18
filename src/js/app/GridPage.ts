import {
  UiBuilder,
  UiPageNode,
  UiScrollNode,
  UiScrollbar,
  UiTextNode,
  UiStyleBuilder,
  UiStyle,
  Colors,
} from '~/lib/ui';
import { GROUP_STYLE, SB_STYLE } from '~/app/TestApplication';

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

/**
 * 巨大な表形式のページデモ
 */
export class GridPage extends UiPageNode {
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
              .textContent(`ITEM[${row},${col}]`);
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
  }
}
