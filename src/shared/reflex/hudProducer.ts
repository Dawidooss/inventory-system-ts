import { createProducer } from "@rbxts/reflex";
import { Workspace } from "@rbxts/services";
import { GridTypes } from "shared/data/gridConfigs";
import getItemConfig from "shared/inventory/getItemConfig";
import { findItem } from "shared/utils/inventory/findItem";

const camera = Workspace.CurrentCamera!;

export interface InventoryProducer {
	visible: boolean;
	cellSize: number;
	splittingKeyDown: boolean;
	splittingData?: [number, number, Item, (success: boolean, quantity: number) => void];

	inventories: { [id: string]: InventoryMap };
	grids: { [id: string]: Grid };

	itemHolding?: Item;
	itemHoldingOffset: [number, number];
	itemHoldingCellOffset: [number, number];

	gridHoveringId?: string;
	cellHovering?: [number, number];
	itemsHovering: Item[];

	itemsEquipped: {
		[inventoryId: string]: {
			[gridName: string]: Item;
		};
	};
}

const initialState: InventoryProducer = {
	visible: true,
	splittingKeyDown: false,
	inventories: {},
	grids: {},
	cellSize: math.floor(camera.ViewportSize.Y * (50 / 1080)),
	itemHoldingOffset: [0, 0],
	itemHoldingCellOffset: [0, 0],
	itemsHovering: [],
	itemsEquipped: {},
};

const inventoryProducer = createProducer(initialState, {
	setCellSize: (state: InventoryProducer, cellSize: InventoryProducer["cellSize"]) => ({
		...state,
		cellSize,
	}),

	showInventory: (state: InventoryProducer, visible: InventoryProducer["visible"]) => ({
		...state,
		visible,
	}),

	setSplittingData: (state: InventoryProducer, splittingData?: InventoryProducer["splittingData"]) => ({
		...state,
		splittingData,
	}),

	setSplittingKeyDown: (state: InventoryProducer, splittingKeyDown: InventoryProducer["splittingKeyDown"]) => ({
		...state,
		splittingKeyDown,
	}),

	setCellHovering: (
		state: InventoryProducer,
		gridHoveringId?: InventoryProducer["gridHoveringId"],
		cellHovering?: InventoryProducer["cellHovering"],
	) => ({
		...state,
		gridHoveringId,
		cellHovering,
	}),

	setItemHovering: (state: InventoryProducer, item: Item, hovering: boolean) => {
		state.itemsHovering = state.itemsHovering.filter((v) => v !== item);
		if (hovering === true) {
			state.itemsHovering.push(item);
		}
		return { ...state, hoveringItemsIds: [...state.itemsHovering] };
	},

	addItem: (state: InventoryProducer, gridId: string, item: Item) => {
		state.grids[gridId].items.push(item);
		return { ...state, grids: { ...state.grids } };
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
		return { ...state, grids: { ...state.grids } };
	},

	setInventory: (state: InventoryProducer, inventoryId: string, inventoryMap?: InventoryMap) => {
		if (inventoryMap) {
			state.inventories[inventoryId] = inventoryMap;
			state.itemsEquipped[inventoryId] = {};
		} else {
			delete state.inventories[inventoryId];
			delete state.itemsEquipped[inventoryId];
		}
		return { ...state, inventories: { ...state.inventories }, itemsEquipped: { ...state.itemsEquipped } };
	},

	holdItem: (
		state: InventoryProducer,
		itemHolding?: InventoryProducer["itemHolding"],
		itemHoldingOffset?: InventoryProducer["itemHoldingOffset"],
	) => {
		state.itemHolding = itemHolding;
		state.itemHoldingOffset = itemHoldingOffset || [0, 0];

		const [cellOffsetX, cellOffsetY] = [
			math.floor(-state.itemHoldingOffset[0] / state.cellSize),
			math.floor(-state.itemHoldingOffset[1] / state.cellSize),
		];
		state.itemHoldingCellOffset = [cellOffsetX, cellOffsetY];

		return { ...state, grids: { ...state.grids } };
	},

	moveItem: (
		state: InventoryProducer,
		item: Item,
		targetGridId: string,
		targetPosition: [number, number],
		quantity?: number,
		newItemId?: string,
	) => {
		const [_, gridId] = findItem(state.grids, item.id) as [Item, string];

		const grid = state.grids[gridId];
		const targetGrid = state.grids[targetGridId];

		if (quantity && newItemId && quantity > 0 && quantity < item.quantity) {
			item.quantity -= quantity;
			targetGrid.items.push({
				...item,
				x: targetPosition[0],
				y: targetPosition[1],
				id: newItemId,
				quantity: quantity,
			});
		} else {
			grid.items = grid.items.filter((v) => v !== item);
			item.x = targetPosition[0];
			item.y = targetPosition[1];
			targetGrid.items.push(item);
		}

		return { ...state, grids: { ...state.grids } };
	},

	mergeItems: (state: InventoryProducer, item: Item, targetItem: Item, quantityToMerge: number) => {
		const config = getItemConfig(item);

		item.quantity -= quantityToMerge;
		targetItem.quantity += quantityToMerge;

		// moved whole item, remove him
		if (item.quantity <= 0) {
			const [_, gridId] = findItem(state.grids, item.id);
			state.grids[gridId!].items = state.grids[gridId!].items.filter((v) => v !== item);
		}

		return { ...state, grids: { ...state.grids } };
	},

	lockItem: (state: InventoryProducer, item: Item, locked: boolean) => {
		item.locked = locked;

		return { ...state, grids: { ...state.grids } };
	},

	setItemQuantity: (state: InventoryProducer, item: Item, quantity: number) => {
		item.quantity = quantity;
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
	mockup?: boolean;
};

export type Tool = Item & {};

export type Grid = {
	id: string;
	name: string;
	type: GridTypes;
	items: Item[];
};

export type InventoryMap = { [gridName: string]: string };

export default inventoryProducer;
