export class Rect {
  private _x: number;

  private _y: number;

  private _width: number;

  private _height: number;

  public constructor(src?: Rect) {
    if (src != undefined) {
      this._x = src._x;
      this._y = src._y;
      this._width = src._width;
      this._height = src._height;
    } else {
      this._x = 0;
      this._y = 0;
      this._width = 0;
      this._height = 0;
    }
  }

  public get x(): number {
    return this._x;
  }

  public set x(value: number) {
    this._x = value;
  }

  public get y(): number {
    return this._y;
  }

  public set y(value: number) {
    this._y = value;
  }

  public get width(): number {
    return this._width;
  }

  public set width(value: number) {
    this._width = value;
  }

  public get height(): number {
    return this._height;
  }

  public set height(value: number) {
    this._height = value;
  }

  public get left(): number {
    return this._x;
  }

  public get top(): number {
    return this._y;
  }

  public get right(): number {
    return this._x + this._width;
  }

  public get bottom(): number {
    return this._y + this._height;
  }

  public get centerX(): number {
    return this._x + this._width / 2;
  }

  public get centerY(): number {
    return this._y + this._height / 2;
  }

  public get empty(): boolean {
    return this._width <= 0 || this._height <= 0;
  }

  public containsPoint(x: number, y: number): boolean {
    return this.left <= x && x < this.right && this.top <= y && y < this.bottom;
  }

  public contains(other: Rect): boolean {
    return (
      this.left <= other.left &&
      other.right <= this.right &&
      this.top <= other.top &&
      other.bottom <= this.bottom
    );
  }

  public isolates(other: Rect): boolean {
    return (
      other.right <= this.left ||
      this.right <= other.left ||
      other.bottom <= this.top ||
      this.bottom <= other.top
    );
  }

  public intersects(other: Rect): boolean {
    return !this.isolates(other);
  }

  public distance(x: number, y: number) {
    let dx = 0;
    let dy = 0;
    if (x < this.left) {
      dx = this.left - x;
    } else if (x >= this.right) {
      dx = x + 1 - this.right;
    }
    if (y < this.top) {
      dy = this.top - y;
    } else if (y >= this.bottom) {
      dy = y + 1 - this.bottom;
    }
    return Math.sqrt(dx * dx + dy * dy);
  }

  public position(x: number, y: number): Rect {
    this._x = x;
    this._y = y;
    return this;
  }

  public size(width: number, height: number): Rect {
    this._width = width;
    this._height = height;
    return this;
  }

  public move(dx: number, dy: number): Rect {
    this._x += dx;
    this._y += dy;
    return this;
  }

  public scale(sx: number, sy: number = sx): Rect {
    this._width *= sx;
    this._height *= sy;
    return this;
  }

  public inflate(
    left: number,
    top: number = left,
    right: number = left,
    bottom: number = top
  ): Rect {
    this._x -= left;
    this._y -= top;
    this._width += left + right;
    this._height += top + bottom;
    return this;
  }

  public resize(dLeft: number, dTop: number, dRight: number, dBottom: number): Rect {
    let x1 = this._x + dLeft;
    let y1 = this._y + dTop;
    let x2 = this._x + this._width + dRight;
    let y2 = this._y + this._height + dBottom;
    return this.locateFromTwoPoints(x1, y1, x2, y2);
  }

  public locate(x: number, y: number, width: number, height: number): Rect {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    return this;
  }

  public locateFrom(other: Rect): Rect {
    this._x = other._x;
    this._y = other._y;
    this._width = other._width;
    this._height = other._height;
    return this;
  }

  public locateFromTwoPoints(x1: number, y1: number, x2: number, y2: number): Rect {
    this._x = Math.min(x1, x2);
    this._y = Math.min(y1, y2);
    this._width = Math.abs(x2 - x1);
    this._height = Math.abs(y2 - y1);
    return this;
  }

  public intersect(other: Rect): Rect {
    if (this.empty) {
      return this;
    } else if (other.empty || this.isolates(other)) {
      return this.size(0, 0);
    } else {
      let x1 = Math.max(this.left, other.left);
      let y1 = Math.max(this.top, other.top);
      let x2 = Math.min(this.right, other.right);
      let y2 = Math.min(this.bottom, other.bottom);
      return this.locateFromTwoPoints(x1, y1, x2, y2);
    }
  }

  public union(other: Rect): Rect {
    if (other.empty) {
      return this;
    } else if (this.empty) {
      return this.locateFrom(other);
    } else {
      let x1 = Math.min(this.left, other.left);
      let y1 = Math.min(this.top, other.top);
      let x2 = Math.max(this.right, other.right);
      let y2 = Math.max(this.bottom, other.bottom);
      return this.locateFromTwoPoints(x1, y1, x2, y2);
    }
  }

  public equals(other: Rect): boolean {
    return (
      this.x == other.x &&
      this.y == other.y &&
      this.width == other.width &&
      this.height == other.height
    );
  }

  public toJson() {
    return {
      x: this._x,
      y: this._y,
      w: this._width,
      h: this._height,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }
}
