import { Asserts } from '~/lib/lang';
import { CssLength } from '~/lib/ui/CssLength';
import { Size, UiNode } from '~/lib/ui/UiNode';

export class UiSetter {
  private _context: UiBuilder | null;

  public constructor() {
    this._context = null;
  }

  public get context(): UiBuilder {
    Asserts.assume(this._context != null);
    return this._context;
  }

  public set context(context: UiBuilder) {
    this._context = context;
  }

  public get node(): UiNode {
    return this.context.node();
  }

  protected toValue(s: Size | null): string | null {
    if (s == null) {
      return null;
    } else if (typeof s == 'string') {
      return s as string;
    } else if (typeof s == 'number') {
      return this.context.convert(s);
    } else {
      return '0px';
    }
  }
}

export interface HasSetter<T extends UiSetter> {
  getSetter(): T;
}

export class UiBuilder {
  private _parent: UiNode | null;

  private _node: UiNode | null;

  private _defaultLength: CssLength;

  public constructor(len: string = '1px') {
    this._parent = null;
    this._node = null;
    this._defaultLength = new CssLength(len);
  }

  public element<T extends UiSetter>(e: HasSetter<T> & UiNode): T {
    if (this._parent != null) {
      this._parent.appendChild(e);
    }
    this._node = e;
    let setter = e.getSetter();
    setter.context = this;
    return setter;
  }

  public node(): UiNode {
    Asserts.assume(this._node != null);
    return this._node;
  }

  public belongs(func: (b: UiBuilder) => void) {
    Asserts.assume(this._node != null);
    this._parent = this._node;
    this._node = null;
    func(this);
    this._node = this._parent;
    this._parent = this._node.parent as UiNode;
  }

  public convert(v: number): string {
    return `${v * this._defaultLength.value}${this._defaultLength.unit}`;
  }
}
