/**
 * ページレイヤー
 */
export type PageLayer = number;

export class PageLayers {
  /** 優先度：低（選局バナー等） */
  public static readonly LOW = 30;

  /** 優先度：通常（ページ、モーダルPOPUP等） */
  public static readonly NORMAL = 50;

  /** 優先度：高（通知等） */
  public static HIGH = 80;
}
