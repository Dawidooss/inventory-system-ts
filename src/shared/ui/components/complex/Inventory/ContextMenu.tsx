import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import getItemConfig from "shared/inventory/getItemConfig";
import clientState, { RootState } from "shared/reflex/clientState";
import Button from "../../basic/Button";
import Full from "../../basic/Full";
import Text from "../../basic/Text";
import { Object } from "shared/utils/Object";

type Props = {};

export default function ContextMenu(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const [x, y, item, options] = useSelector((state: RootState) => state.inventoryProducer.contextData) || [];

	const height = (Object.keys(options || {}).size() * cellSize) / 1.5;
	const visible = options && item && height > 0;

	return visible ? (
		<imagelabel
			Image={"rbxassetid://14829383074"}
			BorderSizePixel={0}
			Size={new UDim2(0.07, 0, 0, height)}
			Position={UDim2.fromOffset(x, y)}
		>
			<uistroke
				Color={Color3.fromRGB(186, 138, 18)}
				LineJoinMode={Enum.LineJoinMode.Round}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Thickness={3}
			/>
			<uilistlayout />
			{Object.entries(options).map(([text, data]) => (
				<Button
					Text={text}
					Color={data.color}
					Size={new UDim2(1, 0, 0, cellSize / 1.5)}
					Bold
					OnClick={() => {
						print("click");
						data.callback(item);
						clientState.setContextData();
					}}
				/>
			))}
		</imagelabel>
	) : (
		<Full />
	);
}
