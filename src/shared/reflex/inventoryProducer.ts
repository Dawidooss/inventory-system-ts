import { Ref } from "@rbxts/react";
import { createProducer } from "@rbxts/reflex";
import { HttpService } from "@rbxts/services";
import { findItem } from "shared/utils/inventory/findItem";

export interface InventoryProducer {
	cellSize: number;
	splitting: boolean;

	inventories: { [id: string]: InventoryMap };
	grids: { [id: string]: Grid };

	itemHolding?: Item;
	itemHoldingId?: string;
	itemHoldingOffset: Vector2;

	hoveringGridId?: string;
	hoveringCell?: [number, number];
	hoveringItemsIds: string[];
}

const initialState: InventoryProducer = {
	splitting: false,
	inventories: {},
	grids: {},
	cellSize: 50,
	itemHoldingOffset: Vector2.zero,
	hoveringItemsIds: [],
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

	setHoveringItem: (state: InventoryProducer, itemId: string, hovering: boolean) => {
		state.hoveringItemsIds = state.hoveringItemsIds.filter((v) => v !== itemId);
		if (hovering === true) {
			state.hoveringItemsIds.push(itemId);
		}
		return { ...state, hoveringItemsIds: [...state.hoveringItemsIds] };
	},

	addItem: (state: InventoryProducer, gridId: string, itemId: string, item: Item) => {
		state.grids[gridId].items[itemId] = item;
		return { ...state };
	},

	removeItem: (state: InventoryProducer, itemId: string) => {
		const [item, gridId] = findItem(state.grids, itemId) || [];

		if (gridId) {
			state.grids[gridId] = { ...state.grids[gridId] };

			delete state.grids[gridId].items[itemId];
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
		state.itemHoldingOffset = itemHoldingOffset || Vector2.zero;

		return { ...state };
	},

	moveItem: (state: InventoryProducer, itemId: string, targetGridId: string, targetPosition: [number, number]) => {
		const [item, gridId] = findItem(state.grids, itemId) || [];

		if (item && gridId && state.grids[gridId]) {
			delete state.grids[gridId].items[itemId];
			item.x = targetPosition[0];
			item.y = targetPosition[1];
			state.grids[targetGridId].items[itemId] = item;
		}

		return { ...state };
	},

	lockItem: (state: InventoryProducer, itemId: string, locked: boolean) => {
		const [item, gridId] = findItem(state.grids, itemId) || [];

		if (item && gridId) {
			// state.grids = { ...state.grids };
			// state.grids[gridId] = { ...state.grids[gridId] };
			// state.grids[gridId].items = { ...state.grids[gridId].items };

			item.locked = locked;
		}

		return { ...state, grids: { ...state.grids } };
	},
});

export type Item = {
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
	items: { [id: string]: Item };
};

export type InventoryMap = { [gridName: string]: string };

export default inventoryProducer;
