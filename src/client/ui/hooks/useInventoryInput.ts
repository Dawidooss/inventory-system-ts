import Maid from "@rbxts/maid";
import { useKeyPress } from "@rbxts/pretty-react-hooks";
import { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { UserInputService } from "@rbxts/services";
import clientState, { RootState } from "client/reflex/clientState";
import { Item } from "shared/types/inventory";
import canMerge from "shared/utils/inventory/canMerge";
import { findItem } from "shared/utils/inventory/findItem";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import itemFits from "shared/utils/inventory/itemFits";
import useKeyOncePressed from "./useKeyOncePressed";
import { InventoryActions } from "client/InventoryActions";

export default function useInventoryInput() {
	const splitKeyDown = useSelector((state: RootState) => state.inventoryProducer.splitKeyDown);
	if (useKeyPress(["LeftControl"]) !== splitKeyDown) {
		clientState.setSplitKeyDown(!splitKeyDown);
	}

	useKeyOncePressed(["E"], () => {
		clientState.showInventory(!clientState.getState().inventoryProducer.visible);
	});

	useEffect(() => {
		const maid = new Maid();
		maid.GiveTask(
			UserInputService.InputEnded.Connect((input) => {
				const state = clientState.getState().inventoryProducer;

				if (input.UserInputType === Enum.UserInputType.MouseButton1) {
					clientState.setContextData();

					if (state.cellHovering && state.targetGrid && state.itemHolding) {
						const [, targetItemGridId] = state.targetItem
							? findItem(state.grids, state.itemHolding.id)
							: [];
						const targetGridConfig = state.targetGrid && getGridConfig(state.targetGrid);

						let cellHovering = state.cellHovering;
						if (targetGridConfig && !targetGridConfig.unified) {
							print("hi");
							cellHovering = [
								cellHovering[0] - state.itemHoldingCellOffset[0],
								cellHovering[1] - state.itemHoldingCellOffset[1],
							];
						}

						print(state.targetGrid, state.itemHolding, cellHovering, state.itemHoldingCellOffset);

						if (state.targetItem && targetItemGridId && canMerge(state.itemHolding, state.targetItem)) {
							InventoryActions.merge(state.itemHolding, state.targetItem);
						} else if (itemFits(state.targetGrid, state.itemHolding, cellHovering, !state.splitKeyDown)) {
							InventoryActions.move(state.itemHolding, state.targetGrid.id, cellHovering);
						}
					}

					clientState.holdItem();
				} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
					if (state.cellHovering && state.targetItem && !state.itemHolding && !state.splitData) {
						clientState.setContextData([
							input.Position.X,
							input.Position.Y,
							state.targetItem,
							InventoryActions.getContextMenuOptionsForItem(state.targetItem),
						]);
					}
				}
			}),
		);

		return () => {
			maid.DoCleaning();
		};
	}, []);
}
