import { Scrollable } from './Scrollable';
import type { UiApplication } from './UiApplication';
import { UiHtmlNode } from './UiHtmlNode';

/**
 * UiArcIndicatorNode 値（0.0～1.0）を円弧で表示するUIコンポーネント
 */
export class UiArcIndicatorNode extends UiHtmlNode {
  public static readonly ARC_NAME = 'arc';
  public static readonly ON_NAME = 'on';

  private static readonly TWO_PI = 2 * Math.PI;

  /**
   * 表示すべき値。0.0～1.0までの値を取る
   */
  private _indicatorValue: number;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiArcIndicatorNode {
    return new UiArcIndicatorNode(this);
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
   * @param src コピー元オブジェクト
   */
  constructor(src: UiArcIndicatorNode);

  /**
   * コンストラクタ実装
   *
   * @param param 第一引数
   * @param name 第二引数
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiArcIndicatorNode) {
      super(param as UiArcIndicatorNode);
      let src = param as UiArcIndicatorNode;
      this._indicatorValue = src._indicatorValue;
    } else {
      super(param as UiApplication, name as string);
      this._indicatorValue = 0;
    }
  }

  /**
   * 現在の表示値を取得する
   */
  public get indicatorValue(): number {
    return this._indicatorValue;
  }

  /**
   * 現在の表示値を変更する
   */
  public set indicatorValue(value: number) {
    if (this._indicatorValue != value) {
      //変更された値を保持
      this._indicatorValue = value;
      //変更フラグを設定
      this.onContentChanged();
    }
  }

  protected renderContent(): void {
    this.htmlContent = this.writeArc(this._indicatorValue);
    super.renderContent();
  }

  private writeArc(ratio: number): string {
    let r = this.getRect();
    let s = this.style.getConditionalStyle('NAMED', UiArcIndicatorNode.ARC_NAME);
    if (s == null) {
      s = this.style;
    }
    let sOn = s.getConditionalStyle('NAMED', UiArcIndicatorNode.ON_NAME);
    if (sOn == null) {
      sOn = s;
    }
    s = s.getEffectiveStyle(this);
    sOn = sOn.getEffectiveStyle(this);
    let borderWidth = s.borderLeftAsLength.toPixel(() => r.width);
    let borderColor = s.borderColor;
    let borderColorOn = sOn.borderColor;
    let v = this._indicatorValue;
    let cx = r.width / 2;
    let cy = r.height / 2;
    let hb = borderWidth / 2;
    let rx = cx - hb;
    let ry = cy - hb;
    //パスの作成
    let path1 = this.writeArcPath(1.0, cx, cy, hb);
    let path2 = this.writeArcPath(v, cx, cy, hb);
    //svgの作成
    let b = '';
    b += `<svg width="${r.width}" height="${r.height}">`;
    //b += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="red" stroke-width="${borderWidth}" />`;
    b += `<path d="${path1}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"/>`;
    b += `<path d="${path2}" fill="none" stroke="${borderColorOn}" stroke-width="${borderWidth}" />`;
    b += '</svg>';
    return b;
  }

  private writeArcPath(v: number, cx: number, cy: number, hb: number): string {
    let rx = cx - hb;
    let ry = cy - hb;
    let sa = (0.25 - 0) * UiArcIndicatorNode.TWO_PI;
    let sx = (+Math.cos(sa) + 1) * rx + hb;
    let sy = (-Math.sin(sa) + 1) * ry + hb;
    let p = `M ${sx} ${sy}`;
    //ほとんどのブラウザで円弧はベジェ曲線による近似で実装されているが
    //ベジェ曲線での近似では角度が大きいとずれがひどく、使用に堪えない。
    //そのため、円弧を分割してパスを作成する（以下の実装では10分割）
    let step = 0.05;
    for (let w = step; w < v; w += step) {
      let wa = (0.25 - w) * UiArcIndicatorNode.TWO_PI;
      let wx = (+Math.cos(wa) + 1) * rx + hb;
      let wy = (-Math.sin(wa) + 1) * ry + hb;
      p += ` A ${cx} ${cy} 0 0 1 ${wx} ${wy}`;
    }
    let ea = (0.25 - v) * UiArcIndicatorNode.TWO_PI;
    let ex = (+Math.cos(ea) + 1) * rx + hb;
    let ey = (-Math.sin(ea) + 1) * ry + hb;
    p += ` A ${cx} ${cy} 0 0 1 ${ex} ${ey}`;
    return p;
  }

  /**
   * 対象コンテンツのシーク位置変更通知
   *
   * @param source コンテンツリスト
   * @param offset シーク位置（ミリ秒単位）
   * @param limit 未使用
   * @param count コンテンツ時間（ミリ秒単位）
   */
  public onTScroll(source: Scrollable, offset: number, limit: number, count: number): void {
    this.indicatorValue = offset / count;
  }
}
