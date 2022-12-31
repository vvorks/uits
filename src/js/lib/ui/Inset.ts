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

	public get top():number {
		return this._top;
	}

	public get right():number {
		return this._right;
	}

	public get bottom():number {
		return this._bottom;
	}

}