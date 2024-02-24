import React, { createRef, useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { DataStoreService, GuiService, RunService, UserInputService, Workspace } from "@rbxts/services";
import clientState, { RootState } from "shared/reflex/clientState";
import { Grid } from "shared/reflex/inventoryProducer";
import Full from "../Full";
import Item from "./Item";
import Cell from "./Cell";
import getItemConfig from "shared/inventory/getItemConfig";
import { Object } from "shared/utils/Object";
import { useMouse } from "@rbxts/pretty-react-hooks";
import itemFits from "shared/utils/inventory/itemFits";
import LoadingCircle from "../LoadingCircle";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import { findItem } from "shared/utils/inventory/findItem";
import { config } from "@rbxts/ripple";

type Props = {
	Id: string;
	Position: UDim2;
	Data?: Grid;
	Unified?: boolean;
};

const camera = Workspace.CurrentCamera!;

type ColorMap = { [key: number]: { [key: number]: Color3 } };

export default function Grid(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);

	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingId = useSelector((state: RootState) => state.inventoryProducer.itemHoldingId);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);

	const hoveringItems = useSelector((state: RootState) => state.inventoryProducer.hoveringItems);
	const hoveringCell = useSelector((state: RootState) => state.inventoryProducer.hoveringCell);
	const hoveringGridId = useSelector((state: RootState) => state.inventoryProducer.hoveringGridId);

	const gridRef = useRef<Frame>();

	const updateHoveringCell = () => {
		if (!props.Data) return;

		const grid = gridRef.current!;

		const mouseLocation = UserInputService.GetMouseLocation();

		if (isPointInRect(mouseLocation, grid.AbsolutePosition, grid.AbsoluteSize)) {
			const gridRelated = mouseLocation.sub(grid.AbsolutePosition);
			let [x, y] = [math.floor(gridRelated.X / cellSize), math.floor(gridRelated.Y / cellSize)];
			x -= itemHoldingCellOffset[0];
			y -= itemHoldingCellOffset[1];

			if (x >= 0 && y >= 0 && x < props.Data.width && y < props.Data.height) {
				if (!(hoveringGridId === props.Id && hoveringCell?.[0] === x && hoveringCell?.[1] === y)) {
					clientState.setHoveringCell(props.Id, [x, y]);
				}
				return;
			}
		}
		if (hoveringGridId === props.Id) {
			clientState.setHoveringCell();
		}
	};

	let colorMap: ColorMap = {};
	if (props.Data) {
		for (let x of $range(0, props.Data.width - 1)) {
			colorMap[x] = {};
		}

		if (itemHolding && hoveringCell) {
			const otherHoveringItem = hoveringItems.filter((v) => v !== itemHolding)[0];
			const itemConfig = getItemConfig(itemHolding?.name);
			let [x, y] = [hoveringCell[0], hoveringCell[1]];

			// merge stuff
			let merged = false;
			if (otherHoveringItem) {
				if (
					otherHoveringItem &&
					otherHoveringItem.name === itemHolding.name &&
					otherHoveringItem.quantity < itemConfig.max
				) {
					for (let sX of $range(0, itemConfig.width - 1)) {
						for (let sY of $range(0, itemConfig.height - 1)) {
							colorMap[otherHoveringItem.x + sX][otherHoveringItem.y + sY] = Color3.fromRGB(0, 255, 0); //prettier-ignore
							merged = true;
						}
					}
				}
			}

			// move stuff
			if (!merged) {
				const fits = itemFits(props.Data, itemHolding, [x, y]);

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
		// loop through items and add them to colorMap
		for (let [id, item] of pairs(props.Data.items)) {
			const itemConfig = getItemConfig(item);
			// add as occupied
			for (let sX of $range(0, itemConfig.width - 1)) {
				for (let sY of $range(0, itemConfig.height - 1)) {
					// don't override other colors
					if (colorMap[item.x + sX][item.y + sY]) continue;
					colorMap[item.x + sX][item.y + sY] = Color3.fromRGB(255, 175, 78);
				}
			}
		}
	}
	useEffect(() => {
		updateHoveringCell();
	}, [itemHoldingId, props.Data, hoveringCell]);

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
						<Item key={v.id} Data={v} Id={v.id} Locked={v.id === itemHoldingId || v.locked} />
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
