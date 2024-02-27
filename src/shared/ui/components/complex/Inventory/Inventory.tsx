import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { RootState } from "shared/reflex/clientState";
import Text from "../../basic/Text";
import Grid from "./Grid";

type Props = {
	inventoryName: string;
};

export default function Inventory(props: Props) {
	const grids = useSelector((state: RootState) => state.inventoryProducer.grids);
	const inventory = useSelector((state: RootState) => state.inventoryProducer.inventories[props.inventoryName]);

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
			{grids[inventory?.backpack] && (
				<Grid Position={UDim2.fromScale(0.5, 0.8)} Data={grids[inventory!.backpack]} />
			)}
			{grids[inventory?.primary] && (
				<Grid Position={UDim2.fromScale(0.3, 0.5)} Data={grids[inventory!.primary]} />
			)}
			{grids[inventory?.secondary] && (
				<Grid Position={UDim2.fromScale(0.6, 0.5)} Data={grids[inventory!.secondary]} />
			)}
			{grids[inventory?.melee] && <Grid Position={UDim2.fromScale(0.8, 0.5)} Data={grids[inventory!.melee]} />}
		</imagelabel>
	);
}
