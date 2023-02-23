import { Colors, UiBuilder, UiPageNode, UiStyleBuilder, UiTextNode } from '~/lib/ui';

const SHORT_NAME_ES = 'Picasso';

const LONG_NAME_ES =
  'Pablo Diego José Francisco de Paula Juan Nepomuceno Cipriano de la Santísima Trinidad Ruiz y Picasso';

const LONG_NAME_JA =
  '寿限無寿限無五劫のすりきれ海砂利水魚の水行末雲来末風来末食う寝るところに住むところ' +
  'やぶらこうじのぶらこうじパイポパイポパイポのシューリンガンシューリンガンのグーリンダイ' +
  'グーリンダイのポンポコピーのポンポコナの長久命の長助';

const SURROGATE_JA =
  'ai𠀋𡈽𡌛𡑮𡢽𡚴𡸴𣇄𣗄𣜿𣝣𣳾𤟱𥒎𥔎𥝱𥧄𥶡𦫿𦹀𧃴𧚄𨉷𨏍𪆐𠂉𠂢𠂤𠆢𠈓𠌫𠎁𠍱𠏹𠑊𠔉𠗖𠘨𠝏' +
  '𠀋𡈽𡌛𡑮𡢽𡚴𡸴𣇄𣗄𣜿𣝣𣳾𤟱𥒎𥔎𥝱𥧄𥶡𦫿𦹀𧃴𧚄𨉷𨏍𪆐𠂉𠂢𠂤𠆢𠈓𠌫𠎁𠍱𠏹𠑊𠔉𠗖𠘨𠝏' +
  '𠀋𡈽𡌛𡑮𡢽𡚴𡸴𣇄𣗄𣜿𣝣𣳾𤟱𥒎𥔎𥝱𥧄𥶡𦫿𦹀𧃴𧚄𨉷𨏍𪆐𠂉𠂢𠂤𠆢𠈓𠌫𠎁𠍱𠏹𠑊𠔉𠗖𠘨𠝏' +
  '𠀋𡈽𡌛𡑮𡢽𡚴𡸴𣇄𣗄𣜿𣝣𣳾𤟱𥒎𥔎𥝱𥧄𥶡𦫿𦹀𧃴𧚄𨉷𨏍𪆐𠂉𠂢𠂤𠆢𠈓𠌫𠎁𠍱𠏹𠑊𠔉𠗖𠘨𠝏';

const TEXT_STYLE = new UiStyleBuilder()
  .fontSize('10.5pt')
  .textAlign('justify')
  .borderSize('2px')
  .borderColor(Colors.BLUE)
  .build();

const TOP_STYLE = new UiStyleBuilder().basedOn(TEXT_STYLE).verticalAlign('top').build();
const MID_STYLE = new UiStyleBuilder().basedOn(TEXT_STYLE).verticalAlign('middle').build();
const BOT_STYLE = new UiStyleBuilder().basedOn(TEXT_STYLE).verticalAlign('bottom').build();

export class TextTestPage extends UiPageNode {
  protected initialize(): void {
    let app = this.application;
    let b = new UiBuilder('1px');
    b.element(this).inset(100);
    b.belongs((b) => {
      //top
      b.element(new UiTextNode(app, 'hello1top'))
        .bounds(0, 0, 200, 64)
        .style(TOP_STYLE)
        //.ellipsis('...')
        .textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello2top'))
        .bounds(0, 80, 200, 64)
        .style(TOP_STYLE)
        .ellipsis('...')
        .textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello3top'))
        .bounds(0, 160, 200, 64)
        .style(TOP_STYLE)
        //.ellipsis('…');
        .textContent(LONG_NAME_JA);
      b.element(new UiTextNode(app, 'hello4top'))
        .bounds(0, 240, 200, 64)
        .style(TOP_STYLE)
        .ellipsis('…')
        .textContent(SURROGATE_JA);

      //middle
      b.element(new UiTextNode(app, 'hello1mid'))
        .bounds(210, 0, 200, 64)
        .style(MID_STYLE)
        //.ellipsis('...')
        .textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello2mid'))
        .bounds(210, 80, 200, 64)
        .style(MID_STYLE)
        .ellipsis('...')
        .textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello3mid'))
        .bounds(210, 160, 200, 64)
        .style(MID_STYLE)
        //.ellipsis('…');
        .textContent(LONG_NAME_JA);
      b.element(new UiTextNode(app, 'hello4mid'))
        .bounds(210, 240, 200, 64)
        .style(MID_STYLE)
        .ellipsis('…')
        .textContent(SURROGATE_JA);

      //bottom
      b.element(new UiTextNode(app, 'hello1bot'))
        .bounds(420, 0, 200, 64)
        .style(BOT_STYLE)
        //.ellipsis('...')
        .textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello2bot'))
        .bounds(420, 80, 200, 64)
        .style(BOT_STYLE)
        .ellipsis('...')
        .textContent(LONG_NAME_ES);
      b.element(new UiTextNode(app, 'hello3bot'))
        .bounds(420, 160, 200, 64)
        .style(BOT_STYLE)
        //.ellipsis('…');
        .textContent(LONG_NAME_JA);
      b.element(new UiTextNode(app, 'hello4bot'))
        .bounds(420, 240, 200, 64)
        .style(BOT_STYLE)
        .ellipsis('…')
        .textContent(SURROGATE_JA);
    });
  }
}
