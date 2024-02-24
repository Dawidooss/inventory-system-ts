export namespace Object {
	export function entries<V>(dict: { [key: string]: V }) {
		const array: [string, V][] = [];

		for (let [k, v] of pairs(dict)) {
			array.push([k as string, v]);
		}

		return array;
	}
}
