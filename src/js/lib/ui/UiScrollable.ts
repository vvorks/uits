import { Logs } from "../lang";
import { UiApplication } from "./UiApplication";
import { UiNode, UiResult } from "./UiNode";

export class UiScrollable extends UiNode {
    
	public clone():UiScrollable {
		return new UiScrollable(this);
	}

	constructor(app:UiApplication, name:string);
	constructor(src:UiScrollable);

	public constructor(param:any, name?:string) {
		if (param instanceof UiScrollable) {
            super(param as UiScrollable);
        } else {
            super(param as UiApplication, name as string);
        }
    }

    public scrollFor(prev:UiNode|null, target:UiNode, animationTime?:number):UiResult {
		if (!this.isAncestorOf(target)) {
			return UiResult.IGNORED;
		}
		let result:UiResult = UiResult.IGNORED;
		let r = target.getWrappedRectOn(this);
		let s = this.getViewRect();
		Logs.debug("scrollFor %s:%s %s:%s", target.getNodePath(), r.toString(), this.getNodePath(), s.toString());
		let dx:number;
		let dy:number;
		if (r.left < s.left) {
			dx = -(s.left - r.left + 0);
		} else if (r.right > s.right) {
			dx = +(r.right - s.right + 0);
		} else {
			dx = 0;
		}
		if (r.top < s.top) {
			dy = -(s.top - r.top + 0);
		} else if (r.bottom > s.bottom) {
			dy = +(r.bottom - s.bottom + 0);
		} else {
			dy = 0;
		}
		if (dx != 0 || dy != 0) {
			result |= this.scrollInside(dx, dy, animationTime);
		}
		return result;
	}

	protected scrollInside(dx:number, dy:number, animationTime?:number):UiResult {
		Logs.debug("scrollInside x=%d, y=%d", dx, dy);
		let app = this.application;
		let time = animationTime !== undefined ? animationTime : app.scrollAnimationTime;
		let s = this.getViewRect();
		let result;
		if (time == 0) {
			this.setScroll(s.left + dx, s.top + dy, 1.0);
			result = UiResult.AFFECTED;
		} else {
			app.runAnimation(this, 1, time, false, (step:number) => {
				let sx = s.left + (dx * Math.min(step, 1.0));
				let sy = s.top  + (dy * Math.min(step, 1.0));
				this.setScroll(sx, sy, step);
				return step >= 1.0 ? UiResult.EXIT : UiResult.EATEN;
			});
			result = UiResult.IGNORED;
		}
		return result;
	}

	protected setScroll(x:number, y:number, step:number):void {
		this.scrollLeft = `${x}px`;
		this.scrollTop = `${y}px`;
		if (step >= 1.0) {
			this.application.updateAxis(this);
		}
	}

}