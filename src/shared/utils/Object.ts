export namespace Object {
	export function entries<V>(dict: { [key: string]: V }) {
		const array: [string, V][] = [];

		for (let [k, v] of pairs(dict)) {
			array.push([k as string, v]);
		}

		return array;
	}

	export function keys<T extends object>(obj: T): (keyof T)[] {
		const keys: (keyof T)[] = [];
		for (const [key] of pairs(obj)) {
			keys.push(key as keyof T);
		}
		return keys;
	}
}
