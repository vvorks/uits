export class Arrays {

	public static divide<T>(array:T[], filter:(e:T)=>boolean):[T[],T[]] {
		let matched:T[] = [];
		let another:T[] = [];
		for (let e of array) {
			if (filter(e)) {
				matched.push(e);
			} else {
				another.push(e);
			}
		}
		return [matched, another];
	}

}