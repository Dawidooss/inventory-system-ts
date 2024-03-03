import gridConfigs from "shared/data/gridConfigs";
import { Grid, GridConfig, GridTypes } from "shared/types/inventory";

export default function getGridConfig(gridId: Grid | GridTypes): GridConfig {
	if (typeIs(gridId, "string")) {
		return gridConfigs[gridId as GridTypes];
	} else {
		return gridConfigs[(gridId as Grid).type];
	}
}
