import React, { createRef, useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { DataStoreService, GuiService, RunService, UserInputService, Workspace } from "@rbxts/services";
import { RootState } from "shared/reflex/clientState";
import { Grid } from "shared/reflex/inventoryProducer";
import Full from "../Full";
import Item from "./Item";
import Cell from "./Cell";
import getItemConfig from "shared/utils/getItemConfig";
import { Object } from "shared/utils/Object";
import { useMouse } from "@rbxts/pretty-react-hooks";
import itemFits from "shared/utils/itemFits";
import LoadingCircle from "../LoadingCircle";

type Props = {
	Position: UDim2;
	AnchorPoint?: Vector2;
	Data?: Grid;
	Unified?: boolean;
};

const camera = Workspace.CurrentCamera!;

type ColorMap = { [key: number]: { [key: number]: Color3 } };

export default function Grid(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const itemHoldingId = useSelector((state: RootState) => state.inventoryProducer.itemHoldingId);
	const itemHoldingOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingOffset);

	const [colorMap, setColorMap] = useState<ColorMap>({});

	const gridRef = useRef<Frame>();

	const updateColorMap = useCallback(() => {
		// create newColorMap
		if (!props.Data) return;
		let newColorMap: ColorMap = {};
		for (let x of $range(0, props.Data.width - 1)) {
			newColorMap[x] = {};
		}

		// loop through items and add them to colorMap
		for (let [id, item] of pairs(props.Data.items)) {
			const itemConfig = getItemConfig(item.name);
			if (id === itemHoldingId) {
				// check if hovering over cells and if fits
				const mouseLocation = UserInputService.GetMouseLocation()
					.add(GuiService.GetGuiInset()[0])
					.add(new Vector2(cellSize / 2, cellSize / 2));
				// mouse location offseted by grab offset (top-left corner of item)
				const holdingItemLocation = mouseLocation.add(itemHoldingOffset);

				// holdingItemLocation related to grid
				const gridOffset = holdingItemLocation.sub(gridRef.current!.AbsolutePosition);
				// get cell from pixels
				const [x, y] = [math.floor(gridOffset.X / cellSize), math.floor(gridOffset.Y / cellSize)];

				const fits = itemFits(props.Data, item, x, y);

				// loop cells and update colors
				for (let sX of $range(0, itemConfig.width - 1)) {
					for (let sY of $range(0, itemConfig.height - 1)) {
						// out of bonds
						if (x + sX >= props.Data.width || y + sY >= props.Data.height || x + sX < 0 || y + sY < 0)
							continue;

						newColorMap[x + sX][y + sY] = fits ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 0, 0);
					}
				}
			} else {
				// add as occupied
				for (let sX of $range(0, itemConfig.width - 1)) {
					for (let sY of $range(0, itemConfig.height - 1)) {
						// don't override other colors
						if (newColorMap[item.x + sX][item.y + sY]) continue;
						newColorMap[item.x + sX][item.y + sY] = Color3.fromRGB(255, 175, 78);
					}
				}
			}
		}

		setColorMap(newColorMap);
	}, [cellSize, itemHoldingId]);

	useEffect(() => {
		updateColorMap();
	}, [itemHoldingId]);

	useMouse(() => {
		if (itemHoldingOffset) {
			updateColorMap();
		}
	});

	return (
		<Full>
			{props.Data ? (
				<frame
					Size={UDim2.fromOffset(props.Data!.width * cellSize, props.Data!.height * cellSize)}
					AnchorPoint={props.AnchorPoint}
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
					{Object.entries(props.Data!.items)
						.filter(([id]) => {
							return id !== itemHoldingId;
						})
						.map(([id, v]) => (
							<Item key={id} Data={v} Id={id} />
						))}
				</frame>
			) : (
				<LoadingCircle AnchorPoint={props.AnchorPoint} Position={props.Position} rotate={true} />
			)}
		</Full>
	);
}
