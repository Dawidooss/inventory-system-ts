import { Keys } from "@rbxts/reflex";
import { Grid } from "shared/reflex/inventoryProducer";
import { Object } from "shared/utils/Object";

type Extract<T, U> = T extends U ? T : never;

export type GridConfig = {
	width: number;
	height: number;
	unified: boolean;
};

const gridConfigs = {
	backpack: {
		width: 15,
		height: 6,
		unified: false,
	},
	giga: {
		width: 15,
		height: 6,
		unified: false,
	},
};

const gridConfigsKeys = Object.keys(gridConfigs);
export type GridKeys = Extract<(typeof gridConfigsKeys)[number], string>;

export default gridConfigs;
