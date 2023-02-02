import { Asserts } from '../lang';
import { HasSetter } from './UiBuilder';
import { UiNode, UiNodeSetter } from './UiNode';

export interface UiCompositeNodeParam {}

export class UiCompositeNodeSetter<T extends UiCompositeNodeParam> extends UiNodeSetter {
  public param(value: T): this {
    let node = this.node as UiCompositeNode<T>;
    node.compositeParameter = value;
    return this;
  }
}

export abstract class UiCompositeNode<T extends UiCompositeNodeParam>
  extends UiNode
  implements HasSetter<UiCompositeNodeSetter<T>>
{
  /** 引き渡しパラメータ */
  private _compositeParameter: T | null = null;

  public abstract getSetter(): UiCompositeNodeSetter<UiCompositeNodeParam>;

  public get compositeParameter(): T {
    Asserts.assume(this._compositeParameter != null);
    return this._compositeParameter;
  }

  public set compositeParameter(value: T) {
    this._compositeParameter = value;
  }
}
