import { Object } from "../Object";
import { Grid, Item } from "shared/reflex/inventoryProducer";

export function findItem(grids: { [gridId: string]: Grid }, itemId: string): [Item | undefined, string | undefined] {
	for (let [gridId, grid] of Object.entries(grids)) {
		if (grid.items[itemId]) {
			return [grid.items[itemId], gridId];
		}
	}
	return [undefined, undefined];
}
