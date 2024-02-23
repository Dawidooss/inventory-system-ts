import { Ref } from "@rbxts/react";
import { createProducer } from "@rbxts/reflex";
import { HttpService } from "@rbxts/services";

export interface InventoryProducer {
	cellSize: number;
	backpack: Grid;

	itemHoldingId?: string;
	itemHoldingOffset: Vector2;
}

const initialState: InventoryProducer = {
	cellSize: 50,
	backpack: {
		width: 15,
		height: 6,
		items: {
			[HttpService.GenerateGUID(false)]: {
				name: "Szabla",
				quantity: 1,
				x: 0,
				y: 0,
			},
			[HttpService.GenerateGUID(false)]: {
				name: "Szabla",
				quantity: 1,
				x: 5,
				y: 2,
			},
		},
	},
	itemHoldingOffset: Vector2.zero,
};

const inventoryProducer = createProducer(initialState, {
	setCellSize: (state: InventoryProducer, cellSize: InventoryProducer["cellSize"]) => ({
		...state,
		cellSize,
	}),

	holdItem: (
		state: InventoryProducer,
		itemHoldingId?: InventoryProducer["itemHoldingId"],
		itemHoldingOffset?: InventoryProducer["itemHoldingOffset"],
	) => {
		state = { ...state };
		state.itemHoldingId = itemHoldingId;
		state.itemHoldingOffset = itemHoldingOffset || Vector2.zero;

		return state;
	},
});

export type Item = {
	quantity: number;
	name: string;
	x: number;
	y: number;
};

export type Grid = {
	width: number;
	height: number;
	items: { [id: string]: Item };
};

export default inventoryProducer;
