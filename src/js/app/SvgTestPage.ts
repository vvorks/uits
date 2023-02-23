import { Colors, UiBuilder, UiNode, UiPageNode, UiResult, UiStyle, UiStyleBuilder } from '~/lib/ui';
import { UiArcIndicatorNode } from '~/lib/ui/UiArcIndicatorNode';
import { UiHtmlNode } from '~/lib/ui/UiHtmlNode';
import { DEFAULT_STYLE, GROUP_STYLE } from './TestApplication';

export const OUTER_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.TRANSPARENT)
  .borderSize('0px')
  .build();

export const ARC_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(OUTER_STYLE)
  .condition('NAMED', UiArcIndicatorNode.ARC_NAME)
  .borderSize('16px')
  .borderColor(Colors.RED)
  .build();

export class SvgTestPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1px');
    b.element(this).inset(16);
    b.belongs((b) => {
      b.element(new UiNode(app, 'box')).style(GROUP_STYLE).bounds(0, 0, 400, 400);
      b.element(new UiArcIndicatorNode(app, 'indicator')).style(OUTER_STYLE).bounds(0, 0, 400, 400);
    });
    const indicator = this.findNodeByPath('indicator') as UiArcIndicatorNode;
    app.runInterval(this, 1, 1000, () => {
      let v = indicator.indicatorValue + 0.1;
      if (v > 1.0) {
        v = 0;
      }
      indicator.indicatorValue = v;
      return UiResult.AFFECTED;
    });
  }
}
