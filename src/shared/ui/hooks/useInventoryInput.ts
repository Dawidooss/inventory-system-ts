import { useKeyPress } from "@rbxts/pretty-react-hooks";
import { useCallback, useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, HttpService, RunService, UserInputService } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import getItemConfig from "shared/inventory/getItemConfig";
import clientState, { RootState } from "shared/reflex/clientState";
import { Item } from "shared/reflex/inventoryProducer";
import canMerge from "shared/utils/inventory/canMerge";
import { findItem } from "shared/utils/inventory/findItem";
import itemFits from "shared/utils/inventory/itemFits";
import useKeyOncePressed from "./useKeyOncePressed";
import getGridConfig from "shared/utils/inventory/getGridConfig";

export default function useInventoryInput() {
	const splitKeyDown = useSelector((state: RootState) => state.inventoryProducer.splitKeyDown);
	if (useKeyPress(["LeftControl"]) !== splitKeyDown) {
		clientState.setSplitKeyDown(!splitKeyDown);
	}

	const guiInset = GuiService.GetGuiInset()[0];

	useKeyOncePressed(["E"], () => {
		clientState.showInventory(!clientState.getState().inventoryProducer.visible);
	});

	const getQuantityToWorkWith = useCallback((item: Item): [boolean, number] => {
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
	}, []);

	const merge = useCallback(async (item: Item, targetItem: Item) => {
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

		quantity = math.clamp(config.max - targetItem.quantity, 0, item.quantity);

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
			unlock();
			success();
		}
	}, []);

	const move = useCallback(async (item: Item, targetGridId: string, targetCell: [number, number]) => {
		const [_, itemGridId] = findItem(clientState.getState().inventoryProducer.grids, item.id);
		clientState.lockItem(item, true);

		const mockup = { ...item, x: targetCell[0], y: targetCell[1] };
		mockup.id = HttpService.GenerateGUID(false);
		mockup.mockup = true;

		clientState.addItem(targetGridId, mockup);
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
			unlock();
			success(HttpService.GenerateGUID(false));
		}
	}, []);

	useEffect(() => {
		const conn = UserInputService.InputEnded.Connect((input) => {
			const state = clientState.getState().inventoryProducer;
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;

			if (state.cellHovering && state.gridHoveringId && state.itemHolding) {
				const targetItem: Item | undefined = state.itemsHovering.filter((v) => v !== state.itemHolding)[0];
				const [, targetItemGridId] = targetItem ? findItem(state.grids, targetItem.id) : [];
				const gridHoveringConfig = state.gridHoveringId && getGridConfig(state.grids[state.gridHoveringId]);

				let targetCell = state.cellHovering;
				if (gridHoveringConfig && !gridHoveringConfig.unified) {
					targetCell = [
						targetCell[0] - state.itemHoldingCellOffset[0],
						targetCell[1] - state.itemHoldingCellOffset[1],
					];
				}

				if (targetItem && targetItemGridId && canMerge(state.itemHolding, targetItem)) {
					merge(state.itemHolding, targetItem);
				} else if (
					itemFits(state.grids[state.gridHoveringId], state.itemHolding, targetCell, !state.splitKeyDown)
				) {
					move(state.itemHolding, state.gridHoveringId, targetCell);
				}
			}

			clientState.holdItem();
		});

		return () => {
			conn.Disconnect();
		};
	}, []);
}
