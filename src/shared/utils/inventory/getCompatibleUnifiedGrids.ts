import getGridConfig from "./getGridConfig";
import getItemConfig from "shared/inventory/getItemConfig";
import { Object } from "../Object";
import { Grid, Item } from "shared/types/inventory";

export default function getCompatibleUnifiedGrids(grids: { [id: string]: Grid }, item?: Item) {
	const compatibleGrids: [priority: number, Grid][] = [];
	for (let [gridId, grid] of pairs(grids)) {
		if (grid.items[0]) continue;
		const gridConfig = getGridConfig(grid);
		if (!gridConfig.unified) continue;
		if (item) {
			const itemConfig = getItemConfig(item);
			if (gridConfig.itemTypes && !gridConfig.itemTypes.find((v) => v === itemConfig.type)) continue;
			compatibleGrids.push([gridConfig.equipPriority || 0, grid]);
		}
	}

	table.sort(compatibleGrids, (a, b) => a[0] > b[0]);

	return compatibleGrids.map(([, grid]) => grid);
}
