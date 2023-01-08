export class Inset {

	private _left: number;

	private _top: number;

	private _right: number;

	private _bottom: number;

	public constructor(left:number, top:number, right:number, bottom:number) {
		this._left = left;
		this._top = top;
		this._right = right;
		this._bottom = bottom;
	}

	public get left():number {
		return this._left;
	}

	public set left(value:number) {
		this._left = value;
	}

	public get top():number {
		return this._top;
	}

	public set top(value:number) {
		this._top = value;
	}

	public get right():number {
		return this._right;
	}

	public set right(value:number) {
		this._right = value;
	}

	public get bottom():number {
		return this._bottom;
	}

	public set bottom(value:number) {
		this._bottom = value;
	}

	public toJson() {
		return {
			left:   this._left,
			top:    this._top,
			right:  this._right,
			bottom: this._bottom
		};
	}

	public toString():string {
		return JSON.stringify(this.toJson());
	}

}