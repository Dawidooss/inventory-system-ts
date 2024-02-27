import { useMouse } from "@rbxts/pretty-react-hooks";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import clientState, { RootState } from "shared/reflex/clientState";
import { Grid } from "shared/reflex/inventoryProducer";
import canMerge from "shared/utils/inventory/canMerge";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import itemFits from "shared/utils/inventory/itemFits";
import { ColorMap } from "./useGrid";

export default function useUnifiedGrid(gridRef: React.MutableRefObject<Frame | undefined>, grid: Grid) {
	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);

	const itemsHovering = useSelector((state: RootState) => state.inventoryProducer.itemsHovering);
	const gridHoveringId = useSelector((state: RootState) => state.inventoryProducer.gridHoveringId);
	let cellHovering = useSelector((state: RootState) => state.inventoryProducer.cellHovering);

	const config = getGridConfig(grid);

	// update which cell is hovering
	const updateHoveringCell = () => {
		if (!gridRef.current) return;

		const mouseLocation = UserInputService.GetMouseLocation().sub(GuiService.GetGuiInset()[0]);

		// if mouse is inside cell
		if (isPointInRect(mouseLocation, gridRef.current.AbsolutePosition, gridRef.current.AbsoluteSize)) {
			clientState.setCellHovering(grid.id, [0, 0]);
			return;
		}
		// no longer hovering any cell
		if (gridHoveringId === grid.id && cellHovering) {
			clientState.setCellHovering();
			cellHovering = undefined; // we also have to update state in current render
		}
	};

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
		} else if (grid.items[0]) {
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

	useMouse(() => {
		if (itemHoldingCellOffset) {
			updateHoveringCell();
		}
	});

	return colorMap;
}
