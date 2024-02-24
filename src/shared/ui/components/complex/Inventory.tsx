import { HttpService, Players, RunService, UserInputService, Workspace } from "@rbxts/services";
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

	const itemHoldingId = useSelector((state: RootState) => state.inventoryProducer.itemHoldingId);
	const itemHoldingOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingOffset);
	const [itemHolding, itemHoldingGridId] = findItem(grids, itemHoldingId || "") || [];

	useInventoryInput();

	useViewport(() => {
		const conn = camera.GetPropertyChangedSignal("ViewportSize").Connect(() => {
			clientState.setCellSize(camera.ViewportSize.X * (50 / 1920));
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
				<Grid
					Id={localInventory?.backpack}
					Position={UDim2.fromScale(0.5, 0.8)}
					Data={grids[localInventory?.backpack]}
				/>
				{/* <Grid
					Id={localInventory?.test}
					Position={UDim2.fromScale(0.5, 0.4)}
					Data={grids[localInventory?.test]}
				/> */}
			</imagelabel>
			{itemHolding && itemHoldingId ? (
				<Item Id={itemHoldingId} Data={itemHolding} Holding={true} Offset={itemHoldingOffset} />
			) : (
				<Full />
			)}
		</Full>
	);
}
