import { useKeyPress } from "@rbxts/pretty-react-hooks";
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

	const leftShift = useKeyPress(["LeftControl"]);

	const merge = async (item: Item, targetItem: Item, quantity: number) => {
		const [, itemGridId] = findItem(grids, item.id);
		const [, targetGridId] = findItem(grids, targetItem.id);

		clientState.lockItem(item, true);
		clientState.lockItem(targetItem, true);

		InventoryEvents.functions.mergeItems
			.Call({
				itemId: item.id,
				gridId: itemGridId!,
				targetItemId: targetItem.id,
				targetGridId: targetGridId!,
				quantity: quantity,
			})
			.After((succ) => {
				clientState.lockItem(item, false);
				clientState.lockItem(targetItem, false);
				if (!succ) return;
				clientState.mergeItems(item, targetItem, quantity);
			});
	};

	const move = async (item: Item, targetGridId: string, x: number, y: number, quantity: number) => {
		const [_, itemGridId] = findItem(grids, item.id);
		clientState.lockItem(item, true);

		const mockup = { ...item, x, y };
		mockup.id = HttpService.GenerateGUID(false);

		clientState.addItem(targetGridId, mockup);
		clientState.lockItem(mockup, true);

		InventoryEvents.functions.moveItem
			.Call({
				itemId: item.id,
				gridId: itemGridId!,
				targetGridId: targetGridId,
				x,
				y,
				quantity: quantity,
			})
			.After((succ, res) => {
				clientState.removeItem(mockup);
				clientState.lockItem(item, false);
				if (!succ) return;

				clientState.moveItem(item, targetGridId, [x, y], quantity, res.newItemId);
			});
	};

	useEffect(() => {
		const conn = UserInputService.InputEnded.Connect((input) => {
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;

			if (cellHovering && gridHoveringId && itemHolding) {
				const itemHoldingConfig = getItemConfig(itemHolding);

				const targetCell: [number, number] = [
					cellHovering[0] - itemHoldingCellOffset[0],
					cellHovering[1] - itemHoldingCellOffset[1],
				];

				const targetItem: Item | undefined = itemsHovering.filter((v) => v !== itemHolding)[0];
				const [__, targetItemGridId] = targetItem ? findItem(grids, targetItem.id) : [];

				if (leftShift) {
					const mouseLocation = UserInputService.GetMouseLocation();
					clientState.setSplitting([
						mouseLocation.X,
						mouseLocation.Y,
						itemHolding,
						(success, quantity) => {
							if (!success) return;
						},
					]);
				}
				const quantityToHandleWith = leftShift ? math.ceil(itemHolding.quantity / 2) : itemHolding.quantity;

				if (targetItem && targetItemGridId && canMerge(itemHolding, targetItem)) {
					const quantityToMerge = math.clamp(
						itemHoldingConfig.max - targetItem.quantity,
						0,
						quantityToHandleWith,
					);
					merge(itemHolding, targetItem, quantityToMerge);
				} else if (itemFits(grids[gridHoveringId], itemHolding, targetCell)) {
					move(itemHolding, gridHoveringId, targetCell[0], targetCell[1], quantityToHandleWith);
				}
			}

			clientState.holdItem();
		});

		return () => {
			conn.Disconnect();
		};
	}, [cellHovering, gridHoveringId, grids, itemsHovering]);
}
