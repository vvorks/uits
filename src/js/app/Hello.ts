import { UiBuilder, UiPageNode, UiTextNode } from '~/lib/ui';

const LONG_NAME_JA =
  '寿限無寿限無五劫のすりきれ海砂利水魚の水行末雲来末風来末食う寝るところに住むところ' +
  'やぶらこうじのぶらこうじパイポパイポパイポのシューリンガンシューリンガンのグーリンダイ' +
  'グーリンダイのポンポコピーのポンポコナの長久命の長助';

const LONG_NAME_ES =
  'Pablo Diego José Francisco de Paula Juan Nepomuceno Cipriano de la Santísima Trinidad Ruiz y Picasso';

export class Hello extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1px');
    b.element(this).inset(1);
    b.belongs((b) => {
      b.element(new UiTextNode(app, 'hello')).bounds(0, 0, 200, 80).textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello')).bounds(0, 80, 200, 80).textContent(LONG_NAME_JA);
    });
  }
}
