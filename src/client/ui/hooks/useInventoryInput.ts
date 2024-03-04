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

					if (state.cellHovering && state.gridHoveringId && state.itemHolding) {
						const targetItem: Item | undefined = state.itemsHovering.filter(
							(v) => v !== state.itemHolding,
						)[0];
						const [, targetItemGridId] = targetItem ? findItem(state.grids, targetItem.id) : [];
						const gridHoveringConfig =
							state.gridHoveringId && getGridConfig(state.grids[state.gridHoveringId]);

						let targetCell = state.cellHovering;
						if (gridHoveringConfig && !gridHoveringConfig.unified) {
							targetCell = [
								targetCell[0] - state.itemHoldingCellOffset[0],
								targetCell[1] - state.itemHoldingCellOffset[1],
							];
						}

						if (targetItem && targetItemGridId && canMerge(state.itemHolding, targetItem)) {
							InventoryActions.merge(state.itemHolding, targetItem);
						} else if (
							itemFits(
								state.grids[state.gridHoveringId],
								state.itemHolding,
								targetCell,
								!state.splitKeyDown,
							)
						) {
							InventoryActions.move(state.itemHolding, state.gridHoveringId, targetCell);
						}
					}

					clientState.holdItem();
				} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
					const targetItem: Item | undefined = state.itemsHovering.filter((v) => v !== state.itemHolding)[0];
					if (state.cellHovering && targetItem && !state.itemHolding && !state.splitData) {
						clientState.setContextData([
							input.Position.X,
							input.Position.Y,
							targetItem,
							InventoryActions.getContextMenuOptionsForItem(targetItem),
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
