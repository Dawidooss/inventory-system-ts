import { toBinding, useMouse } from "@rbxts/pretty-react-hooks";
import React, { Binding, Ref } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "shared/reflex/clientState";
import { Item } from "shared/reflex/inventoryProducer";
import getItemConfig from "shared/utils/getItemConfig";

type Props = {
	Id: string;
	Data: Item;
	Holding?: boolean;
	Offset?: Vector2;
};

export default function Item(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const mouse = useMouse();

	const config = getItemConfig(props.Data.name);

	let position: Binding<UDim2>;
	if (props.Holding) {
		position = mouse.map((p) => UDim2.fromOffset(p.X + (props.Offset?.X || 0), p.Y + (props.Offset?.Y || 0)));
	} else {
		position = toBinding(UDim2.fromOffset(cellSize * props.Data.x, cellSize * props.Data.y));
	}

	return (
		<imagebutton
			Image={config.image}
			Size={UDim2.fromOffset(cellSize * config.width, cellSize * config.height)}
			BackgroundTransparency={1}
			ScaleType={Enum.ScaleType.Fit}
			Position={position}
			Event={{
				MouseButton1Down: (rbx) => {
					const offset = rbx.AbsolutePosition.sub(mouse.getValue());
					clientState.holdItem(props.Id, offset);
				},
				MouseButton1Up: (rbx) => {
					if (clientState.getState().inventoryProducer.itemHoldingId === props.Id) {
						clientState.holdItem();
					}
				},
			}}
		></imagebutton>
	);
}
