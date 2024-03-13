import { useMouse } from "@rbxts/pretty-react-hooks";
import { useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import clientState, { RootState } from "client/reflex/clientState";
import getItemConfig from "shared/utils/inventory/getItemConfig";
import { ColorMap, Grid } from "shared/types/inventory";
import canMerge from "shared/utils/inventory/canMerge";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import itemFits from "shared/utils/inventory/itemFits";

export default function useGridColorMap(grid: Grid, cellHovering?: [x: number, y: number]) {
	const splitKeyDown = useSelector((state: RootState) => !!state.inventoryProducer.splitKeyDown);

	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);
	const targetItem = useSelector((state: RootState) => state.inventoryProducer.targetItem);

	const config = getGridConfig(grid);
	// fill colorMap with empty data
	let colorMap: ColorMap = {};
	for (let x of $range(0, config.width - 1)) {
		colorMap[x] = {};
	}

	// loop through items and add them to colorMap as occupied
	for (let [, item] of pairs(grid.items)) {
		if (item === itemHolding) continue;
		const itemConfig = getItemConfig(item);
		for (let sX of $range(0, itemConfig.width - 1)) {
			for (let sY of $range(0, itemConfig.height - 1)) {
				// don't override other colors
				colorMap[item.x + sX][item.y + sY] = Color3.fromRGB(255, 175, 78);
			}
		}
	}

	// handle itemHolding [moving, merging, splitting etc.]
	if (itemHolding && cellHovering) {
		const itemConfig = getItemConfig(itemHolding?.name);

		let [x, y] = [cellHovering[0], cellHovering[1]];

		x -= itemHoldingCellOffset[0];
		y -= itemHoldingCellOffset[1];

		if (targetItem) {
			const targetItemConfig = getItemConfig(targetItem);
			// merge case
			const _canMerge = canMerge(itemHolding, targetItem);
			for (let sX of $range(0, targetItemConfig.width - 1)) {
				for (let sY of $range(0, targetItemConfig.height - 1)) {
					colorMap[targetItem.x + sX][targetItem.y + sY] = _canMerge ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255,0,0); //prettier-ignore
				}
			}
		} else {
			// move case
			const fits = itemFits(grid, itemHolding, [x, y], !splitKeyDown);

			// loop cells and update colors
			for (let sX of $range(0, itemConfig.width - 1)) {
				for (let sY of $range(0, itemConfig.height - 1)) {
					// out of bonds
					if (x + sX >= config.width || y + sY >= config.height || x + sX < 0 || y + sY < 0) continue;
					colorMap[x + sX][y + sY] = fits ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 0, 0);
				}
			}
		}
	}

	return colorMap;
}
