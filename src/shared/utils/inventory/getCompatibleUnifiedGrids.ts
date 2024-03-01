import { Grid, Item } from "shared/reflex/inventoryProducer";
import getGridConfig from "./getGridConfig";
import getItemConfig from "shared/inventory/getItemConfig";

export default function getCompatibleUnifiedGrids(grids: { [id: string]: Grid }, item?: Item) {
	const compatibleGrids: Grid[] = [];
	for (let [gridId, grid] of pairs(grids)) {
		const gridConfig = getGridConfig(grid);
		if (!gridConfig.unified) continue;
		if (item) {
			const itemConfig = getItemConfig(item);
			if (gridConfig.itemTypes && !gridConfig.itemTypes.find((v) => v === itemConfig.type)) continue;
			compatibleGrids.push(grid);
		}
	}

	return compatibleGrids;
}
