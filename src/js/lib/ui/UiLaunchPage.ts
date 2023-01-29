import { UiApplication, UiNode, UiNodeBuilder, UiPageNode, UiTextButton } from '~/lib/ui';
import { DEFAULT_STYLE, GROUP_STYLE } from '~/app/TestApplication'; //TODO 掟破り！要修正

export class UiLaunchPage extends UiPageNode {
  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiLaunchPage {
    return new UiLaunchPage(this);
  }

  /**
   * 通常コンストラクタ
   *
   * @param app アプリケーション
   * @param name ノード名
   */
  constructor(app: UiApplication, name: string);

  /**
   * コピーコンストラクタ
   *
   * @param src 複製元
   */
  constructor(src: UiLaunchPage);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiLaunchPage) {
      super(param as UiLaunchPage);
    } else {
      super(param as UiApplication, name as string);
    }
  }

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
                .action((src, act) => this.application.forwardTo(key, {}));
            }
          });
      });
  }
}
