import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import clientState from "client/reflex/clientState";
import { Object } from "shared/utils/Object";
import Tools from "./Tools";
import { InventoryMap } from "shared/types/inventory";
import Router from "./ui/components/complex/Router";
import { findItem } from "shared/utils/inventory/findItem";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

const screenGui = new Instance("ScreenGui");
screenGui.Parent = playerGui;

const root = createRoot(screenGui);
root.render(Router());

const player = Players.LocalPlayer;

InventoryEvents.functions.fetchInventory
	.Call({
		inventoryId: tostring(player.UserId),
	})
	.After((success, res) => {
		if (success) {
			const inventoryMap: InventoryMap = {};
			for (let [gridName, grid] of Object.entries(res.grids)) {
				clientState.setGrid(grid.id, grid);
				inventoryMap[gridName] = grid.id;
			}

			clientState.setInventory(tostring(player.UserId), inventoryMap);
		}
	});

InventoryEvents.events.addItem.Client().On((data) => {
	clientState.addItem(data.gridId, data.item);
});

InventoryEvents.events.setItemQuantity.Client().On((data) => {
	const [item] = findItem(clientState.getState().inventoryProducer.grids, data.itemId);
	if (!item) {
		// TODO: refresh adata
		return;
	}
	clientState.setItemQuantity(item, data.quantity);
});

new Tools();
