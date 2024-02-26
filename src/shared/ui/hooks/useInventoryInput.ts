import { useKeyPress } from "@rbxts/pretty-react-hooks";
import { useCallback, useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, HttpService, UserInputService } from "@rbxts/services";
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
	let splittingKeyDown = useSelector((state: RootState) => state.inventoryProducer.splittingKeyDown);

	if (useKeyPress(["LeftControl"]) !== splittingKeyDown) {
		clientState.setSplittingKeyDown(!splittingKeyDown);
		splittingKeyDown = !splittingKeyDown;
	}

	const guiInset = GuiService.GetGuiInset()[0];

	const showInventoryKeyPressed = useKeyPress(["E"]);
	useEffect(() => {
		if (!showInventoryKeyPressed) return;
		clientState.showInventory(!clientState.getState().inventoryProducer.visible);
	}, [showInventoryKeyPressed]);

	const getQuantityToWorkWith = useCallback(
		(item: Item): [boolean, number] => {
			if (!splittingKeyDown || item.quantity <= 1) return [true, item.quantity];
			if (!splittingKeyDown || item.quantity === 2) return [true, 1];

			let success, quantity;
			const mouseLocation = UserInputService.GetMouseLocation();
			clientState.setSplittingData([
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
		},
		[splittingKeyDown],
	);

	const merge = useCallback(
		async (item: Item, targetItem: Item) => {
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
					clientState.mergeItems(item, targetItem, quantity);
				});
		},
		[grids, splittingKeyDown],
	);

	const move = useCallback(
		async (item: Item, targetGridId: string, x: number, y: number) => {
			const [_, itemGridId] = findItem(grids, item.id);
			clientState.lockItem(item, true);

			const mockup = { ...item, x, y };
			mockup.id = HttpService.GenerateGUID(false);

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
		},
		[grids, splittingKeyDown],
	);

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

				if (targetItem && targetItemGridId && canMerge(itemHolding, targetItem)) {
					merge(itemHolding, targetItem);
				} else if (itemFits(grids[gridHoveringId], itemHolding, targetCell, !splittingKeyDown)) {
					move(itemHolding, gridHoveringId, targetCell[0], targetCell[1]);
				}
			}

			clientState.holdItem();
		});

		return () => {
			conn.Disconnect();
		};
	}, [cellHovering, gridHoveringId, grids, itemsHovering, splittingKeyDown]);
}
