import { HttpService, Players } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import getItemConfig from "shared/inventory/getItemConfig";
import { Grid } from "shared/reflex/inventoryProducer";
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
	assert(inventories[req.inventoryId], `inventoryId ${req.inventoryId} doesn't exist`);
	return {
		grids: inventories[req.inventoryId],
	};
});

InventoryEvents.functions.moveItem.SetCallback((player, req) => {
	const grid = grids[req.gridId];
	const targetGrid = grids[req.targetGridId];

	assert(grid, `gridId ${req.gridId} doesn't exist`);
	assert(targetGrid, `targetGridId ${req.gridId} doesn't exist`);

	const item = grid.items.find((v) => v.id === req.itemId);
	assert(item, `item ${req.targetGridId} in grid doesn't exist`);
	assert(item.locked === false, `item ${req.itemId} is locked`);

	const fits = itemFits(targetGrid, item, [req.x, req.y]);
	assert(fits, `item doesn't fit in desired position`);

	grid.items = grid.items.filter((v) => v.id !== req.itemId);
	item.x = req.x;
	item.y = req.y;
	targetGrid.items.push(item);

	return {};
});

InventoryEvents.functions.mergeItems.SetCallback((player, req) => {
	const grid = grids[req.gridId];
	const targetGrid = grids[req.targetGridId];

	const start = tick();
	assert(grid, `gridId ${req.gridId} doesn't exist`);
	assert(targetGrid, `targetGridId ${req.gridId} doesn't exist`);

	const item = grid.items.find((v) => v.id === req.itemId);
	assert(item, `item ${req.itemId} in grid doesn't exist`);
	assert(item.locked === false, `item ${req.itemId} is locked`);

	const targetItem = targetGrid.items.find((v) => v.id === req.targetItemId);
	assert(targetItem, `item ${req.targetGridId} in grid doesn't exist`);
	assert(targetItem.locked === false, `item ${req.targetGridId} is locked`);

	assert(canMerge(item, targetItem), `cannot merge`);

	const config = getItemConfig(item);
	const toMove = math.clamp(config.max - targetItem.quantity, 0, item.quantity);

	item.quantity -= toMove;
	targetItem.quantity += toMove;

	// moved whole item, remove him
	if (item.quantity <= 0) {
		grid.items = grid.items.filter((v) => v !== item);
	}

	return {};
});
