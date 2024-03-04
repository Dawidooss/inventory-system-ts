import React, { useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RootState } from "client/reflex/clientState";
import getGridConfig from "shared/utils/inventory/getGridConfig";
import Full from "../../basic/Full";
import Text from "../../basic/Text";
import Cell from "./Cell";
import Item from "./Item";
import { Grid } from "shared/types/inventory";
import useUnifiedGrid from "client/ui/hooks/useUnifiedGrid";
import useGrid from "client/ui/hooks/useGrid";

type Props = {
	Position: UDim2;
	Data: Grid;
	Unified?: boolean;
};

export default function Grid(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);

	const gridConfig = props.Data && getGridConfig(props.Data);

	const gridRef = useRef<Frame>();
	const colorMap = gridConfig?.unified ? useUnifiedGrid(gridRef, props.Data) : useGrid(gridRef, props.Data);

	return (
		<frame
			Size={UDim2.fromOffset(gridConfig.width * cellSize, gridConfig.height * cellSize)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={props.Position}
			BackgroundTransparency={1}
			ref={gridRef}
		>
			<Text
				Text={gridConfig.text || ""}
				Size={UDim2.fromScale(0.8, 1)}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				TextXAlignment={Enum.TextXAlignment.Center}
				Color={Color3.fromRGB(25, 25, 25)}
				Rotation={-math.deg(math.atan(gridConfig.height / gridConfig.width))}
			>
				<uitextsizeconstraint MaxTextSize={40} />
			</Text>
			<Full>
				<uigridlayout CellSize={new UDim2(0, cellSize, 0, cellSize)} CellPadding={new UDim2()} />

				{table.create(gridConfig.width * gridConfig.height, 0).map((v, i) => {
					const y = math.floor(i / gridConfig.width);
					const x = i - y * gridConfig.width;

					return <Cell key={v} Color={colorMap![x] && colorMap![x][y]} />;
				})}
			</Full>
			{props.Data!.items.map((v) =>
				itemHolding !== v ? (
					<Item
						key={v.id}
						GridId={props.Data.id}
						Data={v}
						Locked={v.id === itemHolding?.id || v.locked}
						CenterOnGrid={gridConfig?.unified}
					/>
				) : (
					<></>
				),
			)}
		</frame>
	);
}
