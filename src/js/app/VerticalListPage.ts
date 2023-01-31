import {
  DataSource,
  UiCheckbox,
  UiListNode,
  UiLookupField,
  UiNode,
  UiBuilder,
  UiPageNode,
  UiRadio,
  UiScrollbar,
  UiTextField,
  UiDateField,
  UiTextButton,
  UiImageLookupField,
} from '~/lib/ui';
import { GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE, SB_STYLE } from '~/app/TestApplication';

export class VerticalListPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(1).style(GROUP_STYLE);
    b.belongs((b) => {
      b.element(new UiTextButton(app, 'north'))
        .position(1, 1, 1, null, null, 2)
        .style(DEFAULT_STYLE)
        .focusable(true)
        .textContent('go hlist')
        .action((src, act) => this.application.forwardTo('hlist', {}));
      b.element(new UiNode(app, 'west'))
        .position(1, 4, null, 4, 2, null)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.element(new UiListNode(app, 'list'))
        .position(4, 4, 5, 4, null, null)
        .style(LIST_STYLE)
        .dataSource('sample')
        .vscroll('v')
        .loop(true)
        .outerMargin(false);
      b.belongs((b) => {
        b.element(new UiTextField(app, 'a'))
          .bounds(1, 1, 10, 4)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiDateField(app, 'b'))
          .bounds(11, 1, 10, 2)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiLookupField(app, 'c'))
          .bounds(11, 3, 10, 2)
          .style(DEFAULT_STYLE)
          .focusable(true)
          .dataSource('sample2');
        b.element(new UiImageLookupField(app, 'g'))
          .bounds(21, 1, 5, 4)
          .style(DEFAULT_STYLE)
          .focusable(false)
          .lookupTable({
            a: 'hokusai1.jpg',
            b: 'hokusai2.jpg',
            c: 'hokusai3.jpg',
          });
        b.element(new UiTextField(app, 'd'))
          .position(26, 1, 5, null, null, 4)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiCheckbox(app, 'e'))
          .position(null, 1, 1, null, 4, 1)
          .style(DEFAULT_STYLE)
          .focusable(true);
        b.element(new UiRadio(app, 'f1', 1))
          .position(null, 2, 1, null, 4, 1)
          .style(DEFAULT_STYLE)
          .dataField('f')
          .focusable(true);
        b.element(new UiRadio(app, 'f2', 2))
          .position(null, 3, 1, null, 4, 1)
          .style(DEFAULT_STYLE)
          .dataField('f')
          .focusable(true);
        b.element(new UiRadio(app, 'f3', 3))
          .position(null, 4, 1, null, 4, 1)
          .style(DEFAULT_STYLE)
          .dataField('f')
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
        .focusable(true)
        .textContent('restart')
        .action((src, act) => this.application.restartTo('hlist', {}));
    });
    (app.getDataSource('sample') as DataSource).select({});
  }
}
