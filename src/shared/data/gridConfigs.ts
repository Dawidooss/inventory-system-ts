import { Object } from "shared/utils/Object";

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
	},
	secondary: {
		width: 3,
		height: 2,
		unified: true,
		text: "Secondary",
	},
	melee: {
		width: 1,
		height: 1,
		unified: true,
		text: "Melee",
	},
});

const gridConfigsTypes = Object.keys(gridConfigs);

type Extract<T, U> = T extends U ? T : never;
export type GridTypes = Extract<(typeof gridConfigsTypes)[number], string>;
export type GridConfig = {
	width: number;
	height: number;
	unified?: boolean;
	text?: string;
};

export default gridConfigs;
