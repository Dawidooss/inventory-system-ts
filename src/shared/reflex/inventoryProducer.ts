import { Ref } from "@rbxts/react";
import { createProducer } from "@rbxts/reflex";
import { HttpService } from "@rbxts/services";
import { findItem } from "shared/utils/inventory/findItem";
import clientState from "./clientState";

export interface InventoryProducer {
	cellSize: number;
	splitting: boolean;

	inventories: { [id: string]: InventoryMap };
	grids: { [id: string]: Grid };

	itemHolding?: Item;
	itemHoldingId?: string;
	itemHoldingOffset: [number, number];
	itemHoldingCellOffset: [number, number];

	hoveringGridId?: string;
	hoveringCell?: [number, number];
	hoveringItems: Item[];
}

const initialState: InventoryProducer = {
	splitting: false,
	inventories: {},
	grids: {},
	cellSize: 50,
	itemHoldingOffset: [0, 0],
	itemHoldingCellOffset: [0, 0],
	hoveringItems: [],
};

const inventoryProducer = createProducer(initialState, {
	setCellSize: (state: InventoryProducer, cellSize: InventoryProducer["cellSize"]) => ({
		...state,
		cellSize,
	}),

	setSplitting: (state: InventoryProducer, splitting: InventoryProducer["splitting"]) => ({
		...state,
		splitting,
	}),

	setHoveringCell: (
		state: InventoryProducer,
		hoveringGridId?: InventoryProducer["hoveringGridId"],
		hoveringCell?: InventoryProducer["hoveringCell"],
	) => ({
		...state,
		hoveringCell,
		hoveringGridId,
	}),

	setHoveringItem: (state: InventoryProducer, item: Item, hovering: boolean) => {
		state.hoveringItems = state.hoveringItems.filter((v) => v !== item);
		if (hovering === true) {
			state.hoveringItems.push(item);
		}
		return { ...state, hoveringItemsIds: [...state.hoveringItems] };
	},

	addItem: (state: InventoryProducer, gridId: string, item: Item) => {
		state.grids[gridId].items.push(item);
		return { ...state };
	},

	removeItem: (state: InventoryProducer, item: Item) => {
		const [_, gridId] = findItem(state.grids, item.id) || [];

		if (gridId) {
			state.grids[gridId] = { ...state.grids[gridId] };
			state.grids[gridId].items = [...state.grids[gridId].items.filter((v) => v !== item)];
		}
		return { ...state, grids: { ...state.grids } };
	},

	setGrid: (state: InventoryProducer, id: string, data: Grid) => {
		state.grids[id] = data;
		return { ...state };
	},

	setInventory: (state: InventoryProducer, inventoryId: string, inventoryMap: InventoryMap) => {
		state.inventories[inventoryId] = inventoryMap;
		return { ...state };
	},

	holdItem: (
		state: InventoryProducer,
		itemHolding?: InventoryProducer["itemHolding"],
		itemHoldingId?: InventoryProducer["itemHoldingId"],
		itemHoldingOffset?: InventoryProducer["itemHoldingOffset"],
	) => {
		state.itemHolding = itemHolding;
		state.itemHoldingId = itemHoldingId;
		state.itemHoldingOffset = itemHoldingOffset || [0, 0];

		const [cellOffsetX, cellOffsetY] = [
			math.floor(-state.itemHoldingOffset[0] / state.cellSize),
			math.floor(-state.itemHoldingOffset[1] / state.cellSize),
		];
		state.itemHoldingCellOffset = [cellOffsetX, cellOffsetY];

		return { ...state };
	},

	moveItem: (state: InventoryProducer, item: Item, targetGridId: string, targetPosition: [number, number]) => {
		const [_, gridId] = findItem(state.grids, item.id) || [];

		if (item && gridId && state.grids[gridId]) {
			state.grids[gridId].items = state.grids[gridId].items.filter((v) => v !== item);
			item.x = targetPosition[0];
			item.y = targetPosition[1];
			state.grids[targetGridId].items.push(item);
		}

		return { ...state };
	},

	lockItem: (state: InventoryProducer, item: Item, locked: boolean) => {
		if (item) {
			item.locked = locked;
		}

		return { ...state, grids: { ...state.grids } };
	},
});

export type Item = {
	id: string;
	quantity: number;
	name: string;
	x: number;
	y: number;
	locked: boolean;
};

export type Grid = {
	id: string;
	width: number;
	height: number;
	items: Item[];
};

export type InventoryMap = { [gridName: string]: string };

export default inventoryProducer;
