import { Dates, Formatter, Logs, Properties, Value } from '~/lib/lang';
import {
  UiApplication,
  UiNode,
  UiResult,
  UiStyle,
  UiStyleBuilder,
  DataSource,
  Colors,
  KeyCodes,
  DataRecord,
  COMPONENT_THUMB,
  UiLaunchPage,
  HistoryState,
  PageLayer,
} from '~/lib/ui';
import { GridPage } from '~/app/GridPage';
import { HorizontalListPage } from '~/app/HorizontalListPage';
import { SlidePage } from '~/app/SlidePage';
import { TestDataSource } from '~/app/TestDataSource';
import { VerticalListPage } from '~/app/VerticalListPage';
import { PaneTestPage } from '~/app/PaneTestPage';
import { MenuTestPage } from '~/app/MenuTestPage';
import { MenuDataSource } from '~/app/MenuDataSource';
import { VolumeToast } from '~/app/VolumeToast';

export const DEFAULT_STYLE: UiStyle = new UiStyleBuilder()
  .textColor(Colors.BLACK)
  .backgroundColor(Colors.WHITE)
  .borderSize('2px')
  //.borderRadius("8px")
  .borderColor(Colors.BLUE)
  .fontSize('12pt')
  .lineHeight('1.5')
  .textAlign('center')
  .verticalAlign('middle')
  .build();

export const FOCUS_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(DEFAULT_STYLE)
  .condition('FOCUS')
  .textColor(Colors.BLUE)
  .borderColor(Colors.RED)
  .build();

export const CLICKING_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(FOCUS_STYLE)
  .condition('CLICKING')
  .textColor(Colors.RED)
  .build();

export const GROUP_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.GREEN)
  .borderSize('0px')
  .build();

export const TOAST_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(GROUP_STYLE)
  .backgroundColor(Colors.YELLOW)
  .build();

export const LIST_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.SILVER)
  .borderSize('0px')
  .build();

export const SB_STYLE: UiStyle = new UiStyleBuilder()
  .backgroundColor(Colors.GRAY)
  .borderSize('0px')
  .build();

export const THUMB_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(SB_STYLE)
  .condition('NAMED', COMPONENT_THUMB)
  .backgroundColor(Colors.WHITE)
  .build();

export const IMAGE_STYLE = new UiStyleBuilder().basedOn(DEFAULT_STYLE).textAlign('justify').build();

export const SMALL_STYLE: UiStyle = new UiStyleBuilder()
  .basedOn(DEFAULT_STYLE)
  .fontSize('10pt')
  .build();

export const SMALL_FOCUS: UiStyle = new UiStyleBuilder()
  .basedOn(SMALL_STYLE)
  .condition('FOCUS')
  .textColor(Colors.BLUE)
  .borderColor(Colors.RED)
  .build();

export const SMALL_CLICKING: UiStyle = new UiStyleBuilder()
  .basedOn(SMALL_FOCUS)
  .condition('CLICKING')
  .textColor(Colors.RED)
  .build();

const LONG_NAME_JA =
  '寿限無寿限無五劫のすりきれ海砂利水魚の水行末雲来末風来末食う寝るところに住むところ' +
  'やぶらこうじのぶらこうじパイポパイポパイポのシューリンガンシューリンガンのグーリンダイ' +
  'グーリンダイのポンポコピーのポンポコナの長久命の長助';

const LONG_NAME_ES =
  'Pablo Diego José Francisco de Paula Juan Nepomuceno Cipriano de la Santísima Trinidad Ruiz y Picasso';

const CITIES = [
  '日本橋',
  '品川宿',
  '川崎宿',
  '神奈川宿',
  '保土ヶ谷宿',
  '戸塚宿',
  '藤沢宿',
  '平塚宿',
  '大磯宿',
  '小田原宿',
  '箱根宿',
  '三島宿',
  '沼津宿',
  '原宿',
  '吉原宿',
  '蒲原宿',
  '由比宿',
  '興津宿',
  '江尻宿',
  '府中宿',
  '鞠子宿',
  '岡部宿',
  '藤枝宿',
  '島田宿',
  '金谷宿',
  '日坂宿',
  '掛川宿',
  '袋井宿',
  '見付宿',
  '浜松宿',
  '舞坂宿',
  '新居宿',
  '白須賀宿',
  '二川宿',
  '吉田宿',
  '御油宿',
  '赤坂宿',
  '藤川宿',
  '岡崎宿',
  '池鯉鮒宿',
  '鳴海宿',
  '宮宿',
  '桑名宿',
  '四日市宿',
  '石薬師宿',
  '庄野宿',
  '亀山宿',
  '関宿',
  '坂下宿',
  '土山宿',
  '水口宿',
  '石部宿',
  '草津宿',
  '大津宿',
  '三条大橋',
];

export class TestApplication extends UiApplication {
  private _datas: number[] = [40, 4, 14, 2, 30];

  private _pos: number = 0;

  protected initialize(at: number): void {
    this.addPageFactory('', (tag) => new UiLaunchPage(this, tag));
    this.addPageFactory('vlist', (tag) => new VerticalListPage(this, tag));
    this.addPageFactory('hlist', (tag) => new HorizontalListPage(this, tag));
    this.addPageFactory('grid', (tag) => new GridPage(this, tag));
    this.addPageFactory('slide', (tag) => new SlidePage(this, tag));
    this.addPageFactory('pane', (tag) => new PaneTestPage(this, tag));
    this.addPageFactory('menu', (tag) => new MenuTestPage(this, tag));
    this.addPageFactory('volume', (tag) => new VolumeToast(this, tag));

    this.addDataSource(
      'sample',
      new TestDataSource((criteria: Properties<Value>) => {
        let theData: DataRecord[] = [];
        let date = new Date();
        for (let i = 0; i < this._datas[this._pos]; i++) {
          theData.push({
            a: i,
            b: date.getTime(),
            c: {
              key: '1',
              title: '時政',
            },
            d: i % 2 == 0 ? LONG_NAME_JA : LONG_NAME_ES,
            e: false,
            f: (i % 3) + 1,
            g: 'abc'.charAt(i % 3),
          });
          date = Dates.getNextMonth(date);
        }
        this._pos = (this._pos + 1) % this._datas.length;
        return theData;
      })
    );

    this.addDataSource(
      'sample2',
      new TestDataSource((criteria: Properties<Value>) => {
        let theData: DataRecord[] = [];
        theData.push({ key: '1', title: '時政' });
        theData.push({ key: '2', title: '義時' });
        theData.push({ key: '3', title: '泰時' });
        theData.push({ key: '4', title: '経時' });
        theData.push({ key: '5', title: '時頼' });
        theData.push({ key: '6', title: '長時' });
        theData.push({ key: '7', title: '政村' });
        theData.push({ key: '8', title: '時宗' });
        return theData;
      })
    );

    this.addDataSource(
      'hokusai',
      new TestDataSource((criteria: Properties<Value>) => {
        let images = [
          '/images/dummy_mv01_sp.png',
          '/images/dummy_mv01.png',
          '/images/dummy_mv02_sp.png',
          '/images/dummy_mv02.png',
          '/images/dummy.png',
        ];
        let theData: DataRecord[] = [];
        for (let i = 0; i < 5; i++) {
          theData.push({
            a: 'Aでーす' + '[' + i + ']',
            b: 'Bでーす' + '[' + i + ']',
            c: 'Cでーす' + '[' + i + ']',
            d: 'Dでーす' + '[' + i + ']',
            e: images[i],
            f: 'Fでーす' + '[' + i + ']',
            g: 'Gでーす' + '[' + i + ']',
            h: 'Hでーす' + '[' + i + ']',
            i: 'Iでーす' + '[' + i + ']',
          });
        }
        return theData;
      })
    );

    this.addDataSource(
      'hiroshige',
      new TestDataSource((criteria: Properties<Value>) => {
        let theData: DataRecord[] = [];
        for (let s of CITIES) {
          theData.push({ title: s });
        }
        return theData;
      })
    );

    this.addDataSource('menu', new MenuDataSource());

    //this.testFormatter();
  }

  protected onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result: UiResult = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_ACS)) {
      case KeyCodes.KEY_Q | KeyCodes.MOD_CTRL:
        (this.getDataSource('sample') as DataSource).select({});
        break;
      case KeyCodes.PAGEUP:
      case KeyCodes.PAGEDOWN:
        //TODO 仮
        result =
          this.popup(new HistoryState('volume', {}), PageLayer.HIGH) != null
            ? UiResult.EATEN
            : UiResult.IGNORED;
        break;
      default:
        result = super.onKeyDown(target, key, ch, mod, at);
        break;
    }
    return result;
  }

  private checkFormat(expected: string | null, format: string, value: Date | Value) {
    let result = new Formatter(format).format(value);
    if (expected == null || expected == result) {
      Logs.info("format('%s', %s) is '%s'", format, value, result);
    } else {
      Logs.error("format('%s', %s) is '%s' (not '%s')", format, value, result, expected);
    }
  }

  private testFormatter(): void {
    let now = new Date();
    //binary
    this.checkFormat('   1', '%4b', 1);
    this.checkFormat('0010', '%04b', 2);
    this.checkFormat('11  ', '%-4b', 3);
    this.checkFormat('100', '%b', 4);
    this.checkFormat('101', '%b', '5');
    this.checkFormat('110', '%b', '6.2');
    this.checkFormat('111', '%b', 7.12);
    this.checkFormat(now.getTime().toString(2), '%b', now);
    this.checkFormat('0', '%b', null);
    //octal
    this.checkFormat('   1', '%4o', 1);
    this.checkFormat('0002', '%04o', 2);
    this.checkFormat('3   ', '%-4o', 3);
    this.checkFormat('4', '%o', 4);
    this.checkFormat('5', '%o', '5');
    this.checkFormat('6', '%o', '6.2');
    this.checkFormat('7', '%o', 7.12);
    this.checkFormat(now.getTime().toString(8), '%o', now);
    this.checkFormat('0', '%o', null);
    //decimal(simple)
    this.checkFormat('   1', '%4d', 1);
    this.checkFormat('0002', '%04d', 2);
    this.checkFormat('3   ', '%-4d', 3);
    this.checkFormat('4', '%d', 4);
    this.checkFormat('5', '%d', '5');
    this.checkFormat('6.2', '%d', '6.2');
    this.checkFormat('7.12', '%d', 7.12);
    this.checkFormat(now.getTime().toString(10), '%d', now);
    this.checkFormat('0', '%d', null);
    //hexadecimal
    this.checkFormat('   1', '%4x', 1);
    this.checkFormat('0002', '%04x', 2);
    this.checkFormat('3   ', '%-4x', 3);
    this.checkFormat('4', '%x', 4);
    this.checkFormat('5', '%x', '5');
    this.checkFormat('6', '%x', '6.2');
    this.checkFormat('7', '%x', 7.12);
    this.checkFormat(now.getTime().toString(16), '%x', now);
    this.checkFormat('0', '%x', null);
    //string
    this.checkFormat('   1', '%4s', '1');
    this.checkFormat('   2', '%04s', '2');
    this.checkFormat('3   ', '%-4s', '3');
    this.checkFormat('4', '%s', '4');
    this.checkFormat('5', '%s', 5);
    this.checkFormat('6.2', '%s', '6.2');
    this.checkFormat('7.12', '%s', 7.12);
    this.checkFormat('@', '%s', '@');
    this.checkFormat('null', '%s', null);
    this.checkFormat('abcHELLOdef', 'abc%sdef', 'HELLO');
    this.checkFormat('123-4567', '%3s-%4s', '1234567');
    this.checkFormat('123-45', '%3s-%4s', '12345');
    this.checkFormat('123', '%3s-%4s', '123');
    //char
    this.checkFormat('abc@def', 'abc%cdef', 0x40);
    this.checkFormat('abcあdef', 'abc%cdef', 0x3042);
    //decimal(ja)
    this.checkFormat('1,234,567', '%,7d', +1234567);
    this.checkFormat('1,234,567', '%,07d', +1234567);
    this.checkFormat('1,234,567', '%,-7d', +1234567);
    this.checkFormat('-1,234,567', '%,7d', -1234567);
    this.checkFormat('-1,234,567', '%,07d', -1234567);
    this.checkFormat('-1,234,567', '%,-7d', -1234567);

    this.checkFormat('+1,234,567', '%,+7d', +1234567);
    this.checkFormat('+1,234,567', '%,+07d', +1234567);
    this.checkFormat('+1,234,567', '%,+-7d', +1234567);
    this.checkFormat('-1,234,567', '%,+7d', -1234567);
    this.checkFormat('-1,234,567', '%,+07d', -1234567);
    this.checkFormat('-1,234,567', '%,+-7d', -1234567);

    this.checkFormat(' +1,234,567', '%,+8d', +1234567);
    this.checkFormat('+01,234,567', '%,+08d', +1234567);
    this.checkFormat('+1,234,567 ', '%-,+8d', +1234567);
    this.checkFormat(' -1,234,567', '%,+8d', -1234567);
    this.checkFormat('-01,234,567', '%,+08d', -1234567);
    this.checkFormat('-1,234,567 ', '%-,+8d', -1234567);
    this.checkFormat('  ¥1,234,567', '%, ¤8d', +1234567);
    this.checkFormat(' ¥01,234,567', '%, ¤08d', +1234567);
    this.checkFormat(' ¥1,234,567 ', '%-, ¤8d', +1234567);
    this.checkFormat(' -¥1,234,567', '%, ¤8d', -1234567);
    this.checkFormat('-¥01,234,567', '%, ¤08d', -1234567);
    this.checkFormat('-¥1,234,567 ', '%-, ¤8d', -1234567);
    this.checkFormat(' $1,234,567.12', '%, $8d', +1234567.123);
    this.checkFormat(' $01,234,567.46', '%, $08d', +1234567.456);
    this.checkFormat(' $1,234,567.00', '%-, $8d', +1234567);
    this.checkFormat('-$1,234,567.00', '%, $8d', -1234567);
    this.checkFormat('-$01,234,567.00', '%, $08d', -1234567);
    this.checkFormat('-$1,234,567.00', '%-, $8d', -1234567);
    this.checkFormat('  ¥1,234,567', '%, ¥8d', +1234567);
    this.checkFormat(' ¥01,234,567', '%, ¥08d', +1234567);
    this.checkFormat(' ¥1,234,567 ', '%-, ¥8d', +1234567);
    this.checkFormat(' -¥1,234,567', '%, ¥8d', -1234567);
    this.checkFormat('-¥01,234,567', '%, ¥08d', -1234567);
    this.checkFormat('-¥1,234,567 ', '%-, ¥8d', -1234567);
    this.checkFormat(' €1,234,567.12', '%, €8d', +1234567.123);
    this.checkFormat(' €01,234,567.46', '%, €08d', +1234567.456);
    this.checkFormat(' €1,234,567.00', '%-, €8d', +1234567);
    this.checkFormat('-€1,234,567.00', '%, €8d', -1234567);
    this.checkFormat('-€01,234,567.00', '%, €08d', -1234567);
    this.checkFormat('-€1,234,567.00', '%-, €8d', -1234567);
    this.checkFormat(' £1,234,567.12', '%, £8d', +1234567.123);
    this.checkFormat(' £01,234,567.46', '%, £08d', +1234567.456);
    this.checkFormat(' £1,234,567.00', '%-, £8d', +1234567);
    this.checkFormat('-£1,234,567.00', '%, £8d', -1234567);
    this.checkFormat('-£01,234,567.00', '%, £08d', -1234567);
    this.checkFormat('-£1,234,567.00', '%-, £8d', -1234567);
    this.checkFormat('+1,234,567.123', '%,+7.3d', +1234567.1234);
    this.checkFormat('+1,234,567.568', '%,+07.3d', +1234567.5678);
    this.checkFormat('+1,234,567.123', '%-,+7.3d', +1234567.1234);
    this.checkFormat('-1,234,567.568', '%,+7.3d', -1234567.5678);
    this.checkFormat('-1,234,567.123', '%,+07.3d', -1234567.1234);
    this.checkFormat('-1,234,567.568', '%-,+7.3d', -1234567.5678);
    this.checkFormat(' +1,234,567.123', '%,+8.3d', +1234567.1234);
    this.checkFormat('+01,234,567.568', '%,+08.3d', +1234567.5678);
    this.checkFormat('+1,234,567.123 ', '%-,+8.3d', +1234567.1234);
    this.checkFormat(' -1,234,567.568', '%,+8.3d', -1234567.5678);
    this.checkFormat('-01,234,567.123', '%,+08.3d', -1234567.1234);
    this.checkFormat('-1,234,567.568 ', '%-,+8.3d', -1234567.5678);
    //date
    let d = this.time(2020, 2, 3, 14, 5, 6, 789);
    this.checkFormat('2020/02/03(月)', '%Y/%02m/%02D(%A)', d);
    this.checkFormat('2020年2月3日(月)', '%Y年%m月%D日(%+A)', d);
    this.checkFormat('R02.02.03(月)', '%G%#02Y.%02m.%02D(%A)', d);
    this.checkFormat('令和2年2月3日(月曜日)', '%+G%#Y年%m月%D日(%++A)', d);
    this.checkFormat('14:5:6', '%H:%M:%S', d);
    this.checkFormat('14:05:06', '%02H:%02M:%02S', d);
    this.checkFormat('PM 02:05:06', '%P %02H:%02M:%02S', d);
    this.checkFormat('午後 02:05:06', '%+P %02H:%02M:%02S', d);
    this.checkFormat('昼 02:05:06', '%++P %02H:%02M:%02S', d);
    this.checkFormat('昼 02:05:06', '%+++P %02H:%02M:%02S', d);
    this.checkFormat('  14時   5分   6秒', '%4H時%4M分%4S秒', d);
    this.checkFormat('14:05:06.7', '%02H:%02M:%02S.%1L', d);
    this.checkFormat('14:05:06.78', '%02H:%02M:%02S.%2L', d);
    this.checkFormat('14:05:06.789', '%02H:%02M:%02S.%3L', d);
    this.checkFormat('14:05:06.789+09:00', '%02H:%02M:%02S.%3L%Z', d);
    this.checkFormat('14:05:06.789JST', '%02H:%02M:%02S.%3L%+Z', d);
    this.checkFormat('14:05:06.789 日本標準時', '%02H:%02M:%02S.%3L %++Z', d);
    this.checkFormat('2020-02-03T14:05:06.789+09:00', '%04Y-%02m-%02DT%02H:%02M:%02S.%3L%Z', d);
    this.checkFormat('2020/02/03', '%F', d);
    this.checkFormat('14:05', '%T', d);
    this.checkFormat('2020/02/03 14:05', '%F %T', d);
    this.checkFormat('2020/02/03 14:05:06', '%+F %+T', d);
    this.checkFormat('2020年2月3日 14:05:06 JST', '%++F %++T', d);
    this.checkFormat('2020年2月3日月曜日 14時05分06秒 日本標準時', '%+++F %+++T', d);
    this.checkFormat('R2/2/3 14:05', '%#F %T', d);
    this.checkFormat('令和2年2月3日 14:05:06', '%#+F %+T', d);
    this.checkFormat('令和2年2月3日 14:05:06 JST', '%#++F %++T', d);
    this.checkFormat('令和2年2月3日月曜日 14時05分06秒 日本標準時', '%#+++F %+++T', d);
    this.checkFormat('慶応4年9月7日(月曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1868, 9, 7));
    this.checkFormat('明治元年9月8日(火曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1868, 9, 8));
    this.checkFormat('明治45年7月29日(月曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1912, 7, 29));
    this.checkFormat('大正元年7月30日(火曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1912, 7, 30));
    this.checkFormat('大正15年12月24日(金曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1926, 12, 24));
    this.checkFormat('昭和元年12月25日(土曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1926, 12, 25));
    this.checkFormat('昭和64年1月7日(土曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1989, 1, 7));
    this.checkFormat('平成元年1月8日(日曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(1989, 1, 8));
    this.checkFormat('平成31年4月30日(火曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(2019, 4, 30));
    this.checkFormat('令和元年5月1日(水曜日)', '%+G%#Y年%m月%D日(%++A)', this.date(2019, 5, 1));
  }

  private date(y: number, m: number, d: number): Date {
    return new Date(y, m - 1, d);
  }

  private time(y: number, m: number, d: number, H: number, M: number, S: number, Z: number): Date {
    let temp = new Date(y, m - 1, d, H, M, S);
    return new Date(temp.getTime() + Z);
  }
}
