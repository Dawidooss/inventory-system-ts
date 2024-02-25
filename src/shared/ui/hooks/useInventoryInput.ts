import { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HttpService, UserInputService } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import getItemConfig from "shared/inventory/getItemConfig";
import clientState, { RootState } from "shared/reflex/clientState";
import { Item } from "shared/reflex/inventoryProducer";
import canMerge from "shared/utils/inventory/canMerge";
import { findItem } from "shared/utils/inventory/findItem";
import itemFits from "shared/utils/inventory/itemFits";

export default function useInventoryInput() {
	const grids = useSelector((state: RootState) => state.inventoryProducer.grids);
	const gridHoveringId = useSelector((state: RootState) => state.inventoryProducer.gridHoveringId);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);
	const cellHovering = useSelector((state: RootState) => state.inventoryProducer.cellHovering);
	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemsHovering = useSelector((state: RootState) => state.inventoryProducer.itemsHovering);

	useEffect(() => {
		const conn = UserInputService.InputEnded.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				if (cellHovering && gridHoveringId && itemHolding) {
					const targetCell: [number, number] = [
						cellHovering[0] - itemHoldingCellOffset[0],
						cellHovering[1] - itemHoldingCellOffset[1],
					];
					const itemConfig = getItemConfig(itemHolding);
					const [_, itemHoldingGridId] = findItem(grids, itemHolding.id);

					const targetItem: Item | undefined = itemsHovering.filter((v) => v !== itemHolding)[0];
					const [__, targetItemGridId] = targetItem ? findItem(grids, targetItem.id) : [];

					if (targetItem && targetItemGridId) {
						// merge
						if (canMerge(itemHolding, targetItem)) {
							const oldItemHoldingQuantity = itemHolding.quantity;
							const oldTargetItemQuantity = targetItem.quantity;

							clientState.mergeItems(itemHolding, targetItem);
							clientState.lockItem(itemHolding, true);
							clientState.lockItem(targetItem, true);

							InventoryEvents.functions.mergeItems
								.Call({
									itemId: itemHolding.id,
									gridId: itemHoldingGridId!,
									targetItemId: targetItem.id,
									targetGridId: targetItemGridId,
								})
								.After((succ) => {
									clientState.lockItem(itemHolding, false);
									clientState.lockItem(targetItem, false);
									if (!succ) {
										clientState.setItemQuantity(itemHolding, oldItemHoldingQuantity);
										clientState.setItemQuantity(targetItem, oldTargetItemQuantity);
									}
								});
						}
					} else if (itemFits(grids[gridHoveringId], itemHolding, targetCell)) {
						// move
						const [lastX, lastY] = [itemHolding.x, itemHolding.y];
						clientState.moveItem(itemHolding, gridHoveringId, targetCell);
						clientState.lockItem(itemHolding, true);

						const mockup = { ...itemHolding, x: lastX, y: lastY };
						mockup.id = HttpService.GenerateGUID(false);

						clientState.addItem(gridHoveringId, mockup);
						clientState.lockItem(mockup, true);

						InventoryEvents.functions.moveItem
							.Call({
								itemId: itemHolding.id,
								gridId: itemHoldingGridId!,
								targetGridId: gridHoveringId,
								x: targetCell[0],
								y: targetCell[1],
							})
							.After((succ, res) => {
								clientState.removeItem(mockup);
								clientState.lockItem(itemHolding, false);
								if (!succ) {
									clientState.moveItem(itemHolding, itemHoldingGridId!, [lastX, lastY]);
								}
							});
					}
				}

				clientState.holdItem();
			}
		});

		return () => {
			conn.Disconnect();
		};
	}, [cellHovering, gridHoveringId, grids, itemsHovering]);
}
