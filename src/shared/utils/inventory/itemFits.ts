import { Grid, Item } from "shared/types/inventory";
import getItemConfig from "../../inventory/getItemConfig";
import isRectTouchingRect from "../isRectTouchingRect";
import getGridConfig from "./getGridConfig";

export default function itemFits(grid: Grid, item: Item, position: [number, number], ignoreItem: boolean) {
	const itemConfig = getItemConfig(item);
	const gridConfig = getGridConfig(grid);

	print(position);
	if (position[0] < 0 || position[0] > gridConfig.width - (item.rotated ? itemConfig.height : itemConfig.width))
		return false;
	if (position[1] < 0 || position[1] > gridConfig.height - (item.rotated ? itemConfig.width : itemConfig.height))
		return false;

	if (gridConfig.itemTypes && !gridConfig.itemTypes.find((v) => v === itemConfig.type)) return;

	for (let otherItem of grid.items) {
		if (ignoreItem && otherItem === item) {
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
				otherItem.rotated ? otherItemConfig.height : otherItemConfig.width,
				otherItem.rotated ? otherItemConfig.width : otherItemConfig.height,
			)
		)
			return false;
	}

	return true;
}
