import { UiNode, UiNodeBuilder, UiPageNode, UiTextButton } from '~/lib/ui';
import { DEFAULT_STYLE, GROUP_STYLE } from '~/app/TestApplication'; //TODO 掟破り！要修正

export class UiLaunchPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiNodeBuilder('1rem');
    b.element(this)
      .style(GROUP_STYLE)
      .inset(1)
      .belongs((b) => {
        //グリッド
        b.element(new UiNode(app, 'group'))
          .position(1, 1, 1, 1, null, null)
          .style(GROUP_STYLE)
          .belongs((b) => {
            const entries = Object.entries(this.application.getPageFactries());
            for (let i = 0; i < entries.length; i++) {
              const [key, value] = entries[i];
              b.element(new UiTextButton(app, 'button' + i))
                .bounds(0, i * 3, 10, 3)
                .style(DEFAULT_STYLE)
                .focusable(true)
                .textContent(key)
                .listen((src, act) => this.application.forwardTo(key, {}));
            }
          });
      });
  }
}
