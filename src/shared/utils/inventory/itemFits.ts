import { Grid, Item } from "shared/reflex/inventoryProducer";
import getItemConfig from "../../inventory/getItemConfig";
import { Object } from "../Object";
import isRectInRect from "../isRectTouchingRect";
import { config } from "@rbxts/ripple";
import isRectTouchingRect from "../isRectTouchingRect";

export default function itemFits(grid: Grid, item: Item, position: [number, number]) {
	const itemConfig = getItemConfig(item);

	if (position[0] < 0 || position[0] > grid.width - itemConfig.width) return false;
	if (position[1] < 0 || position[1] > grid.height - itemConfig.height) return false;

	for (let otherItem of grid.items) {
		if (otherItem === item) {
			if (otherItem.x === position[0] && otherItem.y === position[1]) return false;
			continue;
		}

		const otherItemConfig = getItemConfig(otherItem);

		if (
			isRectTouchingRect(
				position[0],
				position[1],
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
