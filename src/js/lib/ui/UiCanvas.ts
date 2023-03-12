import { Asserts, Logs } from '../lang';
import { LimitedCacheMap } from '../util';
import { Colors } from './Colors';
import { CssLength } from './CssLength';
import { Rect } from './Rect';
import type { UiApplication } from './UiApplication';
import { UiImageNode } from './UiImageNode';
import { UiNode, UiResult } from './UiNode';
import { TextAlign, UiStyle, VerticalAlign } from './UiStyle';

/** KAPPA値（ベジェ曲線で90度の円弧を描画する時に使用する係数） */
const KAPPA = (4.0 * (Math.sqrt(2.0) - 1.0)) / 3.0;

/** 360度のラジアン表現 */
const RAD360 = Math.PI * 2;

/** 90度のラジアン表現 */
const RAD90 = Math.PI / 2;

/** 空行 */
const EMPTY_LINES = [''];

/** 行頭禁則文字 */
const NO_HEAD =
  '»)）]｝〕〉》」』】〙〗〟’”｠!,.:;?、。ゝゞ々ァィゥェォッャュョヵヶぁぃぅぇぉっゃゅょゕゖ';

/** 行末禁則文字 */
const NO_TAIL = '«(（[｛〔〈《「『【〘〖〝‘“｟';

class ImageItem {
  private _url: any;

  private _imageElement: HTMLImageElement | null;

  private _users: UiImageNode[];

  /**
   * イメージITEMを作成
   *
   * @param url イメージURL
   */
  public constructor(url: any) {
    this._url = url;
    this._imageElement = null;
    this._users = [];
  }

  public getImageElement(): HTMLImageElement | null {
    return this._imageElement;
  }

  public setImageElement(image: HTMLImageElement | null): boolean {
    if (this._imageElement == image) {
      return false;
    }
    this._imageElement = image;
    for (let u of this._users) {
      u.repaintImage();
    }
    return true;
  }

  /**
   * イメージ利用者を追加
   *
   * @param user イメージ利用者
   * @returns 最初のイメージ利用者だった場合、真
   */
  public addImageUser(user: UiImageNode): boolean {
    let oldCount = this._users.length;
    let index = this._users.indexOf(user);
    if (index == -1) {
      this._users.push(user);
    }
    let newCount = this._users.length;
    return oldCount == 0 && newCount > 0;
  }

  /**
   * イメージ利用者を削除
   *
   * @param user イメージ利用者
   * @returns 最後のイメージ利用者だった場合、真
   */
  public removeImageUser(user: UiImageNode): boolean {
    let oldCount = this._users.length;
    let index = this._users.indexOf(user);
    if (index != -1) {
      this._users.splice(index, 1);
    }
    let newCount = this._users.length;
    return oldCount > 0 && newCount == 0;
  }
}

export class UiCanvas extends UiNode {
  private _xOrigin: number;

  private _yOrigin: number;

  private _imageMap: LimitedCacheMap<any, ImageItem>;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiCanvas {
    return new UiCanvas(this);
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
  constructor(src: UiCanvas);

  /**
   * コンストラクタ実装
   *
   * @param param 第一パラメータ
   * @param name 第二パラメータ
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiCanvas) {
      super(param as UiCanvas);
      let src = param as UiCanvas;
      this._xOrigin = src._xOrigin;
      this._yOrigin = src._yOrigin;
      this._imageMap = src._imageMap;
    } else {
      super(param as UiApplication, name as string);
      this._xOrigin = 0;
      this._yOrigin = 0;
      this._imageMap = new LimitedCacheMap<any, ImageItem>(256);
    }
  }

  protected initialize(): void {
    this.ensureDomElement();
    super.initialize();
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement | null {
    return target == this ? super.createDomElement(target, 'canvas') : null;
  }

  protected get canvas(): HTMLCanvasElement {
    Asserts.require(this.domElement != null);
    return this.domElement as HTMLCanvasElement;
  }

  protected get context2d(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  protected afterMount(): void {
    super.syncLocation();
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    let r = this.getRect();
    let canvas = this.canvas;
    const dpr = window.devicePixelRatio;
    let style = canvas.style;
    style.width = `${r.width}px`;
    style.height = `${r.height}px`;
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    let con = this.context2d;
    con.scale(dpr, dpr);
  }

  public onResize(at: number): UiResult {
    super.onResize(at);
    super.syncLocation();
    this.resizeCanvas();
    return UiResult.AFFECTED;
  }

  protected syncImpl(rParentVisible: Rect): void {
    this.syncHierarchy();
    let rVisible = new Rect(rParentVisible).intersect(this.getRect());
    this.translate(rVisible, -1);
    let appeared = this.visible && (!rVisible.empty || this.floating);
    if (appeared) {
      let dirtyRect = new Rect();
      this.dirtyChildren(this, dirtyRect, rVisible);
      this.paintChildren(this, dirtyRect);
      this.paintBorder(this);
    }
  }

  public saveContext(): void {
    this.context2d.save();
  }

  public restoreContext(): void {
    this.context2d.restore();
  }

  public moveOrigin(dx: number, dy: number): void {
    this._xOrigin += dx;
    this._yOrigin += dy;
  }

  public clipRect(x: number, y: number, w: number, h: number): void {
    x += this._xOrigin;
    y += this._yOrigin;
    let con = this.context2d;
    con.beginPath();
    con.moveTo(x, y);
    con.lineTo(x + w, y);
    con.lineTo(x + w, y + h);
    con.lineTo(x, y + h);
    con.closePath();
    con.clip();
  }

  public copyRect(sx: number, sy: number, w: number, h: number, dx: number, dy: number): void {
    sx += this._xOrigin;
    sy += this._yOrigin;
    dx += this._xOrigin;
    dy += this._yOrigin;
    let con = this.context2d;
    Logs.debug('copyRect %g, %g, %g, %g, %g, %g', sx, sy, w, h, dx, dy);
    if (sy == 0) {
      // con.fillStyle = '#808080';
      // con.fillRect(dx, dy, w, h);
      const imageData = con.getImageData(sx, sy, w, h);
      con.putImageData(imageData, dx, dy);
    }
  }

  public drawBackground(x: number, y: number, w: number, h: number, s: UiStyle) {
    x += this._xOrigin;
    y += this._yOrigin;
    //Logs.debug('drawBackground %d %d %d %d', x, y, x + w, y + h);
    this.drawBackgroundColor(x, y, w, h, s);
  }

  public drawBorder(x: number, y: number, w: number, h: number, s: UiStyle) {
    x += this._xOrigin;
    y += this._yOrigin;
    //Logs.debug('drawBorder %d %d %d %d', x, y, x + w, y + h);
    this.drawBorderColor(x, y, w, h, s);
  }

  public drawImage(user: UiImageNode, x: number, y: number, w: number, h: number, s: UiStyle) {
    let image = this.loadImage(user);
    if (image == null) {
      return;
    }
    x += this._xOrigin;
    y += this._yOrigin;
    let con = this.context2d;
    let sw = image.width;
    let sh = image.height;
    let dx;
    let dy;
    let dw;
    let dh;
    let imageWidth = user.imageWidthAsLength;
    let imageHeight = user.imageHeightAsLength;
    if (imageWidth != null && imageHeight != null) {
      dw = imageWidth.toPixel(() => w);
      dh = imageHeight.toPixel(() => h);
    } else if (imageWidth != null) {
      dw = imageWidth.toPixel(() => w);
      dh = (sh * dw) / sw;
    } else if (imageHeight != null) {
      dh = imageHeight.toPixel(() => h);
      dw = (sw * dh) / sh;
    } else {
      dw = w;
      dh = (sh * w) / sw;
    }
    let align: TextAlign = s.textAlign;
    let valign: VerticalAlign = s.verticalAlign;
    if (align == 'left' || align == 'justify') {
      dx = x;
    } else if (align == 'right') {
      dx = x + (w - dw);
    } else {
      dx = x + (w - dw) / 2;
    }
    if (valign == 'top') {
      dy = y;
    } else if (valign == 'bottom') {
      dy = y + (h - dh);
    } else {
      dy = y + (h - dh) / 2;
    }
    con.drawImage(image, 0, 0, sw, sh, dx, dy, dw, dh);
  }

  private loadImage(user: UiImageNode): HTMLImageElement | null {
    let url = user.imageContent;
    if (this._imageMap.get(url) === undefined) {
      this._imageMap.put(url, new ImageItem(url));
    }
    const item = this._imageMap.get(url) as ImageItem;
    if (item.addImageUser(user)) {
      let img = new Image();
      if ((url as string).startsWith('data:')) {
        img.src = url;
        item.setImageElement(img);
      } else {
        img.addEventListener('load', (e) => {
          if (item.setImageElement(img)) {
            this.application.sync();
          }
        });
        img.src = url;
      }
    }
    let result = item.getImageElement();
    return result;
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    w: number,
    h: number,
    ellipsis: string | null,
    s: UiStyle
  ) {
    x += this._xOrigin;
    y += this._yOrigin;
    let con = this.context2d;
    con.font = `${s.fontSize} ${s.fontFamily}`;
    con.fillStyle = s.textColor;
    let fontSize = s.fontSizeAsLength.toPixel(() => w);
    let lineHeight = fontSize; //TODO 仮 //s.lineHeight;
    let lines: string[] = this.foldText(text, w, h, lineHeight, ellipsis);
    let blockHeight = lines.length * lineHeight - Math.max(0, lineHeight - fontSize);
    switch (s.verticalAlign) {
      case 'top':
        break;
      case 'bottom':
        y += h - blockHeight;
        break;
      case 'middle':
        y += (h - blockHeight) / 2;
        break;
    }
    //行単位の描画
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      this.drawLine(line, x, y, w, s.textAlign);
      y += lineHeight;
    }
  }

  private foldText(
    text: string,
    width: number,
    height: number,
    lineHeight: number,
    ellipsis: string | null
  ): string[] {
    //パラメータチェック
    if (text == null || text.length == 0) {
      return EMPTY_LINES;
    }
    // 段落ごとに分割
    let paras = text.split('\n');
    //各段落をさらに表示可能な行に分割する処理
    let lines: string[] = [];
    let remainHeight = height;
    for (let i = 0; i < paras.length && lineHeight <= remainHeight; i++) {
      let para = paras[i];
      let s = 0;
      let n = para.length;
      while (s < n && lineHeight <= remainHeight) {
        //先頭の空白をスキップする
        while (s < n && para.charCodeAt(s) == 0x20) {
          s++;
        }
        let w = 0;
        let e = s;
        let be = e;
        let chPrev = '';
        while (e < n && w <= width) {
          let chCurr = para.charAt(e);
          if (
            !UiCanvas.isProhibitedEndChar(chPrev) &&
            !UiCanvas.isProhibitedStartChar(chCurr) &&
            !UiCanvas.isLatinChar(chCurr)
          ) {
            be = e;
          }
          e = e + 1;
          w = this.measureText(para.substring(s, e)).width;
          chPrev = chCurr;
        }
        if (w > width) {
          if (s < be) {
            //行途中にワードブレークがあれば、そこまでを描画
            e = be;
          } else {
            //１余計に加算しているので減算
            e = e - 1;
          }
        }
        //描画候補文字列
        let line = para.substring(s, e);
        //おさまりきれない場合、末尾文字に ELLIPSIS を付与する場合
        if (
          ellipsis != null &&
          remainHeight - lineHeight < lineHeight &&
          (e < n || i + 1 < paras.length) &&
          this.measureText(ellipsis).width <= width
        ) {
          line += ellipsis;
          while ((this.measureText(line), width > width)) {
            line = line.substring(0, line.length - 2) + ellipsis;
          }
        }
        if (!(e < n)) {
          line += '\n';
        }
        lines.push(line);
        //次段落処理の準備
        s = e;
        remainHeight -= lineHeight;
      }
    }
    return lines;
  }

  /**
   * 行頭禁則文字判定
   *
   * @param ch
   * 		対象文字
   * @return
   * 		対象文字が行頭禁則文字の場合、真
   */
  private static isProhibitedStartChar(ch: string): boolean {
    return NO_HEAD.indexOf(ch) >= 0;
  }

  /**
   * 行末禁則文字判定
   *
   * @param ch
   * 		対象文字
   * @return
   * 		対象文字が行末禁則文字の場合、真
   */
  private static isProhibitedEndChar(ch: string): boolean {
    return NO_TAIL.indexOf(ch) >= 0;
  }

  /**
   * 欧文文字判定
   *
   * @param ch
   * 		対象文字
   * @return
   * 		対象文字が欧文文字の場合、真
   */
  private static isLatinChar(ch: string): boolean {
    let charCode = ch.charCodeAt(0);
    return 0x0021 <= charCode && charCode <= 0x02af;
  }

  private measureText(text: string): TextMetrics {
    let con = this.context2d;
    let met = con.measureText(text);
    return met;
  }

  private fillText(str: string, x: number, y: number) {
    let con = this.context2d;
    con.fillText(str, x, y);
  }

  private drawLine(line: string, x: number, y: number, w: number, align: TextAlign) {
    let endLine = false;
    if (line.charAt(line.length - 1) == '\n') {
      endLine = true;
      line = line.substring(0, line.length - 1);
    }
    let met = this.measureText(line);
    let ascent = met.actualBoundingBoxAscent;
    let width = met.width;
    switch (align) {
      case 'left':
        this.fillText(line, x, y + ascent);
        break;
      case 'right':
        this.fillText(line, x + (w - width), y + ascent);
        break;
      case 'center':
        this.fillText(line, x + (w - width) / 2, y + ascent);
        break;
      case 'justify':
        if (endLine) {
          this.fillText(line, x, y + ascent);
        } else {
          let words = line.split(' ');
          if (words.length > 1) {
            //欧文JUSTIFY
            let nword = words.length;
            let widths = new Array<number>(nword + 1);
            widths[0] = 0;
            for (let j = 0; j < nword; j++) {
              widths[j + 1] = widths[j] + this.measureText(words[j]).width;
            }
            let spacing = (w - widths[nword]) / (nword - 1);
            for (let j = 0; j < nword; j++) {
              this.fillText(words[j], x + widths[j] + spacing * j, y + ascent);
            }
          } else {
            //和文JUSTIFY
            let nword = line.length;
            let widths = new Array<number>(nword + 1);
            widths[0] = 0;
            for (let j = 0; j < nword; j++) {
              widths[j + 1] = widths[j] + this.measureText(line.substring(j, j + 1)).width;
            }
            let spacing = (w - widths[nword]) / (nword - 1);
            for (let j = 0; j < nword; j++) {
              this.fillText(line.substring(j, j + 1), x + widths[j] + spacing * j, y + ascent);
            }
          }
        }
        break;
    }
  }

  private drawBackgroundColor(x: number, y: number, w: number, h: number, s: UiStyle) {
    let hw = Math.round(w / 2);
    let hh = Math.round(h / 2);
    // prettier-ignore
    let rx = [
      Math.min(hw, s.borderRadiusTopLeftAsLength.toPixel(() => w)),
      Math.min(hw, s.borderRadiusTopRightAsLength.toPixel(() => w)),
      Math.min(hw, s.borderRadiusBottomRightAsLength.toPixel(() => w)),
      Math.min(hw, s.borderRadiusBottomLeftAsLength.toPixel(() => w)),
    ];
    // prettier-ignore
    let ry = [
      Math.min(hh, s.borderRadiusTopLeftAsLength.toPixel(() => h)),
      Math.min(hh, s.borderRadiusTopRightAsLength.toPixel(() => h)),
      Math.min(hh, s.borderRadiusBottomRightAsLength.toPixel(() => h)),
      Math.min(hh, s.borderRadiusBottomLeftAsLength.toPixel(() => h))
    ];
    let con = this.context2d;
    con.beginPath();
    this.drawRoundRect(con, x, y, w, h, rx, ry);
    con.closePath();
    con.fillStyle = s.backgroundColor;
    con.fill();
  }

  private drawBorderColor(x: number, y: number, w: number, h: number, s: UiStyle) {
    let left = s.borderLeftAsLength.toPixel(() => w);
    let top = s.borderTopAsLength.toPixel(() => h);
    let right = s.borderRightAsLength.toPixel(() => w);
    let bottom = s.borderBottomAsLength.toPixel(() => h);
    if (left == 0 && top == 0 && right == 0 && bottom == 0) {
      return;
    }
    let hw = Math.round(w / 2);
    let hh = Math.round(h / 2);
    let ox = x;
    let oy = y;
    let ow = w;
    let oh = h;
    // prettier-ignore
    let orx = [
      Math.min(hw, s.borderRadiusTopLeftAsLength.toPixel(() => w)),
      Math.min(hw, s.borderRadiusTopRightAsLength.toPixel(() => w)),
      Math.min(hw, s.borderRadiusBottomRightAsLength.toPixel(() => w)),
      Math.min(hw, s.borderRadiusBottomLeftAsLength.toPixel(() => w)),
    ];
    // prettier-ignore
    let ory = [
      Math.min(hh, s.borderRadiusTopLeftAsLength.toPixel(() => h)),
      Math.min(hh, s.borderRadiusTopRightAsLength.toPixel(() => h)),
      Math.min(hh, s.borderRadiusBottomRightAsLength.toPixel(() => h)),
      Math.min(hh, s.borderRadiusBottomLeftAsLength.toPixel(() => h))
    ];
    let ix = ox + left;
    let iw = ow - left - right;
    let iy = oy + top;
    let ih = oh - top - bottom;
    let irx = [
      Math.max(0, orx[0] - left),
      Math.max(0, orx[1] - right),
      Math.max(0, orx[2] - right),
      Math.max(0, orx[3] - left),
    ];
    let iry = [
      Math.max(0, ory[0] - top),
      Math.max(0, ory[1] - top),
      Math.max(0, ory[2] - bottom),
      Math.max(0, ory[3] - bottom),
    ];
    let con = this.context2d;
    con.beginPath();
    this.drawRoundRect(con, ox, oy, ow, oh, orx, ory);
    this.drawRoundRect(con, ix, iy, iw, ih, irx, iry);
    con.closePath();
    con.fillStyle = s.borderColor;
    con.fill('evenodd');
  }

  private drawRoundRect(
    con: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    rx: number[],
    ry: number[]
  ) {
    let hw = Math.round(w / 2);
    let hh = Math.round(h / 2);
    this.moveTo(con, x, y + ry[0]);
    //左上
    if (rx[0] > 0 && ry[0] > 0) {
      this.arcTo(con, x + rx[0], y + ry[0], rx[0], ry[0], RAD90 * 2, RAD90);
    } else if (ry[0] > 0) {
      this.lineTo(con, x, y);
    } else if (rx[0] > 0) {
      this.lineTo(con, x + rx[0], y);
    }
    //上
    if (rx[0] < hw || rx[1] < hw) {
      this.lineTo(con, x + w - rx[1], y);
    }
    //右上
    if (rx[1] > 0 && ry[1] > 0) {
      this.arcTo(con, x + w - rx[1], y + ry[1], rx[1], ry[1], RAD90 * 3, RAD90);
    } else if (rx[1] > 0) {
      this.lineTo(con, x + w, y);
    } else if (ry[1] > 0) {
      this.lineTo(con, x + w, y + ry[1]);
    }
    //右
    if (ry[1] < hh || ry[2] < hh) {
      this.lineTo(con, x + w, y + h - ry[2]);
    }
    //右下
    if (rx[2] > 0 && ry[2] > 0) {
      this.arcTo(con, x + w - rx[2], y + h - ry[2], rx[2], ry[2], RAD90 * 0, RAD90);
    } else if (ry[2] > 0) {
      this.lineTo(con, x + w, y + h);
    } else if (rx[2] > 0) {
      this.lineTo(con, x + w - rx[2], y + h);
    }
    //下
    if (rx[2] < hw || rx[3] < hw) {
      this.lineTo(con, x + rx[3], y + h);
    }
    //左下
    if (rx[3] > 0 && ry[3] > 0) {
      this.arcTo(con, x + rx[3], y + h - ry[3], rx[3], ry[3], RAD90 * 1, RAD90);
    } else if (ry[3] > 0) {
      this.lineTo(con, x, y + h);
    } else if (rx[3] > 0) {
      this.lineTo(con, x, y + h - ry[3]);
    }
    if (rx[3] < hw || rx[0] < hw) {
      this.lineTo(con, x, y + ry[0]);
    }
  }

  private moveTo(con: CanvasRenderingContext2D, x: number, y: number): void {
    con.moveTo(x, y);
    //Logs.debug('moveTo %d %d', x, y);
  }

  private lineTo(con: CanvasRenderingContext2D, x: number, y: number): void {
    con.lineTo(x, y);
    //Logs.debug('lineTo %d %d', x, y);
  }

  /**
   * 円弧を描く
   *
   * CANVASが楕円のARCを直接サポートしていないので、ベジェ曲線で代替
   * ※SVGのPATHに使いたければ、軸回転をサポートする必要あり
   *
   * @param cx
   * 		中心X座標
   * @param cy
   * 		中心Y座標
   * @param rx
   * 		X半径
   * @param ry
   * 		Y半径
   * @param startAngle
   * 		開始角度（ラジアン）
   * @param arcAngle
   * 		弧の角度（ラジアン）
   */
  private arcTo(
    con: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    startAngle: number,
    arcAngle: number
  ) {
    //処理準備
    let dir = Math.sign(arcAngle);
    let deltaAngle = Math.abs(arcAngle);
    let count = Math.floor(deltaAngle / RAD90);
    let remainAngle = deltaAngle % RAD90;
    let ratio = remainAngle / RAD90;
    //最初に1/4円弧をcount回描画
    let a = startAngle;
    let b = (a + dir * RAD90) % RAD360;
    for (let i = 0; i < count; i++) {
      con.bezierCurveTo(
        cx + rx * Math.cos(a) - dir * KAPPA * rx * Math.sin(a),
        cy + ry * Math.sin(a) + dir * KAPPA * ry * Math.cos(a),
        cx + rx * Math.cos(b) + dir * KAPPA * rx * Math.sin(b),
        cy + ry * Math.sin(b) - dir * KAPPA * ry * Math.cos(b),
        cx + rx * Math.cos(b),
        cy + ry * Math.sin(b)
      );
      a = b;
      b = (a + dir * RAD90) % RAD360;
    }
    //最後の円弧は1/4円弧を分割した制御点から描画
    //まず、1/4円弧の端点および制御点を生成
    let x0 = cx + rx * Math.cos(a);
    let y0 = cy + ry * Math.sin(a);
    let x1 = cx + rx * Math.cos(a) - dir * KAPPA * rx * Math.sin(a);
    let y1 = cy + ry * Math.sin(a) + dir * KAPPA * ry * Math.cos(a);
    let x2 = cx + rx * Math.cos(b) + dir * KAPPA * rx * Math.sin(b);
    let y2 = cy + ry * Math.sin(b) - dir * KAPPA * ry * Math.cos(b);
    //     x3 = cx + rx * Math.cos(b);
    //     y3 = cy + ry * Math.sin(b);
    //端点および制御点間の中点座標を計算
    let x4 = x0 + (x1 - x0) * ratio;
    let y4 = y0 + (y1 - y0) * ratio;
    let x5 = x1 + (x2 - x1) * ratio;
    let y5 = y1 + (y2 - y1) * ratio;
    //     x6 = x2 + (x3 - x2) * ratio;
    //     y6 = y2 + (y3 - y2) * ratio;
    //中点間の中点を計算
    let x7 = x4 + (x5 - x4) * ratio;
    let y7 = y4 + (y5 - y4) * ratio;
    //     x8 = x5 + (x6 - x5) * ratio;
    //     y8 = y5 + (y6 - y5) * ratio;
    //描画
    let ex = cx + rx * Math.cos(startAngle + arcAngle);
    let ey = cy + ry * Math.sin(startAngle + arcAngle);
    con.bezierCurveTo(x4, y4, x7, y7, ex, ey);
    //Logs.debug('arcTo %d %d', ex, ey);
  }
}
