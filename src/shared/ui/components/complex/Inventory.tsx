import { Workspace } from "@rbxts/services";
import Text from "../basic/Text";
import Grid from "../basic/Inventory/Grid";
import inventoryProducer from "shared/reflex/inventoryProducer";
import clientState, { RootState } from "shared/reflex/clientState";
import React, { createRef, useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import Item from "../basic/Inventory/Item";
import { Object } from "shared/utils/Object";
import Full from "../basic/Full";
import { useViewport } from "@rbxts/pretty-react-hooks";

const camera = Workspace.CurrentCamera!;

export default function InventoryUI() {
	const backpack = useSelector((state: RootState) => state.inventoryProducer.backpack);

	const itemHoldingId = useSelector((state: RootState) => state.inventoryProducer.itemHoldingId);
	const itemHoldingOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingOffset);
	const itemHolding = Object.entries(backpack.items).find(([id]) => id === itemHoldingId);

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
				<Grid AnchorPoint={new Vector2(0.5, 1)} Position={UDim2.fromScale(0.5, 0.95)} Data={backpack} />
				<Grid AnchorPoint={new Vector2(0.5, 0.5)} Position={UDim2.fromScale(0.5, 0.3)} />
			</imagelabel>
			{itemHolding && itemHoldingId ? (
				<Item Id={itemHoldingId} Data={itemHolding[1]} Holding={true} Offset={itemHoldingOffset} />
			) : (
				<Full />
			)}
		</Full>
	);
}
