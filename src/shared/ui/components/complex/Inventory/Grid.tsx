import { useMouse } from "@rbxts/pretty-react-hooks";
import React, { useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import getItemConfig from "shared/inventory/getItemConfig";
import clientState, { RootState } from "shared/reflex/clientState";
import { Grid } from "shared/reflex/inventoryProducer";
import canMerge from "shared/utils/inventory/canMerge";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import itemFits from "shared/utils/inventory/itemFits";
import Full from "../../basic/Full";
import LoadingCircle from "../../basic/LoadingCircle";
import Cell from "./Cell";
import Item from "./Item";
import Splitting from "./Splitting";

type Props = {
	Position: UDim2;
	Data?: Grid;
	Unified?: boolean;
};

type ColorMap = { [key: number]: { [key: number]: Color3 } };
export default function Grid(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const splitting = useSelector((state: RootState) => !!state.inventoryProducer.splitting);

	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);

	const itemsHovering = useSelector((state: RootState) => state.inventoryProducer.itemsHovering);
	const gridHoveringId = useSelector((state: RootState) => state.inventoryProducer.gridHoveringId);
	let cellHovering = useSelector((state: RootState) => state.inventoryProducer.cellHovering);

	const gridRef = useRef<Frame>();
	let colorMap: ColorMap = {};

	// update which cell is hovering
	const updateHoveringCell = () => {
		if (!props.Data) return;

		const grid = gridRef.current;
		if (!grid) return;

		const mouseLocation = UserInputService.GetMouseLocation().sub(GuiService.GetGuiInset()[0]);

		// if mouse is inside cell
		if (isPointInRect(mouseLocation, grid.AbsolutePosition, grid.AbsoluteSize)) {
			// calculate cell
			const gridRelated = mouseLocation.sub(grid.AbsolutePosition);
			let [x, y] = [math.floor(gridRelated.X / cellSize), math.floor(gridRelated.Y / cellSize)];

			// only set cell which is inside grid bounds [0, width-1], [0, height-1]
			if (x >= 0 && y >= 0 && x < props.Data.width && y < props.Data.height) {
				if (!(gridHoveringId === props.Data.id && cellHovering?.[0] === x && cellHovering?.[1] === y)) {
					clientState.setCellHovering(props.Data.id, [x, y]);
					cellHovering = [x, y]; // we also have to update state in current render
				}
				return;
			}
		}
		// no longer hovering any cell
		if (gridHoveringId === props.Data.id && cellHovering) {
			clientState.setCellHovering();
			cellHovering = undefined; // we also have to update state in current render
		}
	};

	// fill colorMap with data
	if (props.Data) {
		for (let x of $range(0, props.Data.width - 1)) {
			colorMap[x] = {};
		}

		// loop through items and add them to colorMap as occupied
		for (let [, item] of pairs(props.Data.items)) {
			const itemConfig = getItemConfig(item);
			for (let sX of $range(0, itemConfig.width - 1)) {
				for (let sY of $range(0, itemConfig.height - 1)) {
					// don't override other colors
					colorMap[item.x + sX][item.y + sY] = Color3.fromRGB(255, 175, 78);
				}
			}
		}

		// handle itemHolding [moving, merging, splitting etc.]
		if (itemHolding && cellHovering && gridHoveringId === props.Data.id) {
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
				const fits = itemFits(props.Data, itemHolding, [x, y], splitting);

				// loop cells and update colors
				for (let sX of $range(0, itemConfig.width - 1)) {
					for (let sY of $range(0, itemConfig.height - 1)) {
						// out of bonds
						if (x + sX >= props.Data.width || y + sY >= props.Data.height || x + sX < 0 || y + sY < 0)
							continue;

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

	return (
		<Full>
			{props.Data ? (
				<frame
					Size={UDim2.fromOffset(props.Data!.width * cellSize, props.Data!.height * cellSize)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={props.Position}
					BackgroundTransparency={1}
					ref={gridRef}
				>
					<Full>
						<uigridlayout CellSize={new UDim2(0, cellSize, 0, cellSize)} CellPadding={new UDim2()} />

						{table.create(props.Data!.width * props.Data!.height, 0).map((v, i) => {
							const y = math.floor(i / props.Data!.width);
							const x = i - y * props.Data!.width;

							return <Cell key={v} Color={colorMap[x] && colorMap[x][y]} />;
						})}
					</Full>
					{props.Data!.items.map((v) => (
						<Item key={v.id} Data={v} Locked={v.id === itemHolding?.id || v.locked} />
					))}
				</frame>
			) : (
				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={props.Position}
					Size={UDim2.fromOffset(75, 75)}
					BackgroundTransparency={1}
				>
					<LoadingCircle />
				</frame>
			)}
		</Full>
	);
}
