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
	const primaryId = HttpService.GenerateGUID(false);
	const secondaryId = HttpService.GenerateGUID(false);
	const meleeId = HttpService.GenerateGUID(false);

	grids[backpackId] = {
		id: backpackId,
		type: "backpack",
		items: [
			{
				id: HttpService.GenerateGUID(false),
				name: "Patyk",
				quantity: 3,
				x: 1,
				y: 1,
				locked: false,
			},
			{
				id: HttpService.GenerateGUID(false),
				name: "Patyk",
				quantity: 4,
				x: 3,
				y: 1,
				locked: false,
			},
		],
	};

	grids[primaryId] = {
		id: primaryId,
		type: "primary",
		items: [],
	};
	grids[secondaryId] = {
		id: secondaryId,
		type: "secondary",
		items: [],
	};
	grids[meleeId] = {
		id: meleeId,
		type: "melee",
		items: [],
	};

	inventories[tostring(player.UserId)] = {
		backpack: grids[backpackId],
		primary: grids[primaryId],
		secondary: grids[secondaryId],
		melee: grids[meleeId],
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

	const splitting = req.quantity !== item.quantity;
	const fits = itemFits(targetGrid, item, [req.x, req.y], !splitting);
	check(fits, `item doesn't fit in desired position`);

	let newItemId = "";
	if (splitting) {
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
	} else {
		// move whole item
		grid.items = grid.items.filter((v) => v.id !== req.itemId);
		item.x = req.x;
		item.y = req.y;
		targetGrid.items.push(item);
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
