import getItemConfig from "../../inventory/getItemConfig";
import { Object } from "../Object";
import isRectInRect from "../isRectTouchingRect";
import { config } from "@rbxts/ripple";
import isRectTouchingRect from "../isRectTouchingRect";
import getGridConfig from "./getGridConfig";
import { Grid, GridConfig, Item } from "shared/types/inventory";

function isSpaceAvailable(grid: Grid, position: [number, number], size: [number, number]): boolean {
	const itemsInGrid = grid.items;
	for (const item of itemsInGrid) {
		if (
			!item.locked &&
			item.x <= position[0] &&
			position[0] + size[0] <= item.x + getItemConfig(item).width &&
			item.y <= position[1] &&
			position[1] + size[1] <= item.y + getItemConfig(item).height
		) {
			return false;
		}
	}
	return true;
}

export default function findSpace(grid: Grid, item: Item): [true, [number, number]] | [false] {
	const itemConfig: ItemConfig = getItemConfig(item);
	const gridConfig: GridConfig = getGridConfig(grid);

	for (let y = 0; y < gridConfig.height; y++) {
		for (let x = 0; x < gridConfig.width; x++) {
			if (isSpaceAvailable(grid, [x, y], [itemConfig.width, itemConfig.height])) {
				return [true, [x, y]];
			}
		}
	}

	return [false];
}
