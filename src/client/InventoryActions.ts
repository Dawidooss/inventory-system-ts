import { ContextMenuOptions, Item } from "shared/types/inventory";
import clientState from "./reflex/clientState";
import { GuiService, HttpService, Players, RunService, UserInputService } from "@rbxts/services";
import { findItem } from "shared/utils/inventory/findItem";
import { InventoryEvents } from "shared/events/inventory";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import findSpace from "shared/utils/inventory/findSpace";
import getCompatibleUnifiedGrids from "shared/utils/inventory/getCompatibleUnifiedGrids";
import getItemConfig from "shared/utils/inventory/getItemConfig";

const guiInset = GuiService.GetGuiInset()[0];

export namespace InventoryActions {
	export const getQuantityToWorkWith = (item: Item): [boolean, number] => {
		const state = clientState.getState().inventoryProducer;
		if (!state.splitKeyDown || item.quantity <= 1) return [true, item.quantity];
		if (!state.splitKeyDown || item.quantity === 2) return [true, 1];

		let success, quantity;
		const mouseLocation = UserInputService.GetMouseLocation();
		clientState.setSplitData([
			mouseLocation.X - guiInset.X,
			mouseLocation.Y - guiInset.Y,
			item,
			(_success, _quantity) => {
				success = _success;
				quantity = _quantity;
			},
		]);
		while (success === undefined) wait();

		return [success!, quantity!];
	};

	export const drop = async (item: Item) => {
		const grids = clientState.getState().inventoryProducer.grids;
		const [, itemGridId] = findItem(grids, item.id);

		clientState.lockItem(item, true);

		if (RunService.IsRunning()) {
			InventoryEvents.functions.dropItem
				.Call({
					itemId: item.id,
					gridId: itemGridId!,
				})
				.After((succ) => {
					if (succ) {
						clientState.removeItem(item);
					} else {
						clientState.lockItem(item, false);
					}
				});
		} else {
			// for hoarcekat purpose
			clientState.removeItem(item);
		}
	};

	export const merge = async (item: Item, targetItem: Item) => {
		const grids = clientState.getState().inventoryProducer.grids;
		const [, itemGridId] = findItem(grids, item.id);
		const [, targetGridId] = findItem(grids, targetItem.id);

		const config = getItemConfig(item);

		clientState.lockItem(item, true);
		clientState.lockItem(targetItem, true);

		const unlock = () => {
			clientState.lockItem(item, false);
			clientState.lockItem(targetItem, false);
		};

		let [succ, quantity] = getQuantityToWorkWith(item);
		if (!succ) {
			unlock();
			return;
		}

		print(quantity);
		quantity = math.clamp(config.max - targetItem.quantity, 0, quantity);
		print(quantity);

		const success = () => {
			clientState.mergeItems(item, targetItem, quantity);
		};

		if (RunService.IsRunning()) {
			InventoryEvents.functions.mergeItems
				.Call({
					itemId: item.id,
					gridId: itemGridId!,
					targetItemId: targetItem.id,
					targetGridId: targetGridId!,
					quantity: quantity,
				})
				.After((succ) => {
					unlock();
					if (!succ) return;
					success();
				});
		} else {
			// for hoarcekat purpose
			unlock();
			success();
		}
	};

	export const move = async (item: Item, targetGridId: string, targetCell: [number, number]) => {
		const [_, itemGridId] = findItem(clientState.getState().inventoryProducer.grids, item.id);

		if (itemGridId === targetGridId && item.x === targetCell[0] && item.y === targetCell[1]) return;

		const mockup = { ...item, x: targetCell[0], y: targetCell[1] };
		mockup.id = HttpService.GenerateGUID(false);
		mockup.mockup = true;
		clientState.addItem(targetGridId, mockup);

		clientState.lockItem(item, true);
		clientState.lockItem(mockup, true);

		const unlock = () => {
			clientState.removeItem(mockup);
			clientState.lockItem(item, false);
		};

		let [succ, quantity] = getQuantityToWorkWith(item);
		if (!succ) {
			unlock();
			return;
		}

		const success = (newItemId: string) => {
			clientState.moveItem(item, targetGridId, targetCell, quantity, newItemId);
		};

		if (RunService.IsRunning()) {
			InventoryEvents.functions.moveItem
				.Call({
					itemId: item.id,
					gridId: itemGridId!,
					targetGridId: targetGridId,
					x: targetCell[0],
					y: targetCell[1],
					quantity: quantity,
				})
				.After((succ, res) => {
					clientState.removeItem(mockup);
					clientState.lockItem(item, false);
					if (!succ) return;

					success(res.newItemId);
				});
		} else {
			// for hoarcekat purpose
			unlock();
			success(HttpService.GenerateGUID(false));
		}
	};

	export const getContextMenuOptionsForItem = (item: Item): ContextMenuOptions => {
		const state = clientState.getState().inventoryProducer;

		const [_, gridId] = findItem(state.grids, item.id);
		const grid = state.grids[gridId!];
		const gridConfig = getGridConfig(grid);

		const options: ContextMenuOptions = {
			Wyrzuć: {
				order: 10,
				color: Color3.fromRGB(145, 10, 10),
				callback: (item) => {
					drop(item);
				},
			},
		};

		if (gridConfig.unified && gridConfig.equippable) {
			const backpackGridId = state.inventories[tostring(Players.LocalPlayer.UserId)].backpack;
			const backpack = state.grids[backpackGridId];
			const [hasSpace, position] = findSpace(backpack, item);
			if (hasSpace) {
				options.Zdejmij = {
					order: -10,
					callback: (item) => {
						move(item, backpack.id, position);
					},
				};
			}
		} else {
			const compatibleUnifiedGrids = getCompatibleUnifiedGrids(state.grids, item);
			if (compatibleUnifiedGrids[0]) {
				options.Załóż = {
					order: -10,
					callback: (item) => {
						move(item, compatibleUnifiedGrids[0].id, [0, 0]);
					},
				};
			}
		}

		return options;
	};
}
