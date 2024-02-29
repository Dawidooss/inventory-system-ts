import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import clientState from "shared/reflex/clientState";
import { InventoryMap } from "shared/reflex/inventoryProducer";
import Router from "shared/ui/components/complex/Router";
import { Object } from "shared/utils/Object";
import Tools from "./Tools";

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

new Tools();
