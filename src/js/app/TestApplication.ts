import { Dates, Formatter, Logs, Properties, Value } from '~/lib/lang';
import {
  UiNode,
  UiResult,
  UiStyle,
  UiStyleBuilder,
  DataSource,
  Colors,
  KeyCodes,
  DataRecord,
  HistoryState,
  PageLayers,
} from '~/lib/ui';
import { GridPage } from '~/app/GridPage';
import { HorizontalListPage } from '~/app/HorizontalListPage';
import { SlidePage } from '~/app/SlidePage';
import { TestDataSource } from '~/app/TestDataSource';
import { VerticalListPage } from '~/app/VerticalListPage';
import { PaneTestPage } from '~/app/PaneTestPage';
import { MenuDataSource } from '~/app/MenuDataSource';
import { VolumeToast } from '~/app/VolumeToast';
import { UiApplication } from '~/lib/ui/UiApplication';
import { VerticalGridPage } from './VerticalGridPage';
import { LottieTestPage } from './LottieTestPage';
import { TextTestPage } from './TextTestPage';
import { SvgTestPage } from './SvgTestPage';
import { GridCanvasPage } from './GridCanvasPage';
import { UiLaunchPage } from '~/lib/ui/UiLaunchPage';

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
  .condition('NAMED', 'thumb')
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
  '???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????' +
  '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????' +
  '??????????????????????????????????????????????????????????????????????????????';

const LONG_NAME_ES =
  'Pablo Diego Jos?? Francisco de Paula Juan Nepomuceno Cipriano de la Sant??sima Trinidad Ruiz y Picasso';

const CITIES = [
  '?????????',
  '?????????',
  '?????????',
  '????????????',
  '???????????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '????????????',
  '?????????',
  '?????????',
  '?????????',
  '??????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '????????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '????????????',
  '?????????',
  '??????',
  '?????????',
  '????????????',
  '????????????',
  '?????????',
  '?????????',
  '??????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '?????????',
  '????????????',
];

export class TestApplication extends UiApplication {
  private _datas: number[] = [400, 40, 140, 20, 300];

  private _pos: number = 0;

  protected initialize(at: number): void {
    this.addPageFactory('', (tag) => new UiLaunchPage(this, tag));
    this.addPageFactory('grid', (tag) => new GridPage(this, tag));
    this.addPageFactory('cgrid', (tag) => new GridCanvasPage(this, tag));
    this.addPageFactory('text', (tag) => new TextTestPage(this, tag));
    this.addPageFactory('svg', (tag) => new SvgTestPage(this, tag));
    this.addPageFactory('lottie', (tag) => new LottieTestPage(this, tag));
    this.addPageFactory('vlist', (tag) => new VerticalListPage(this, tag));
    this.addPageFactory('hlist', (tag) => new HorizontalListPage(this, tag));
    this.addPageFactory('vgrid', (tag) => new VerticalGridPage(this, tag));
    this.addPageFactory('grid', (tag) => new GridPage(this, tag));
    this.addPageFactory('slide', (tag) => new SlidePage(this, tag));
    this.addPageFactory('pane', (tag) => new PaneTestPage(this, tag));
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
              title: '??????',
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
        theData.push({ key: '1', title: '??????' });
        theData.push({ key: '2', title: '??????' });
        theData.push({ key: '3', title: '??????' });
        theData.push({ key: '4', title: '??????' });
        theData.push({ key: '5', title: '??????' });
        theData.push({ key: '6', title: '??????' });
        theData.push({ key: '7', title: '??????' });
        theData.push({ key: '8', title: '??????' });
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
            a: 'A?????????' + '[' + i + ']',
            b: 'B?????????' + '[' + i + ']',
            c: 'C?????????' + '[' + i + ']',
            d: 'D?????????' + '[' + i + ']',
            e: images[i],
            f: 'F?????????' + '[' + i + ']',
            g: 'G?????????' + '[' + i + ']',
            h: 'H?????????' + '[' + i + ']',
            i: 'I?????????' + '[' + i + ']',
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
    this.addDataSource('menuNext', new MenuDataSource());

    this.addDataSource(
      'playlist',
      new TestDataSource((criteria: Properties<Value>) => {
        let theData: DataRecord[] = [];
        theData.push({ title: '?????????????????????', duration: 3 * 1000 });
        theData.push({ title: '??????????????????', duration: 4 * 1000 });
        theData.push({ title: '???????????????', duration: 5 * 1000 });
        theData.push({ title: '??????????????????', duration: 6 * 1000 });
        return theData;
      })
    );

    //this.testFormatter();
  }

  protected onKeyDown(target: UiNode, key: number, ch: number, mod: number, at: number): UiResult {
    let result: UiResult = UiResult.IGNORED;
    switch (key | (mod & KeyCodes.MOD_MACS)) {
      case KeyCodes.KEY_Q | KeyCodes.MOD_CTRL:
        (this.getDataSource('sample') as DataSource).select({});
        break;
      case KeyCodes.PAGEUP:
      case KeyCodes.PAGEDOWN:
        //TODO ???
        result =
          this.popup(new HistoryState('volume', {}), PageLayers.HIGH) != null
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
    this.checkFormat('abc???def', 'abc%cdef', 0x3042);
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
    this.checkFormat('  ??1,234,567', '%, ??8d', +1234567);
    this.checkFormat(' ??01,234,567', '%, ??08d', +1234567);
    this.checkFormat(' ??1,234,567 ', '%-, ??8d', +1234567);
    this.checkFormat(' -??1,234,567', '%, ??8d', -1234567);
    this.checkFormat('-??01,234,567', '%, ??08d', -1234567);
    this.checkFormat('-??1,234,567 ', '%-, ??8d', -1234567);
    this.checkFormat(' $1,234,567.12', '%, $8d', +1234567.123);
    this.checkFormat(' $01,234,567.46', '%, $08d', +1234567.456);
    this.checkFormat(' $1,234,567.00', '%-, $8d', +1234567);
    this.checkFormat('-$1,234,567.00', '%, $8d', -1234567);
    this.checkFormat('-$01,234,567.00', '%, $08d', -1234567);
    this.checkFormat('-$1,234,567.00', '%-, $8d', -1234567);
    this.checkFormat('  ??1,234,567', '%, ??8d', +1234567);
    this.checkFormat(' ??01,234,567', '%, ??08d', +1234567);
    this.checkFormat(' ??1,234,567 ', '%-, ??8d', +1234567);
    this.checkFormat(' -??1,234,567', '%, ??8d', -1234567);
    this.checkFormat('-??01,234,567', '%, ??08d', -1234567);
    this.checkFormat('-??1,234,567 ', '%-, ??8d', -1234567);
    this.checkFormat(' ???1,234,567.12', '%, ???8d', +1234567.123);
    this.checkFormat(' ???01,234,567.46', '%, ???08d', +1234567.456);
    this.checkFormat(' ???1,234,567.00', '%-, ???8d', +1234567);
    this.checkFormat('-???1,234,567.00', '%, ???8d', -1234567);
    this.checkFormat('-???01,234,567.00', '%, ???08d', -1234567);
    this.checkFormat('-???1,234,567.00', '%-, ???8d', -1234567);
    this.checkFormat(' ??1,234,567.12', '%, ??8d', +1234567.123);
    this.checkFormat(' ??01,234,567.46', '%, ??08d', +1234567.456);
    this.checkFormat(' ??1,234,567.00', '%-, ??8d', +1234567);
    this.checkFormat('-??1,234,567.00', '%, ??8d', -1234567);
    this.checkFormat('-??01,234,567.00', '%, ??08d', -1234567);
    this.checkFormat('-??1,234,567.00', '%-, ??8d', -1234567);
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
    this.checkFormat('2020/02/03(???)', '%Y/%02m/%02D(%A)', d);
    this.checkFormat('2020???2???3???(???)', '%Y???%m???%D???(%+A)', d);
    this.checkFormat('R02.02.03(???)', '%G%#02Y.%02m.%02D(%A)', d);
    this.checkFormat('??????2???2???3???(?????????)', '%+G%#Y???%m???%D???(%++A)', d);
    this.checkFormat('14:5:6', '%H:%M:%S', d);
    this.checkFormat('14:05:06', '%02H:%02M:%02S', d);
    this.checkFormat('PM 02:05:06', '%P %02H:%02M:%02S', d);
    this.checkFormat('?????? 02:05:06', '%+P %02H:%02M:%02S', d);
    this.checkFormat('??? 02:05:06', '%++P %02H:%02M:%02S', d);
    this.checkFormat('??? 02:05:06', '%+++P %02H:%02M:%02S', d);
    this.checkFormat('  14???   5???   6???', '%4H???%4M???%4S???', d);
    this.checkFormat('14:05:06.7', '%02H:%02M:%02S.%1L', d);
    this.checkFormat('14:05:06.78', '%02H:%02M:%02S.%2L', d);
    this.checkFormat('14:05:06.789', '%02H:%02M:%02S.%3L', d);
    this.checkFormat('14:05:06.789+09:00', '%02H:%02M:%02S.%3L%Z', d);
    this.checkFormat('14:05:06.789JST', '%02H:%02M:%02S.%3L%+Z', d);
    this.checkFormat('14:05:06.789 ???????????????', '%02H:%02M:%02S.%3L %++Z', d);
    this.checkFormat('2020-02-03T14:05:06.789+09:00', '%04Y-%02m-%02DT%02H:%02M:%02S.%3L%Z', d);
    this.checkFormat('2020/02/03', '%F', d);
    this.checkFormat('14:05', '%T', d);
    this.checkFormat('2020/02/03 14:05', '%F %T', d);
    this.checkFormat('2020/02/03 14:05:06', '%+F %+T', d);
    this.checkFormat('2020???2???3??? 14:05:06 JST', '%++F %++T', d);
    this.checkFormat('2020???2???3???????????? 14???05???06??? ???????????????', '%+++F %+++T', d);
    this.checkFormat('R2/2/3 14:05', '%#F %T', d);
    this.checkFormat('??????2???2???3??? 14:05:06', '%#+F %+T', d);
    this.checkFormat('??????2???2???3??? 14:05:06 JST', '%#++F %++T', d);
    this.checkFormat('??????2???2???3???????????? 14???05???06??? ???????????????', '%#+++F %+++T', d);
    this.checkFormat('??????4???9???7???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1868, 9, 7));
    this.checkFormat('????????????9???8???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1868, 9, 8));
    this.checkFormat('??????45???7???29???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1912, 7, 29));
    this.checkFormat('????????????7???30???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1912, 7, 30));
    this.checkFormat('??????15???12???24???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1926, 12, 24));
    this.checkFormat('????????????12???25???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1926, 12, 25));
    this.checkFormat('??????64???1???7???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1989, 1, 7));
    this.checkFormat('????????????1???8???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(1989, 1, 8));
    this.checkFormat('??????31???4???30???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(2019, 4, 30));
    this.checkFormat('????????????5???1???(?????????)', '%+G%#Y???%m???%D???(%++A)', this.date(2019, 5, 1));
  }

  private date(y: number, m: number, d: number): Date {
    return new Date(y, m - 1, d);
  }

  private time(y: number, m: number, d: number, H: number, M: number, S: number, Z: number): Date {
    let temp = new Date(y, m - 1, d, H, M, S);
    return new Date(temp.getTime() + Z);
  }
}
