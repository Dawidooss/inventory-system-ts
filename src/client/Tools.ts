import Maid, { Destroyable } from "@rbxts/maid";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";
import clientState from "shared/reflex/clientState";
import { Grid, InventoryMap, Tool } from "shared/reflex/inventoryProducer";
import { Object } from "shared/utils/Object";
import getGridConfig from "shared/utils/inventory/getGridConfig";

const player = Players.LocalPlayer;
const userId = tostring(player.UserId);

export default class Tools implements Destroyable {
	private maid = new Maid();

	constructor() {
		clientState
			.wait((state) => state.inventoryProducer.inventories[userId])
			.then((inventoryMap) => {
				this.onInventory(inventoryMap);
			});
	}

	private onInventory(inventoryMap: InventoryMap) {
		const onEquippableGridChange = (grid: Grid) => {
			if (!grid) return;
			if (grid.items[0] && grid.items[0].mockup) return;
			if (clientState.getState().inventoryProducer.itemsEquipped[userId][grid.name] === grid.items[0]) return;

			clientState.setItemEquipped(userId, grid.name, grid.items[0]);
		};

		this.maid.GiveTask(
			clientState.subscribe(
				(state) => state.inventoryProducer.grids,
				(grids) => {
					for (let grid of Object.values(grids)) {
						const gridConfig = getGridConfig(grid);
						if (gridConfig.equippable && inventoryMap[grid.name]) {
							onEquippableGridChange(grid);
						}
					}
				},
			),
		);
	}

	public Destroy(): void {
		this.maid.DoCleaning();
	}
}
