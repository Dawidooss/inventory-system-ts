import { Object } from "shared/utils/Object";

const createGridConfig = <T extends Record<string, GridConfig>>(config: T) => config;
const gridConfigs = createGridConfig({
	backpack: {
		width: 15,
		height: 6,
		unified: false,
	},
	test: {
		width: 6,
		height: 6,
		unified: false,
	},
});

const gridConfigsTypes = Object.keys(gridConfigs);

type Extract<T, U> = T extends U ? T : never;
export type GridTypes = Extract<(typeof gridConfigsTypes)[number], string>;
export type GridConfig = {
	width: number;
	height: number;
	unified: boolean;
};

export default gridConfigs;
