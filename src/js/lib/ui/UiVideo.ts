import { PlayerType } from '~/types/ini-dash';
import { Asserts } from '../lang';
import type { UiApplication } from './UiApplication';
import { UiNode, UiResult } from './UiNode';
import { UiPageNode } from './UiPageNode';

export class UiVideo extends UiNode {
  private _player: PlayerType | null;

  /**
   * クローンメソッド
   *
   * @returns 複製
   */
  public clone(): UiVideo {
    return new UiVideo(this);
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
  constructor(src: UiVideo);

  /**
   * コンストラクタ実装
   *
   * @param param 第一引数
   * @param name 第二引数
   */
  public constructor(param: any, name?: string) {
    if (param instanceof UiVideo) {
      super(param as UiVideo);
      let src = param as UiVideo;
      this._player = src._player;
    } else {
      super(param as UiApplication, name as string);
      this._player = null;
    }
  }

  protected afterMount(): void {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    //let url = '/url/to/manifest.mpd';
    let url = 'https://storage.googleapis.com/wvmedia/cenc/h264/tears/tears.mpd';
    this._player = window.INIDash.createPlayer({
      video: video,
      url: url,
      drm: {
        widevine: {
          url: 'http://widevine-key-server-url',
          customData: 'base64-custom-data',
          robustness: '', // or 'SW_SECURE_CRYPTO'
        },
        playready: {
          url: 'http://playready-key-server-url',
          customData: 'base64-custom-data',
        },
      },
    });
    this._player.play(); //これは正しいのか？

    //set timer
    let app = this.application;
    app.runInterval(this, 1, 250, () => this.onTimer());
  }

  private onTimer(): UiResult {
    Asserts.assume(this._player != null);
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    let currentTime = video.currentTime * 1000;
    let duration = video.duration * 1000;
    return this.doScroll(currentTime, duration);
  }

  private doScroll(currentTime: number, duration: number): UiResult {
    let result = UiResult.IGNORED;
    if (this.mounted && this.hScrollName != null) {
      let page = this.getPageNode() as UiPageNode;
      page.dispatchHScroll(this.hScrollName, this, currentTime, 0, duration);
      result |= UiResult.AFFECTED;
    }
    return result;
  }

  protected beforeUnmount(): void {
    let app = this.application;
    app.cancelInterval(this, 1);
  }

  protected ensureDomElement(): HTMLElement {
    return super.ensureDomElement() as HTMLElement;
  }

  protected createDomElement(target: UiNode, tag: string): HTMLElement {
    let div = document.createElement('div');
    let video = document.createElement('video') as HTMLVideoElement;
    video.id = 'video';
    video.style.position = 'absolute';
    //video要素はなぜかinsetが効かないので、width, heightを指定
    video.style.width = '100%';
    video.style.height = '100%';
    video.controls = false;
    video.autoplay = true;
    let ad = document.createElement('div');
    ad.id = 'adContainer';
    ad.style.position = 'absolute';
    //div要素はinsetは効くが、videoとのずれ防止のため、同様にwidth, heightを指定
    ad.style.width = '100%';
    ad.style.height = '100%';
    div.appendChild(video);
    div.appendChild(ad);
    return div;
  }
}
