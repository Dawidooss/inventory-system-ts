import { Grid, Item } from "shared/reflex/inventoryProducer";
import getItemConfig from "./getItemConfig";
import { Object } from "./Object";
import isRectInRect from "./isRectTouchingRect";
import { config } from "@rbxts/ripple";
import isRectTouchingRect from "./isRectTouchingRect";

export default function itemFits(grid: Grid, item: Item, x: number, y: number) {
	const itemConfig = getItemConfig(item.name);

	if (x < 0 || x > grid.width - itemConfig.width) return false;
	if (y < 0 || y > grid.height - itemConfig.height) return false;

	for (let [id, otherItem] of Object.entries(grid.items)) {
		if (otherItem === item) continue;

		const otherItemConfig = getItemConfig(otherItem.name);

		if (
			isRectTouchingRect(
				x,
				y,
				itemConfig.width,
				itemConfig.height,
				otherItem.x,
				otherItem.y,
				otherItemConfig.width,
				otherItemConfig.height,
			)
		)
			return false;
	}

	return true;
}
