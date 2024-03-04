import promiseR15 from "@rbxts/promise-character";
import { Debris, HttpService, Players, ReplicatedFirst, Workspace } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import { Grid } from "shared/types/inventory";
import check from "shared/utils/check";
import canMerge from "shared/utils/inventory/canMerge";
import findSpace from "shared/utils/inventory/findSpace";
import getItemConfig from "shared/utils/inventory/getItemConfig";
import getItemModel from "shared/utils/inventory/getItemModel";
import itemFits from "shared/utils/inventory/itemFits";
import spreadBetweenItemsInGrid from "shared/utils/inventory/spreadBetweenItemsInGrid";
import removeCollisionBetweenModels from "shared/utils/removeCollisionBetweenModels";

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
		name: "backpack",
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
				name: "Szabla",
				quantity: 1,
				x: 5,
				y: 3,
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
		name: "primary",
		type: "primary",
		items: [],
	};
	grids[secondaryId] = {
		id: secondaryId,
		name: "secondary",
		type: "secondary",
		items: [],
	};
	grids[meleeId] = {
		id: meleeId,
		name: "melee",
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

	const split = req.quantity !== item.quantity;
	const fits = itemFits(targetGrid, item, [req.x, req.y], !split);
	check(fits, `item doesn't fit in desired position`);

	let newItemId = "";
	if (split) {
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

InventoryEvents.functions.dropItem.SetCallback(async (player, req) => {
	check(player.Character, `player's ${player.UserId} character doesn't exist`);

	const grid = grids[req.gridId];
	check(grid, `gridId ${req.gridId} doesn't exist`);

	const item = grid.items.find((v) => v.id === req.itemId);
	check(item, `item ${req.itemId} in grid doesn't exist`);
	check(item.locked === false, `item ${req.itemId} is locked`);

	const itemConfig = getItemConfig(item);

	const character = await promiseR15(player.Character);
	const cframe = character.HumanoidRootPart.CFrame;

	const drop = getItemModel(item)?.Clone() || ReplicatedFirst.pouch.Clone();
	drop.PivotTo(cframe);
	removeCollisionBetweenModels(drop, character, 2);
	drop.Parent = Workspace;

	const proximityPrompt = new Instance("ProximityPrompt");
	proximityPrompt.Parent = drop.PrimaryPart;
	proximityPrompt.HoldDuration = 0.7;
	proximityPrompt.ActionText = `${itemConfig.name}` + (item.quantity > 1 ? ` ${item.quantity}x` : "");

	proximityPrompt.Triggered.Connect((pickuper) => {
		const pickuperInventory = inventories[tostring(pickuper.UserId)];
		const pickuperBackpack = pickuperInventory.backpack;

		const [hasSpace, pos] = findSpace(pickuperBackpack, item);
		if (!hasSpace) return;

		const [spreadAffectedItems, remainder] = spreadBetweenItemsInGrid(pickuperBackpack, item);

		for (let [affectedItem, quantity] of spreadAffectedItems) {
			affectedItem.quantity = quantity;
			InventoryEvents.events.setItemQuantity.Server().Fire(pickuper, {
				itemId: affectedItem.id,
				quantity,
			});
		}

		if (remainder > 0) {
			item.x = pos[0];
			item.y = pos[1];
			item.quantity = remainder;
			pickuperBackpack.items.push(item);
			InventoryEvents.events.addItem.Server().Fire(pickuper, {
				item,
				gridId: pickuperBackpack.id,
			});
		}
		drop.Destroy();
	});

	// remove item from grid
	grid.items = grid.items.filter((v) => v !== item);

	return {};
});
