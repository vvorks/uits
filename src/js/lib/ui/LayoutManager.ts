import { UiNode, UiResult } from './UiNode';

/**
 * LayoutManager
 */
export interface LayoutManager {
  /**
   * 指定されたノードの子ノードの再配置を行う
   *
   * @param node 対象ノード
   */
  layout(node: UiNode): UiResult;
}
