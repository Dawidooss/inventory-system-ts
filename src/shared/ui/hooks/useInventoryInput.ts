import { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HttpService, UserInputService } from "@rbxts/services";
import { InventoryEvents } from "shared/events/inventory";
import clientState, { RootState } from "shared/reflex/clientState";
import { findItem } from "shared/utils/inventory/findItem";
import itemFits from "shared/utils/inventory/itemFits";

export default function useInventoryInput() {
	const grids = useSelector((state: RootState) => state.inventoryProducer.grids);
	const hoveringGridId = useSelector((state: RootState) => state.inventoryProducer.hoveringGridId);
	const hoveringCell = useSelector((state: RootState) => state.inventoryProducer.hoveringCell);

	const itemHoldingId = useSelector((state: RootState) => state.inventoryProducer.itemHoldingId);
	const [itemHolding, itemHoldingGridId] = findItem(grids, itemHoldingId || "") || [];

	useEffect(() => {
		const conn = UserInputService.InputEnded.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				if (itemHoldingId && hoveringCell && hoveringGridId && itemHolding && itemHoldingGridId) {
					if (itemFits(grids[hoveringGridId], itemHolding, hoveringCell)) {
						const [lastX, lastY] = [itemHolding.x, itemHolding.y];
						clientState.moveItem(itemHoldingId, hoveringGridId, hoveringCell);
						clientState.lockItem(itemHoldingId, true);

						const mockupId = HttpService.GenerateGUID(false);
						const mockup = { ...itemHolding, x: lastX, y: lastY };

						clientState.addItem(itemHoldingGridId, mockupId, mockup);
						clientState.lockItem(mockupId, true);

						InventoryEvents.functions.moveItem
							.Call({
								itemId: itemHoldingId,
								gridId: itemHoldingGridId,
								targetGridId: hoveringGridId,
								x: hoveringCell[0],
								y: hoveringCell[1],
							})
							.After((succ, res) => {
								clientState.removeItem(mockupId);
								clientState.lockItem(itemHoldingId, false);
								if (!succ) {
									clientState.moveItem(itemHoldingId, itemHoldingGridId, [lastX, lastY]);
								}
							});
					}
				}

				clientState.holdItem();
				clientState.setHoveringCell();
			}
		});

		return () => {
			print("clean");
			conn.Disconnect();
		};
	}, [itemHoldingId, hoveringCell, hoveringGridId, grids]);
}
