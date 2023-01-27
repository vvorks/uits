import { UiNodeBuilder, UiPageNode, UiScrollNode, UiScrollbar, UiTextNode } from '~/lib/ui';
import { DEFAULT_STYLE, GROUP_STYLE, SB_STYLE } from '~/app/TestApplication';

/**
 * 巨大な表形式のページデモ
 */
export class GridPage extends UiPageNode {
  /**
   * ページ初期化
   */
  protected initialize(): void {
    let app = this.application;
    const ROW = 30;
    const COL = 30;
    let b = new UiNodeBuilder('1rem');
    b.element(this).inset(1).style(GROUP_STYLE);
    b.belongs((b) => {
      //行ヘッダ
      b.element(new UiScrollNode(app, 'rowHeader'))
        .position(10, 0, 1, null, null, 3)
        .style(GROUP_STYLE)
        .hscroll('h');
      b.belongs((b) => {
        for (let col = 0; col < COL; col++) {
          b.element(new UiTextNode(app, 'rowHeaderColumn' + col))
            .position(col * 10, 0, null, 0, 10, null)
            .style(DEFAULT_STYLE)
            .focusable(false)
            .textContent(`{{col.${col}}}`);
        }
      });
      //列ヘッダ
      b.element(new UiScrollNode(app, 'colHeader'))
        .position(0, 3, null, 1, 10, null)
        .style(GROUP_STYLE)
        .vscroll('v');
      b.belongs((b) => {
        for (let row = 0; row < ROW; row++) {
          b.element(new UiTextNode(app, 'colHeaderRow' + row))
            .position(0, row * 3, 0, null, null, 3)
            .style(DEFAULT_STYLE)
            .focusable(false)
            .textContent(`{{row.${row}}}`);
        }
      });
      //グリッド
      b.element(new UiScrollNode(app, 'grid'))
        .position(10, 3, 1, 1, null, null)
        .style(GROUP_STYLE)
        .hscroll('h')
        .vscroll('v');
      b.belongs((b) => {
        for (let row = 0; row < ROW; row++) {
          for (let col = 0; col < COL; col++) {
            b.element(new UiTextNode(app, 'cell' + row + '_' + col))
              .bounds(col * 10, row * 3, 10, 3)
              .style(DEFAULT_STYLE)
              .focusable(true)
              .textContent(`ITEM[${row},${col}]`);
          }
        }
      });
      //垂直スクロールバー
      b.element(new UiScrollbar(app, 'vscroll'))
        .position(null, 3, 0, 1, 1, null)
        .style(SB_STYLE)
        .vscroll('v');
      //水平スクロールバー
      b.element(new UiScrollbar(app, 'hscroll'))
        .position(10, null, 1, 0, null, 1)
        .style(SB_STYLE)
        .hscroll('h');
    });
  }
}
