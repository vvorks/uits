// import { PlayerType } from '~/types/ini-dash';
import type { UiApplication } from './UiApplication';
import { UiNode, UiResult } from './UiNode';
import { UiPageNode } from './UiPageNode';

export class UiVideo extends UiNode {
  // private _player: PlayerType | null;
  private _player: null;
  private _video: HTMLVideoElement | null;

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
      this._video = src._video;
    } else {
      super(param as UiApplication, name as string);
      this._player = null;
      this._video = null;
    }
  }

  protected afterMount(): void {}

  private doScroll(currentTime: number, duration: number): UiResult {
    let result = UiResult.IGNORED;
    if (this.mounted && this.tScrollName != null) {
      let page = this.getPageNode() as UiPageNode;
      page.dispatchTScroll(this.tScrollName, this, currentTime, 0, duration);
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

  /**
   * プレイヤー設定＆再生
   *
   * @param url コンテンツURL
   */
  public createPlayer(url: string): void {
    let drm = {};
    switch (url) {
      case 'https://tvod-origin.hikaritv.net/video/00ki/6s/00ki6snad2/20210106125740/manifest.mpd':
        drm = {
          playready: {
            url: 'https://plala.drmkeyserver.com/playready_license',
            customData:
              'XUlw2E/iPECYWQ7nMcYusgAAAAAAAAAAAAAAAAAAAADLkmP4Js1Wl199N+/LOm1TwnUQ49yCsAGH8ixC+UcyMXwssfwbRacJi60P6WZmkk0/cSUSWr+5m1n5nF0i5bBX4gFe4/8hMAVvGUjMzuzTawF8TRIjEqpy+FtzRmNOXy2F9pFAY9659SbaGarVM+qfe8NuJa2VbDkatP5k4zs+2iynikzRtW99tLyWMFF0MryrML5y5P2tYGMp5/MHkSY+FJ8TjkMmdeCZMxtU932feJRaGCvPjcscuWOh1F8lX8cV3laqhaJuwJuT1mELJad0bJRPXhe1OQv0qEC/Ext8AbFBB2m7O7qUL2+EYtyrstp10v0QcyOxCstjiKyetZ2f/ZeHUcCuhWKW5AxGNgR04f26aD79W5xe27qMcbxb2v8769FAfNVamMK6wYt1yHceUE6AowYYi/8w8JQxL9xP8XqHDXB9gnD9v3zBpgPf9EM9QBFyC3yEynZ0F2Mf7Ml/skrpiDR05APFWLNvHeKVI01aSxx1DMLYNsK5/LYuFLn1QT7I92O6BULNhP8HGVZUEuypb98a9EKu2xC9DcDhYj7HNAMXeIDzUWD38MwbwBgorHB6GriOlWw2CshBLDweSW2/EKFoy5oMXJ6t3/aMqg==',
            priority: 1,
          },
        };
        break;
      case 'https://tvod-origin.hikaritv.net/video/00jj/5p/00jj5pb8ma/20200305022511/manifest.mpd':
        drm = {
          playready: {
            url: 'https://plala.drmkeyserver.com/playready_license',
            customData:
              'XUlw2E/iPECYWQ7nMcYusgAAAAAAAAAAAAAAAAAAAADLkmP4Js1Wl199N+/LOm1TwnUQ49yCsAGH8ixC+UcyMXwssfwbRacJi60P6WZmkk0/cSUSWr+5m1n5nF0i5bBX4gFe4/8hMAVvGUjMzuzTawF8TRIjEqpy+FtzRmNOXy2F9pFAY9659SbaGarVM+qfe8NuJa2VbDkatP5k4zs+2iynikzRtW99tLyWMFF0Mry6yYXhDwOX38HkHvIBx77PTpgEVh+UVsSh2IW0pXYhq22Y7f8Zz0taJx2SO4PDe5wF21EoJSvpVbgYUSChA3G3CcHfMuyk9JERhysB4epGZLAK9gPtYr3ZshmQLHj+d0AVmowc6Yfe3lBPbj8f7Iaoxa9kvQgd0Z/BGCvJfsQBSfPLZzPG1nffA3RZKV5S+2E5ASq/ja+eQKlNC1CGg4yRL7iT/ra51nd9TjsMoebEPCjqZQcnBWtG3E/Mu5yCCq7XL+h24K4rg97ecAu1zv3pwLHvc9sjeCpKU0nv1LSHTP3r/xjQbJqTSwLa8qXqbK7l3woy2Nr/cMJyRU5cgjBA5Mir7aH81v8AmN3D0l9+5RNAyH+46aW7Unq4xkcncIMR6O2jbCC/21CBJr80yIcrhLBi6rzpFMy92xk2CpH9fw==',
            priority: 1,
          },
        };
        break;
      case 'https://storage.googleapis.com/wvmedia/clear/h264/tears/tears.mpd':
        drm = {};
        break;
      case 'https://storage.googleapis.com/wvmedia/cenc/h264/tears/tears.mpd':
        drm = {
          widevine: {
            url: 'https://proxy.uat.widevine.com/proxy?video_id=GTS_SW_SECURE_CRYPTO&provider=widevine_test',
            priority: 0,
          },
        };
        break;
      default:
        break;
    }
    this._video = this.ensureDomElement().firstChild as HTMLVideoElement;
    // this._player = window.INIDash.createPlayer({
    //   video: this._video,
    //   url: url,
    //   mergeVideoTracks: true,
    //   contentInfo: {},
    //   drm: drm,
    //   manifest: {},
    // });
    // this._player.play();
    // this._video.addEventListener('timeupdate', () => this.timeUpdate());
  }

  /**
   * 一時停止状態取得
   *
   * @returns 一時停止状態
   */
  public get paused(): boolean {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    return video.paused;
  }

  /**
   * 再生
   */
  public videoPlay() {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    video.play();
  }

  /**
   * 一時停止
   */
  public videoPause() {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    video.pause();
  }

  /**
   * 現在時間取得
   *
   * @returns 現在時間
   */
  public get currentTime(): number {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    return video.currentTime;
  }

  /**
   * 現在時間設定
   *
   * @param time 現在時間
   */
  public set currentTime(time: number) {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    video.currentTime = time;
    console.log('setTime:', time);
  }

  /**
   * 総再生時間取得
   *
   * @returns 総再生時間
   */
  public get duration(): number {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    return video.duration;
  }

  /**
   * バッファ済みの時間取得
   *
   * @returns バッファ済みの時間
   */
  public get buffered(): TimeRanges {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    return video.buffered;
  }

  /**
   * timeupdateイベント通知設定
   *
   * @param func コールバック関数
   */
  // public setTimeUpdateEvent(func?: any) {
  //   if (typeof func === 'undefined') {
  //     func = null;
  //   }
  //   let video = this.ensureDomElement().firstChild as HTMLVideoElement;
  //   video.addEventListener('timeupdate', () => this.timeUpdate(func));
  // }

  /**
   * timeupdateイベント発生時にコールバック関数にcurrentTimeを通知
   *
   * @param func コールバック関数
   */
  private timeUpdate() {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    let currentTime = video.currentTime * 1000;
    let duration = video.duration * 1000;
    let result = UiResult.IGNORED;
    if (!video.paused) {
      // 一時停止中のみシークバー移動させる
      result = this.doScroll(currentTime, duration);
    }
    if (result & UiResult.AFFECTED) {
      this.application.sync();
    }
  }

  /**
   * 広告5秒前通知のイベント登録
   *
   * @param func コールバック関数
   */
  public setAdCuePointsEvent(callback: (flg: boolean) => void) {
    let app = this.application;
    app.runInterval(this, 1, 500, () => this.notifyAdCuePoint(callback));
  }

  /**
   * 広告5秒前を通知
   *
   * @param func コールバック関数
   */
  private notifyAdCuePoint(callback: (flg: boolean) => void) {
    let result = UiResult.IGNORED;
    if (callback != null && this._player != null && this._video != null) {
      let mediaClientAds = this._player.getMediaClientAds();
      if (mediaClientAds != null) {
        let adCuePoints = mediaClientAds.getAdCuePoints();
        if (adCuePoints.indexOf(this._video.currentTime + 5) != -1) {
          // 広告5秒前の通知
          callback(true);
        } else if (adCuePoints.indexOf(this._video.currentTime) != -1) {
          // 広告再生開始の通知
          callback(false);
        }
        result = UiResult.CONSUMED;
      }
    }
    return result;
  }

  /**
   * 広告再生を許可する/しない
   *
   * @param param 広告再生可否
   */
  public disableAdsPlayback(param: boolean) {
    if (this._player != null) {
      let mediaClientAds = this._player.getMediaClientAds();
      if (mediaClientAds != null) {
        mediaClientAds.disableAdsPlayback(param);
      }
    }
  }

  /**
   * 広告再生中かを取得する
   *
   * @returns 広告再生中フラグ
   */
  public isAdsPlaying(): boolean {
    let adsPlaying: boolean = false;
    if (this._player != null) {
      let mediaClientAds = this._player.getMediaClientAds();
      if (mediaClientAds != null) {
        adsPlaying = mediaClientAds.isAdPlaying();
      }
    }
    return adsPlaying;
  }

  /**
   * シークバー移動
   *
   * @param currentTime 移動先のシーク時間
   */
  public setSeekTime(currentTime: number) {
    let video = this.ensureDomElement().firstChild as HTMLVideoElement;
    let duration = video.duration * 1000;
    this.doScroll(currentTime, duration);
  }
}
