import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { RootState } from "shared/reflex/clientState";
import Text from "../../basic/Text";
import Grid from "./Grid";

const camera = Workspace.CurrentCamera!;

type Props = {
	inventoryName: string;
};

export default function Inventory(props: Props) {
	const grids = useSelector((state: RootState) => state.inventoryProducer.grids);
	const localInventory = useSelector((state: RootState) => state.inventoryProducer.inventories[props.inventoryName]);

	return (
		<imagelabel
			Image={"http://www.roblox.com/asset/?id=14590790831"}
			Position={UDim2.fromScale(0.016, 0.037)}
			Size={UDim2.fromScale(0.45, 0.941)}
			BackgroundTransparency={1}
		>
			<uiaspectratioconstraint
				AspectRatio={0.85}
				DominantAxis={Enum.DominantAxis.Height}
				AspectType={Enum.AspectType.ScaleWithParentSize}
			/>
			<Text Text={"EKWIPUNEK"} Position={UDim2.fromScale(0.07, 0.05)} Size={UDim2.fromScale(0.534, 0.06)} />
			<Grid Position={UDim2.fromScale(0.5, 0.8)} Data={grids[localInventory?.backpack]} />
		</imagelabel>
	);
}
