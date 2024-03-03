import { GridConfig } from "shared/types/inventory";

const createGridConfig = <T extends Record<string, GridConfig>>(config: T) => config;
const gridConfigs = createGridConfig({
	backpack: {
		width: 15,
		height: 6,
	},
	primary: {
		width: 5,
		height: 2,
		unified: true,
		text: "Primary",

		equippable: true,
		itemTypes: ["tool"],
		equipPriority: 3,
	},
	secondary: {
		width: 3,
		height: 2,
		unified: true,
		text: "Secondary",

		equippable: true,
		equipPriority: 2,
	},
	melee: {
		width: 1,
		height: 2,
		unified: true,
		text: "Melee",

		equippable: true,
		equipPriority: 1,
	},
});

export default gridConfigs;
