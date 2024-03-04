import gridConfigs from "shared/data/gridConfigs";
import { Object } from "shared/utils/Object";

type Extract<T, U> = T extends U ? T : never;

export type Item = {
	id: string;
	quantity: number;
	name: string;
	x: number;
	y: number;
	locked: boolean;
	mockup?: boolean;
};

export type ItemConfig = {
	name: string;
	image: string;
	description?: string;

	width: number;
	height: number;
	max: number;
	type?: string;
};

export type Tool = Item & {};

export type Grid = {
	id: string;
	name: string;
	type: GridTypes;
	items: Item[];
};

export type ContextMenuOptions = {
	[key: string]: {
		color?: Color3;
		order?: number;
		callback: (item: Item) => void;
	};
};

const gridConfigsTypes = Object.keys(gridConfigs);
export type GridTypes = Extract<(typeof gridConfigsTypes)[number], string>;
export type GridConfig = {
	width: number;
	height: number;
	unified?: boolean;
	text?: string;
	equippable?: boolean;
	itemTypes?: string[];
	equipPriority?: number;
};

export type InventoryMap = { [gridName: string]: string };
export type ColorMap = { [key: number]: { [key: number]: Color3 | undefined } };
