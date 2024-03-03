import { Grid, Item } from "shared/types/inventory";
import { Object } from "../Object";
import { NamedExoticComponent } from "@rbxts/react";

export function findItem(grids: { [gridId: string]: Grid }, itemId: string): [Item | undefined, string | undefined] {
	for (let [gridId, grid] of Object.entries(grids)) {
		const item = grid.items.find((v) => v.id === itemId);
		if (item) {
			return [item, gridId];
		}
	}
	return [undefined, undefined];
}
