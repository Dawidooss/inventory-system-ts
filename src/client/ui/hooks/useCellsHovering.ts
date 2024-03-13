import { useMountEffect, useMouse } from "@rbxts/pretty-react-hooks";
import { MutableRefObject, useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "client/reflex/clientState";
import { Grid } from "shared/types/inventory";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import isPointInRect from "shared/utils/inventory/isPointInRect";

export default function useCellsHovering(grid: Grid, gridRef: MutableRefObject<GuiBase2d | undefined>) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const [cellHovering, setCellHovering] = useState<[x: number, y: number]>();

	const config = getGridConfig(grid);

	const setCellHoveringMiddleware = (cell?: [number, number]) => {
		if (cell && config.unified) {
			cell = [0, 0];
		}
		setCellHovering(cell);
		clientState.setCellHovering(cell ? grid : undefined, cell);
	};

	useMouse((mouseLocation) => {
		if (gridRef.current) {
			if (isPointInRect(mouseLocation, gridRef.current.AbsolutePosition, gridRef.current.AbsoluteSize)) {
				const gridRelated = mouseLocation.sub(gridRef.current.AbsolutePosition);
				let [x, y] = [math.floor(gridRelated.X / cellSize), math.floor(gridRelated.Y / cellSize)];
				if (x >= 0 && y >= 0 && x < config.width && y < config.height) {
					if (cellHovering?.[0] !== x || cellHovering?.[1] !== y) setCellHoveringMiddleware([x, y]);
					return;
				}
			}
			if (cellHovering !== undefined) setCellHoveringMiddleware(undefined);
		}
	});
	return cellHovering;
}
