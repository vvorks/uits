import { UiBuilder, UiPageNode } from '~/lib/ui';
import { UiLottieNode } from '~/lib/ui/UiLottieNode';

export class LottieTestPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1rem');
    b.element(this).inset(1);
    b.belongs((b) => {
      b.element(new UiLottieNode(app, 'svgLottie')).bounds(0, 0, 10, 15);
      b.element(new UiLottieNode(app, 'canvasLottie')).bounds(11, 0, 10, 15);
    });
  }
}
