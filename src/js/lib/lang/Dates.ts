const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR   = 60 * MINUTE;
const DAY    = 24 * HOUR;

export class Dates {

	/**
	 * 日数加算
	 *
	 * @param date 日付オブジェクト
	 * @param days 加算日数。負の場合、結果は過去となる
	 * @returns 加算後の日付オブジェクト
	 */
	public static addDay(date:Date, days:number):Date {
		return new Date(date.getTime() + days * DAY);
	}

	/**
	 * 月初日を取得する
	 *
	 * @param date
	 */
	public static getBeginningOfMonth(date:Date):Date {
		let result = new Date(date.getTime());
		result.setDate(1);
		return result;
	}

	/**
	 * 月末日を取得する
	 *
	 * @param date
	 */
	public static getEndOfMonth(date:Date):Date {
		let result = new Date(date.getTime());
		result.setDate(32); //次月に設定
		result.setDate(0);  //先月末に再設定
		return result;
	}

	/**
	 * 次月（の月初日）を取得する
	 *
	 * @param date
	 */
	public static getNextMonth(date:Date):Date {
		let result = new Date(date.getTime());
		result.setDate(32); //次月に設定
		result.setDate(1);  //月初に再設定
		return result;
	}

	/**
	 * 先月（の月末日）を取得する
	 *
	 * @param date
	 */
	public static getLastMonth(date:Date):Date {
		let result = new Date(date.getTime());
		result.setDate(0); //先月末に設定
		return result;
	}

	/**
	 * 次年を取得する
	 *
	 * @param date
	 */
	public static getNextYear(date:Date):Date {
		let result = new Date(date.getTime());
		result.setFullYear(date.getFullYear()+1);
		return result;
	}

	/**
	 * 先年を取得する
	 *
	 * @param date
	 */
	public static getLastYear(date:Date):Date {
		let result = new Date(date.getTime());
		result.setFullYear(date.getFullYear()-1);
		return result;
	}

	/**
	 * 同年判定
	 *
	 * @param d1
	 * @param d2
	 * @returns 同年の場合、真
	 */
	public static isSameYear(d1:Date, d2:Date):boolean {
		return d1.getFullYear() == d2.getFullYear();
	}

	/**
	 * 同年同月判定
	 *
	 * @param d1
	 * @param d2
	 * @returns 同年同月の場合、真
	 */
	public static isSameMonth(d1:Date, d2:Date):boolean {
		return	d1.getFullYear() == d2.getFullYear() &&
				d1.getMonth()    == d2.getMonth();
	}

	/**
	 * 同年同月同日判定
	 *
	 * @param d1
	 * @param d2
	 * @returns 同年同月同日の場合、真
	 */
	public static isSameDay(d1:Date, d2:Date):boolean {
		return	d1.getFullYear() == d2.getFullYear() &&
				d1.getMonth()    == d2.getMonth()    &&
				d1.getDate()     == d2.getDate()      ;
	}

}