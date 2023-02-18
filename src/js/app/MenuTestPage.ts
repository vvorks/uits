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
  UiResult,
  DataRecord,
  UiDeckNode,
} from '~/lib/ui';
import { GROUP_STYLE, DEFAULT_STYLE, LIST_STYLE } from '~/app/TestApplication';
import { Asserts, Logs } from '~/lib/lang';

export class MenuTestPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(1).style(GROUP_STYLE);
    b.belongs((b) => {
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
          .focusable(true)
          .action((src, tag, arg) => this.onListClicked(1, tag, arg))
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
          .focusable(true)
          .action((src, tag, arg) => this.onListClicked(2, tag, arg))
          .loop(false);
        b.belongs((b) => {
          b.element(new UiNode(app, 'card')).position(0, 0, null, 0, 4, null);
          b.belongs((b) => {
            b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE).focusable(false);
          });
        });
        //list3
        b.element(new UiListNode(app, 'list3'))
          .position(0, 10, 0, null, null, 4)
          .style(LIST_STYLE)
          .dataSource('hiroshige')
          .vertical(false)
          .focusLock(true)
          .focusable(true)
          .action((src, tag, arg) => this.onListClicked(3, tag, arg))
          .loop(false);
        b.belongs((b) => {
          b.element(new UiNode(app, 'card')).position(0, 0, null, 0, 4, null);
          b.belongs((b) => {
            b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE).focusable(false);
          });
        });
      });
      //content
      b.element(new UiDeckNode(app, 'content'))
        .position(4, 1, 1, 15, null, null)
        .style(DEFAULT_STYLE)
        .focusable(true);
      b.belongs((b) => {
        b.element(new UiNode(app, 'omote')).inset(0).style(DEFAULT_STYLE);
        b.belongs((b) => {
          b.element(new UiTextNode(app, 'title'))
            .inset(2)
            .style(DEFAULT_STYLE)
            .focusable(false)
            .textContent('omote');
        });
        b.element(new UiNode(app, 'ura')).inset(0).style(DEFAULT_STYLE);
        b.belongs((b) => {
          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 2; c++) {
              b.element(new UiTextNode(app, 'test' + r + '_' + c))
                .bounds(2 + c * 22, 2 + r * 6, 20, 4)
                .style(DEFAULT_STYLE)
                .focusable(true)
                .textContent('test' + r + '_' + c);
            }
          }
        });
      });
      //menu
      b.element(new UiMenu(app, 'menu'))
        .position(1, 1, null, 1, 2, null)
        .style(DEFAULT_STYLE)
        .extentionSizes(['256px', '0px', '0px', '256px'])
        .extentionDsNames(['menu', 'menuNext'])
        .spacing(1)
        .focusable(true);
      b.belongs((b) => {
        b.element(new UiMenuItem(app, 'node'))
          .position(0, 0, 0, null, null, 2)
          .style(DEFAULT_STYLE);
        b.belongs((b) => {
          b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE);
        });
        b.element(new UiMenuItem(app, 'leaf'))
          .position(0, 0, 0, null, null, 2)
          .style(DEFAULT_STYLE)
          .action((src, tag, param) => this.onMenuClicked(1, tag, param));
        b.belongs((b) => {
          b.element(new UiTextField(app, 'title')).inset(0).style(DEFAULT_STYLE);
        });
        b.element(new UiMenuItem(app, 'void')).position(0, 0, 0, null, null, 6).style(GROUP_STYLE);
      });
    });
  }

  private onListClicked(no: number, tag: string, arg?: any): UiResult {
    let result = UiResult.IGNORED;
    switch (tag) {
      case 'click':
        let rec = arg as DataRecord;
        Logs.debug('list %d rec %s', no, JSON.stringify(rec));
        result = UiResult.CONSUMED;
        break;
    }
    return result;
  }

  private onMenuClicked(no: number, tag: string, arg?: any): UiResult {
    let result = UiResult.IGNORED;
    switch (tag) {
      case 'select':
        let rec = arg as DataRecord;
        Logs.debug('menu %d rec %s', no, JSON.stringify(rec));
        let contentNode = this.findNodeByPath('content') as UiTextNode;
        contentNode.textContent = rec['content'] as string;
        result = UiResult.CONSUMED;
        break;
    }
    return result;
  }

  protected afterMount(): void {
    let app = this.application;
    //set datasource
    (app.getDataSource('hiroshige') as DataSource).select({});
  }
}
