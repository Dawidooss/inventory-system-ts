import gridConfigs, { GridConfig, GridTypes } from "shared/data/gridConfigs";
import { Grid } from "shared/reflex/inventoryProducer";

export default function getGridConfig(gridId: Grid | GridTypes): GridConfig {
	if (typeIs(gridId, "string")) {
		return gridConfigs[gridId as GridTypes];
	} else {
		return gridConfigs[(gridId as Grid).type];
	}
}
