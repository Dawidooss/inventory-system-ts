import { HttpService, Players } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import getItemConfig from "shared/inventory/getItemConfig";
import { Grid } from "shared/reflex/inventoryProducer";
import check from "shared/utils/check";
import canMerge from "shared/utils/inventory/canMerge";
import itemFits from "shared/utils/inventory/itemFits";

const grids: { [gridId: string]: Grid } = {};
const inventories: {
	[userId: string]: { [gridId: string]: Grid };
} = {};

Players.PlayerAdded.Connect((player) => {
	const backpackId = HttpService.GenerateGUID(false);
	const testId = HttpService.GenerateGUID(false);

	grids[backpackId] = {
		id: backpackId,
		width: 15,
		height: 6,
		items: [
			{
				id: HttpService.GenerateGUID(false),
				name: "Patyk",
				quantity: 2,
				x: 0,
				y: 0,
				locked: false,
			},
			{
				id: HttpService.GenerateGUID(false),
				name: "Patyk",
				quantity: 4,
				x: 5,
				y: 2,
				locked: false,
			},
		],
	};

	grids[testId] = {
		id: testId,
		width: 6,
		height: 6,
		items: [],
	};

	inventories[tostring(player.UserId)] = {
		backpack: grids[backpackId],
		test: grids[testId],
	};
});

InventoryEvents.functions.fetchInventory.SetCallback((player, req) => {
	check(inventories[req.inventoryId], `inventoryId ${req.inventoryId} doesn't exist`);
	return {
		grids: inventories[req.inventoryId],
	};
});

InventoryEvents.functions.moveItem.SetCallback((player, req) => {
	const grid = grids[req.gridId];
	const targetGrid = grids[req.targetGridId];

	check(grid, `gridId ${req.gridId} doesn't exist`);
	check(targetGrid, `targetGridId ${req.gridId} doesn't exist`);

	const item = grid.items.find((v) => v.id === req.itemId);
	check(item, `item ${req.targetGridId} in grid doesn't exist`);
	check(item.locked === false, `item ${req.itemId} is locked`);
	check(req.quantity > 0, `cannot move less than 1 quantity ${req.quantity}`);
	check(
		req.quantity <= item.quantity,
		`quantity to move is bigger than item quantity ${req.quantity} > ${item.quantity}`,
	);

	const fits = itemFits(targetGrid, item, [req.x, req.y]);
	check(fits, `item doesn't fit in desired position`);

	let newItemId = "";
	if (req.quantity === item.quantity) {
		// move whole item
		grid.items = grid.items.filter((v) => v.id !== req.itemId);
		item.x = req.x;
		item.y = req.y;
		targetGrid.items.push(item);
	} else {
		// split
		item.quantity -= req.quantity;
		newItemId = HttpService.GenerateGUID(false);
		targetGrid.items.push({
			...item,
			x: req.x,
			y: req.y,
			quantity: req.quantity,
			id: newItemId,
		});
	}

	return {
		newItemId: newItemId,
	};
});

InventoryEvents.functions.mergeItems.SetCallback((player, req) => {
	const grid = grids[req.gridId];
	const targetGrid = grids[req.targetGridId];

	check(grid, `gridId ${req.gridId} doesn't exist`);
	check(targetGrid, `targetGridId ${req.gridId} doesn't exist`);

	const item = grid.items.find((v) => v.id === req.itemId);
	check(item, `item ${req.itemId} in grid doesn't exist`);
	check(item.locked === false, `item ${req.itemId} is locked`);

	const targetItem = targetGrid.items.find((v) => v.id === req.targetItemId);
	check(targetItem, `item ${req.targetGridId} in grid doesn't exist`);
	check(targetItem.locked === false, `item ${req.targetGridId} is locked`);
	check(canMerge(item, targetItem), `cannot merge`);

	check(req.quantity >= 1, "cannot merge less than 1");
	check(req.quantity <= item.quantity, "tried to merge more than item has quantity");

	item.quantity -= req.quantity;
	targetItem.quantity += req.quantity;

	// moved whole item, remove him
	if (item.quantity <= 0) {
		grid.items = grid.items.filter((v) => v !== item);
	}

	return {};
});
