import { useMouse } from "@rbxts/pretty-react-hooks";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import clientState, { RootState } from "client/reflex/clientState";
import { ColorMap, Grid } from "shared/types/inventory";
import canMerge from "shared/utils/inventory/canMerge";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import itemFits from "shared/utils/inventory/itemFits";

export default function useUnifiedGrid(grid: Grid) {
	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);

	const itemsHovering = useSelector((state: RootState) => state.inventoryProducer.itemsHovering);
	const gridHoveringId = useSelector((state: RootState) => state.inventoryProducer.gridHoveringId);
	let cellHovering = useSelector((state: RootState) => state.inventoryProducer.cellHovering);

	const config = getGridConfig(grid);

	// fill colorMap with data
	let colorMap: ColorMap | undefined;
	if (grid && config) {
		let color: Color3 | undefined;
		// handle itemHolding [moving, merging, splitting etc.]
		if (itemHolding && cellHovering && gridHoveringId === grid.id) {
			const targetItem = itemsHovering.filter((v) => v !== itemHolding)[0];

			if (targetItem) {
				// merge case
				const _canMerge = canMerge(itemHolding, targetItem);
				color = _canMerge ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255,0,0); //prettier-ignore
			} else {
				// move case
				const fits = itemFits(grid, itemHolding, [0, 0], true);
				color = fits ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 0, 0);
			}
			// } else if (itemHolding && itemFits(grid, itemHolding, [0, 0], true)) {
			// color = Color3.fromRGB(3, 255, 120);
		} else if (grid.items[0] && grid.items[0] !== itemHolding) {
			color = Color3.fromRGB(255, 175, 78);
		}

		colorMap = {};
		for (let x of $range(0, config.width - 1)) {
			colorMap[x] = {};
			for (let y of $range(0, config.height - 1)) {
				colorMap[x][y] = color;
			}
		}
	}

	return colorMap;
}
