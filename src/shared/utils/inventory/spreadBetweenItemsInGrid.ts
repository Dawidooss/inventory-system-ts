import { Grid, Item } from "shared/types/inventory";
import canMerge from "./canMerge";
import getItemConfig from "./getItemConfig";

export default function spreadBetweenItemsInGrid(
	grid: Grid,
	item: Item,
): [itemsAffected: [Item, quantity: number][], remainder: number] {
	const itemConfig = getItemConfig(item);

	const itemsAffected: [Item, number][] = [];
	let toSpread = item.quantity;
	for (const targetItem of grid.items) {
		if (toSpread <= 0) break;
		if (canMerge(item, targetItem)) {
			const mergeQuantity = math.clamp(itemConfig.max - targetItem.quantity, 0, toSpread);
			toSpread -= mergeQuantity;
			itemsAffected.push([targetItem, targetItem.quantity + mergeQuantity]);
		}
	}

	return [itemsAffected, toSpread];
}
