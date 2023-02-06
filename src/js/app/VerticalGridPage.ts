import {
  DataSource,
  UiBuilder,
  UiListNode,
  UiNode,
  UiPageNode,
  UiScrollbar,
  UiTextButton,
  UiTextField,
} from '~/lib/ui';
import { UiGridNode } from '~/lib/ui/UiGridNode';
import { GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE } from '~/app/TestApplication';

export class VerticalGridPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(1).style(GROUP_STYLE);
    b.belongs((b) => {
      b.element(new UiTextButton(app, 'north'))
        .position(1, 1, 1, null, null, 2)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.element(new UiNode(app, 'west'))
        .position(1, 4, null, 4, 2, null)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.element(new UiGridNode(app, 'grid'))
        .position(4, 4, 5, 4, null, null)
        .style(LIST_STYLE)
        .dataSource('sample')
        .vscroll('v')
        .vertical(true)
        .loop(false)
        .outerMargin(false);
      b.belongs((b) => {
        b.element(new UiTextField(app, 'a'))
          .bounds(1, 1, 10, 4)
          .style(DEFAULT_STYLE)
          .focusable(true);
      });
      b.element(new UiScrollbar(app, 'sb'))
        .position(null, 4, 4, 4, 1, null)
        .style(SB_STYLE)
        .vscroll('v');
      b.element(new UiNode(app, 'east'))
        .position(null, 4, 1, 4, 2, null)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.element(new UiTextButton(app, 'south'))
        .position(1, null, 1, 1, null, 2)
        .style(DEFAULT_STYLE)
        .focusable(true);
    });
    (app.getDataSource('sample') as DataSource).select({});
  }
}
