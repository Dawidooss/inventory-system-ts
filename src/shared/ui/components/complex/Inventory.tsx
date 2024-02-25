import { GuiService, HttpService, Players, RunService, UserInputService, Workspace } from "@rbxts/services";
import Text from "../basic/Text";
import Grid from "../basic/Inventory/Grid";
import inventoryProducer from "shared/reflex/inventoryProducer";
import clientState, { RootState } from "shared/reflex/clientState";
import React, { createRef, useCallback, useEffect, useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import Item from "../basic/Inventory/Item";
import { Object } from "shared/utils/Object";
import Full from "../basic/Full";
import { useViewport } from "@rbxts/pretty-react-hooks";
import { findItem } from "shared/utils/inventory/findItem";
import itemFits from "shared/utils/inventory/itemFits";
import { InventoryEvents } from "shared/events/inventory";
import useInventoryInput from "shared/ui/hooks/useInventoryInput";

const camera = Workspace.CurrentCamera!;

export default function InventoryUI() {
	const grids = useSelector((state: RootState) => state.inventoryProducer.grids);
	const localInventory = useSelector(
		(state: RootState) => state.inventoryProducer.inventories[tostring(Players.LocalPlayer.UserId)],
	);

	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingOffset);

	const guiInset = GuiService.GetGuiInset()[0];

	useInventoryInput();

	useViewport(() => {
		const conn = camera.GetPropertyChangedSignal("ViewportSize").Connect(() => {
			clientState.setCellSize(camera.ViewportSize.Y * (50 / 1080));
		});

		return () => {
			conn.Disconnect();
		};
	});

	return (
		<Full>
			<imagelabel
				Image={"http://www.roblox.com/asset/?id=14590790831"}
				Position={UDim2.fromScale(0.016, 0.037)}
				Size={UDim2.fromScale(0.45, 0.941)}
				BackgroundTransparency={1}
			>
				<uiaspectratioconstraint AspectRatio={0.85} />
				<Text Text={"EKWIPUNEK"} Position={UDim2.fromScale(0.07, 0.05)} Size={UDim2.fromScale(0.534, 0.06)} />
				<Grid Position={UDim2.fromScale(0.5, 0.8)} Data={grids[localInventory?.backpack]} />
				<Grid
					Position={UDim2.fromScale(0.5, 0.4)}
					Data={{
						id: "giganiga",
						width: 5,
						height: 5,
						items: [],
					}}
				/>
			</imagelabel>
			{itemHolding ? (
				<Item
					Data={itemHolding}
					Holding={true}
					Offset={[itemHoldingOffset[0] - guiInset.X, itemHoldingOffset[1] - guiInset.Y]}
				/>
			) : (
				<Full />
			)}
		</Full>
	);
}
