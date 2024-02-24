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

	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);

	useEffect(() => {
		const conn = UserInputService.InputEnded.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				if (hoveringCell && hoveringGridId && itemHolding) {
					// move

					const [_, itemHoldingGridId] = findItem(grids, itemHolding.id);

					if (itemHoldingGridId && itemFits(grids[hoveringGridId], itemHolding, hoveringCell)) {
						const [lastX, lastY] = [itemHolding.x, itemHolding.y];
						clientState.moveItem(itemHolding, hoveringGridId, hoveringCell);
						clientState.lockItem(itemHolding, true);

						const mockup = { ...itemHolding, x: lastX, y: lastY };
						mockup.id = HttpService.GenerateGUID(false);

						clientState.addItem(hoveringGridId, mockup);
						clientState.lockItem(mockup, true);

						InventoryEvents.functions.moveItem
							.Call({
								itemId: itemHolding.id,
								gridId: itemHoldingGridId,
								targetGridId: hoveringGridId,
								x: hoveringCell[0],
								y: hoveringCell[1],
							})
							.After((succ, res) => {
								clientState.removeItem(mockup);
								clientState.lockItem(itemHolding, false);
								if (!succ) {
									clientState.moveItem(itemHolding, itemHoldingGridId, [lastX, lastY]);
								}
								print(clientState.getState().inventoryProducer);
							});
					}
				}

				clientState.holdItem();
				clientState.setHoveringCell();
			}
		});

		return () => {
			conn.Disconnect();
		};
	}, [hoveringCell, hoveringGridId, grids]);
}
