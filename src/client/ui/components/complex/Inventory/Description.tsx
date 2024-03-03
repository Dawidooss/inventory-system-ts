import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "client/reflex/clientState";
import { Object } from "shared/utils/Object";
import Button from "../../basic/Button";
import Full from "../../basic/Full";
import getItemConfig from "shared/inventory/getItemConfig";
import Text from "../../basic/Text";

type Props = {};
function splitTextIntoLines(text: string, maxLength: number): string {
	const lines: string[] = [];
	let currentLine = "";

	const words = text.split(" ");

	for (let i = 0; i < words.size(); i++) {
		const word = words[i];

		if ((currentLine + " " + word).size() <= maxLength) {
			currentLine += (currentLine === "" ? "" : " ") + word;
		} else {
			lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine !== "") {
		lines.push(currentLine);
	}

	return lines.join("\n");
}

export default function Description(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const [x, y, item] = useSelector((state: RootState) => state.inventoryProducer.descriptionData) || [];

	const itemConfig = item && getItemConfig(item);
	const visible = item && itemConfig;

	return visible ? (
		<imagelabel
			Image={"rbxassetid://14829383074"}
			BorderSizePixel={0}
			AutomaticSize={Enum.AutomaticSize.XY}
			Position={UDim2.fromOffset(x, y)}
			ScaleType={Enum.ScaleType.Crop}
		>
			<uipadding
				PaddingBottom={new UDim(0, 10)}
				PaddingLeft={new UDim(0, 10)}
				PaddingRight={new UDim(0, 10)}
				PaddingTop={new UDim(0, 10)}
			/>
			<uistroke
				Color={Color3.fromRGB(186, 138, 18)}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Thickness={3}
			/>
			<uilistlayout Padding={new UDim()} />
			{/* Title */}
			<Text
				AutomaticSize={Enum.AutomaticSize.X}
				Text={itemConfig.name.upper()}
				Size={new UDim2(0, 50, 0, cellSize / 1.8)}
				Color={Color3.fromRGB(163, 125, 0)}
			/>
			{/* Description */}
			{itemConfig.description && (
				<Text
					TextSize={cellSize / 2.5}
					AutomaticSize={Enum.AutomaticSize.XY}
					Text={splitTextIntoLines(itemConfig.description, 75)}
					// Size={new UDim2(0, 50, 0, cellSize / 2)}
					Color={Color3.fromRGB(0, 0, 0)}
				/>
			)}
		</imagelabel>
	) : (
		<Full />
	);
}
