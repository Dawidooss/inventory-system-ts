import gridConfigs from "shared/data/gridConfigs";
import { Grid } from "shared/reflex/inventoryProducer";

export default function getGridConfig(gridId: Grid | string) {
	if (typeOf(gridId) === "string") {
		return gridConfigs[gridId as string];
	} else {
		return gridConfigs[(gridId as Grid).type];
	}
}
