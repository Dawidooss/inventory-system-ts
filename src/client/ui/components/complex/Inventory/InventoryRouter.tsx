import { useViewport } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { DataStoreService, GuiService, Players, Workspace } from "@rbxts/services";
import clientState, { RootState } from "client/reflex/clientState";
import Full from "../../basic/Full";
import Inventory from "./Inventory";
import Item from "./Item";
import SplitMenu from "./SplitMenu";
import ContextMenu from "./ContextMenu";
import useInventoryInput from "client/ui/hooks/useInventoryInput";
import Description from "./Description";

const camera = Workspace.CurrentCamera!;

export default function InventoryRouter() {
	const visible = useSelector((state: RootState) => state.inventoryProducer.visible);
	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const itemHoldingOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingOffset);

	const guiInset = GuiService.GetGuiInset()[0];

	useInventoryInput();
	useViewport(() => {
		const conn = camera.GetPropertyChangedSignal("ViewportSize").Connect(() => {
			clientState.setCellSize(math.floor(camera.ViewportSize.Y * (50 / 1080)));
		});

		return () => {
			conn.Disconnect();
		};
	});

	return visible ? (
		<>
			<Inventory inventoryId={`${Players.LocalPlayer.UserId}`} Position={UDim2.fromScale(0.02, 0.02)} />
			{itemHolding ? (
				<Item
					Data={itemHolding}
					Holding={true}
					Offset={[itemHoldingOffset[0] - guiInset.X, itemHoldingOffset[1] - guiInset.Y]}
				/>
			) : (
				<></>
			)}
			<SplitMenu />
			<ContextMenu />
			<Description />
		</>
	) : (
		<></>
	);
}