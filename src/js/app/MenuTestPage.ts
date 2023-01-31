import {
  UiBuilder,
  UiPageNode,
  UiMenu,
  DataSource,
  UiMenuItem,
  UiTextField,
  UiTextNode,
  UiListNode,
  UiNode,
  UiScrollNode,
} from '~/lib/ui';
import { GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE } from '~/app/TestApplication';

export class MenuTestPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(1).style(GROUP_STYLE);
    b.belongs((b) => {
      //content
      b.element(new UiTextNode(app, 'content'))
        .position(4, 1, 1, 15, null, null)
        .style(DEFAULT_STYLE)
        .textContent('content');
      //lists
      b.element(new UiScrollNode(app, 'lists'))
        .style(DEFAULT_STYLE)
        .focusLock(true)
        .scrollHeight(50)
        .position(4, null, 1, 1, null, 13);
      b.belongs((b) => {
        //list1
        b.element(new UiListNode(app, 'list1'))
          .position(0, 0, 0, null, null, 4)
          .style(LIST_STYLE)
          .dataSource('hiroshige')
          .vertical(false)
          .focusLock(true)
          .loop(false);
        b.belongs((b) => {
          b.element(new UiNode(app, 'card')).position(0, 0, null, 0, 4, null);
          b.belongs((b) => {
            b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE).focusable(true);
          });
        });
        //list2
        b.element(new UiListNode(app, 'list2'))
          .position(0, 5, 0, null, null, 4)
          .style(LIST_STYLE)
          .dataSource('hiroshige')
          .vertical(false)
          .focusLock(true)
          .loop(false);
        b.belongs((b) => {
          b.element(new UiNode(app, 'card')).position(0, 0, null, 0, 4, null);
          b.belongs((b) => {
            b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE).focusable(true);
          });
        });
        //list3
        b.element(new UiListNode(app, 'list3'))
          .position(0, 10, 0, null, null, 4)
          .style(LIST_STYLE)
          .dataSource('hiroshige')
          .vertical(false)
          .focusLock(true)
          .loop(false);
        b.belongs((b) => {
          b.element(new UiNode(app, 'card')).position(0, 0, null, 0, 4, null);
          b.belongs((b) => {
            b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE).focusable(true);
          });
        });
      });
      //menu
      b.element(new UiMenu(app, 'menu'))
        .position(1, 1, null, 1, 2, null)
        .style(DEFAULT_STYLE)
        .location('left')
        .extentionSizes(['256px', '0px', '0px', '256px'])
        .dataSource('menu')
        .spacing(1)
        .focusable(true)
        .contentNode('/content');
      b.belongs((b) => {
        b.element(new UiMenuItem(app, 'node'))
          .position(0, 0, 0, null, null, 2)
          .style(DEFAULT_STYLE);
        b.belongs((b) => {
          b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE);
        });
        b.element(new UiMenuItem(app, 'leaf'))
          .position(0, 0, 0, null, null, 2)
          .style(DEFAULT_STYLE);
        b.belongs((b) => {
          b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE);
        });
        b.element(new UiMenuItem(app, 'void')).position(0, 0, 0, null, null, 6).style(GROUP_STYLE);
      });
    });
  }

  protected afterMount(): void {
    let app = this.application;
    //set datasource
    (app.getDataSource('menu') as DataSource).select({ path: '/' });
    (app.getDataSource('hiroshige') as DataSource).select({});
  }
}
