import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { RootState } from "client/reflex/clientState";
import { Object } from "shared/utils/Object";

export default function ItemsEquipped() {
	const itemsEquipped = useSelector((state: RootState) => state.inventoryProducer.itemsEquipped);

	const itemsEquippedInPlayerInventory = itemsEquipped[tostring(Players.LocalPlayer.UserId)] || {};

	return (
		<frame
			Position={UDim2.fromScale(0.9, 1)}
			AnchorPoint={new Vector2(1, 0.7)}
			Size={UDim2.fromScale(0.1, 0.3)}
			BackgroundTransparency={1}
		>
			<uilistlayout />
			{Object.entries(itemsEquippedInPlayerInventory).map(([i, v]) => (
				<textlabel
					Text={`${i}: ${v?.name}`}
					Size={UDim2.fromScale(1, 0.2)}
					TextScaled
					BackgroundTransparency={1}
				/>
			))}
		</frame>
	);
}
