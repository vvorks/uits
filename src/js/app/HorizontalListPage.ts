import {
  DataSource,
  UiCheckbox,
  UiListNode,
  UiNode,
  UiBuilder,
  UiPageNode,
  UiScrollbar,
  UiTextButton,
  UiTextField,
} from '~/lib/ui';
import { GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE } from '~/app/TestApplication';

export class HorizontalListPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(1).style(GROUP_STYLE);
    b.belongs((b) => {
      b.element(new UiTextButton(app, 'north'))
        .position(1, 1, 1, null, null, 2)
        .style(DEFAULT_STYLE)
        .focusable(true)
        .textContent('go vlist')
        .action((src, act) => this.application.forwardTo('vlist', {}));
      b.element(new UiNode(app, 'west'))
        .position(1, 4, null, 4, 2, null)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.element(new UiListNode(app, 'list'))
        .position(4, 4, 4, 5, null, null)
        .style(LIST_STYLE)
        .dataSource('sample')
        .hscroll('h')
        .loop(true)
        .vertical(false);
      b.belongs((b) => {
        b.element(new UiTextField(app, 'a'))
          .bounds(0, 0, 10, 2)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiTextField(app, 'b'))
          .bounds(0, 2, 10, 2)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiTextField(app, 'c'))
          .bounds(0, 4, 10, 2)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiTextField(app, 'd'))
          .position(0, 5, null, 4, 10, null)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiCheckbox(app, 'e'))
          .position(0, null, null, 2, 10, 2)
          .style(DEFAULT_STYLE)
          .focusable(true);
      });
      b.element(new UiScrollbar(app, 'sb'))
        .position(4, null, 4, 4, null, 1)
        .style(SB_STYLE)
        .hscroll('h');
      b.element(new UiNode(app, 'east'))
        .position(null, 4, 1, 4, 2, null)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.element(new UiNode(app, 'south'))
        .position(1, null, 1, 1, null, 2)
        .style(DEFAULT_STYLE)
        .focusable(true);
    });
    (app.getDataSource('sample') as DataSource).select({});
  }
}
