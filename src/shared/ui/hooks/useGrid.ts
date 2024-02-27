import { useMouse } from "@rbxts/pretty-react-hooks";
import { useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import getItemConfig from "shared/inventory/getItemConfig";
import clientState, { RootState } from "shared/reflex/clientState";
import { Grid } from "shared/reflex/inventoryProducer";
import canMerge from "shared/utils/inventory/canMerge";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import itemFits from "shared/utils/inventory/itemFits";

export type ColorMap = { [key: number]: { [key: number]: Color3 | undefined } };

export default function useGrid(gridRef: React.MutableRefObject<Frame | undefined>, grid: Grid) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const splittingKeyDown = useSelector((state: RootState) => !!state.inventoryProducer.splittingKeyDown);

	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);

	const itemsHovering = useSelector((state: RootState) => state.inventoryProducer.itemsHovering);
	const gridHoveringId = useSelector((state: RootState) => state.inventoryProducer.gridHoveringId);
	let cellHovering = useSelector((state: RootState) => state.inventoryProducer.cellHovering);

	const config = getGridConfig(grid);
	let colorMap: ColorMap | undefined;

	// update which cell is hovering
	const updateHoveringCell = () => {
		if (!gridRef.current) return;

		const mouseLocation = UserInputService.GetMouseLocation().sub(GuiService.GetGuiInset()[0]);

		// if mouse is inside cell
		if (isPointInRect(mouseLocation, gridRef.current.AbsolutePosition, gridRef.current.AbsoluteSize)) {
			// calculate cell
			const gridRelated = mouseLocation.sub(gridRef.current.AbsolutePosition);
			let [x, y] = [math.floor(gridRelated.X / cellSize), math.floor(gridRelated.Y / cellSize)];

			// only set cell which is inside grid bounds [0, width-1], [0, height-1]
			if (x >= 0 && y >= 0 && x < config.width && y < config.height) {
				if (!(gridHoveringId === grid.id && cellHovering?.[0] === x && cellHovering?.[1] === y)) {
					clientState.setCellHovering(grid.id, [x, y]);
					cellHovering = [x, y]; // we also have to update state in current render
				}
				return;
			}
		}
		// no longer hovering any cell
		if (gridHoveringId === grid.id && cellHovering) {
			clientState.setCellHovering();
			cellHovering = undefined; // we also have to update state in current render
		}
	};

	// fill colorMap with data
	if (grid && config) {
		colorMap = {};
		for (let x of $range(0, config.width - 1)) {
			colorMap[x] = {};
		}

		// loop through items and add them to colorMap as occupied
		for (let [, item] of pairs(grid.items)) {
			const itemConfig = getItemConfig(item);
			for (let sX of $range(0, itemConfig.width - 1)) {
				for (let sY of $range(0, itemConfig.height - 1)) {
					// don't override other colors
					colorMap[item.x + sX][item.y + sY] = Color3.fromRGB(255, 175, 78);
				}
			}
		}

		// handle itemHolding [moving, merging, splitting etc.]
		if (itemHolding && cellHovering && gridHoveringId === grid.id) {
			const targetItem = itemsHovering.filter((v) => v !== itemHolding)[0];
			const itemConfig = getItemConfig(itemHolding?.name);
			let [x, y] = [cellHovering[0], cellHovering[1]];

			x -= itemHoldingCellOffset[0];
			y -= itemHoldingCellOffset[1];

			if (targetItem) {
				// merge case
				const _canMerge = canMerge(itemHolding, targetItem);
				for (let sX of $range(0, itemConfig.width - 1)) {
					for (let sY of $range(0, itemConfig.height - 1)) {
						colorMap[targetItem.x + sX][targetItem.y + sY] = _canMerge ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255,0,0); //prettier-ignore
					}
				}
			} else {
				// move case
				const fits = itemFits(grid, itemHolding, [x, y], !splittingKeyDown);

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
	}

	useMouse(() => {
		if (itemHoldingCellOffset) {
			updateHoveringCell();
		}
	});

	return colorMap;
}
