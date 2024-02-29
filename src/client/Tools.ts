import Maid, { Destroyable } from "@rbxts/maid";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";
import clientState from "shared/reflex/clientState";
import { Grid, InventoryMap, Tool } from "shared/reflex/inventoryProducer";
import { Object } from "shared/utils/Object";

export default class Tools implements Destroyable {
	public tools: { [gridName: string]: Tool } = {};
	public toolChanged = new Signal<(tool: Tool, grid: Grid) => void>();

	private maid = new Maid();

	constructor() {
		clientState
			.wait((state) => state.inventoryProducer.inventories[tostring(Players.LocalPlayer.UserId)])
			.then((inventoryMap) => {
				this.onInventory(inventoryMap);
			});
	}

	private onInventory(inventoryMap: InventoryMap) {
		const onEquippableGridChange = (grid: Grid) => {
			if (!grid) return;
			if (grid.items[0] && grid.items[0].mockup) return;
			if (this.tools[grid.name] === grid.items[0]) return;

			this.tools[grid.name] = grid.items[0];
			this.toolChanged.Fire(grid.items[0], grid);
			print("toolChanged", grid.items[0], grid);
		};

		this.maid.GiveTask(
			clientState.subscribe(
				(state) => state.inventoryProducer.grids,
				(grids) => {
					for (let grid of Object.values(grids)) {
						if (inventoryMap[grid.name]) {
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
