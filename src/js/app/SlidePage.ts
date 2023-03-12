import {
  DataSource,
  UiImageField,
  UiListNode,
  UiNode,
  UiBuilder,
  UiPageNode,
  UiResult,
  UiTextField,
  UiTextNode,
  UiIndicatorList,
  UiStyleBuilder,
  UiStyle,
  Colors,
  UiIndicatorNode,
} from '~/lib/ui';
import { DEFAULT_STYLE, GROUP_STYLE, IMAGE_STYLE, LIST_STYLE } from '~/app/TestApplication';
import { UiArcIndicatorNode } from '~/lib/ui/UiArcIndicatorNode';

const IND_LIST_STYLE: UiStyle = new UiStyleBuilder().backgroundColor(Colors.BLACK).build();

const IND_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(IND_LIST_STYLE)
  .condition('NAMED', UiIndicatorList.INDICATOR_NAME)
  .backgroundColor(Colors.SILVER)
  .borderRadius('1rem')
  .build();

const IND_ON_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(IND_STYLE)
  .condition('NAMED', UiIndicatorNode.ON_NAME)
  .backgroundColor(Colors.ORANGE)
  .build();

export const OUTER_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.TRANSPARENT)
  .borderSize('0px')
  .build();

export const ARC_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(OUTER_STYLE)
  .condition('NAMED', UiArcIndicatorNode.ARC_NAME)
  .borderSize('16px')
  .borderColor(Colors.BLACK)
  .build();

export const ARC_ON_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(ARC_STYLE)
  .condition('NAMED', UiArcIndicatorNode.ON_NAME)
  .borderSize('16px')
  .borderColor(Colors.ORANGE)
  .build();

export class SlidePage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(0).style(GROUP_STYLE);
    b.belongs((b) => {
      b.element(new UiTextNode(app, 'label'))
        .position(1, 1, 1, null, null, 2)
        .style(DEFAULT_STYLE)
        .focusable(true)
        .textContent('自動的にスライドします');
      b.element(new UiListNode(app, 'list'))
        .position(1, 4, 1, 1, null, null)
        .style(LIST_STYLE)
        .dataSource('playlist')
        .hscroll('content')
        .vertical(false)
        .loop(true);
      b.belongs((b) => {
        b.element(new UiNode(app, 'card')).inset(0);
        b.belongs((b) => {
          b.element(new UiTextField(app, 'title'))
            .position(1, 1, null, null, 10, 2)
            .style(DEFAULT_STYLE);
          b.element(new UiTextField(app, 'duration'))
            .position(12, 1, 12, null, null, 2)
            .style(DEFAULT_STYLE);
          b.element(new UiTextField(app, 'c'))
            .position(null, 1, 1, null, 10, 2)
            .style(DEFAULT_STYLE);
          b.element(new UiTextField(app, 'd'))
            .position(1, 4, null, 4, 10, null)
            .style(DEFAULT_STYLE);
          b.element(new UiImageField(app, 'e'))
            .position(12, 4, 12, 4, null, null)
            .style(IMAGE_STYLE);
          b.element(new UiTextField(app, 'f'))
            .position(null, 4, 1, 4, 10, null)
            .style(DEFAULT_STYLE);
          b.element(new UiTextField(app, 'g'))
            .position(1, null, null, 1, 10, 2)
            .style(DEFAULT_STYLE);
          b.element(new UiTextField(app, 'h'))
            .position(12, null, 12, 1, null, 2)
            .style(DEFAULT_STYLE);
          b.element(new UiTextField(app, 'i'))
            .position(null, null, 1, 1, 10, 2)
            .style(DEFAULT_STYLE);
        });
      });
      b.element(new UiIndicatorList(app, 'ind'))
        .position(14, 9, null, null, 20, 2)
        .hscroll('content')
        .tscroll('playing')
        .margin('4px')
        .outerMargin(true)
        .zoomRatio(2)
        .style(IND_LIST_STYLE);
      b.element(new UiArcIndicatorNode(app, 'arcIndicator'))
        .position(0, 0, 0, 0, 10, 10)
        .tscroll('playing')
        .style(OUTER_STYLE);
    });
    let ds = app.getDataSource('playlist') as DataSource;
    ds.select({});
  }
}
