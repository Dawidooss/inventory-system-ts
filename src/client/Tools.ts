import Maid, { Destroyable } from "@rbxts/maid";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";
import clientState, { RootState } from "shared/reflex/clientState";
import { InventoryMap, Tool } from "shared/reflex/inventoryProducer";

export default class Tools implements Destroyable {
	public tools: { [gridName: string]: Tool } = {};
	public toolChanged = new Signal<(tool: Tool, gridName: string, gridId: string) => void>();

	private maid = new Maid();

	constructor() {
		clientState
			.wait((state: RootState) => state.inventoryProducer.inventories[tostring(Players.LocalPlayer.UserId)])
			.then((inventoryMap) => {
				this.onInventory(inventoryMap);
			});
	}

	private onInventory(inventoryMap: InventoryMap) {
		const onEquippableGrid = (gridName: string, gridId: string) => {
			this.maid.GiveTask(
				clientState.subscribe(
					(state: RootState) => state.inventoryProducer.grids[gridId],
					(grid) => {
						if (!grid) return;
						print(grid.items[0]);
						if (this.tools[gridId] === grid.items[0]) return;

						this.tools[gridId] = grid.items[0];
						this.toolChanged.Fire(grid.items[0], gridName, gridId);
						print("toolChanged", grid.items[0], gridName, gridId);
					},
				),
			);
		};

		onEquippableGrid("primary", inventoryMap.primary);
		onEquippableGrid("secondary", inventoryMap.secondary);
		onEquippableGrid("melee", inventoryMap.melee);
	}

	public Destroy(): void {
		this.maid.DoCleaning();
	}
}
