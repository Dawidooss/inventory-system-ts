import { Instant, Linear, toBinding, useMotor, useMouse } from "@rbxts/pretty-react-hooks";
import React, { Binding, useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "shared/reflex/clientState";
import { Item } from "shared/reflex/inventoryProducer";
import getItemConfig from "shared/inventory/getItemConfig";
import isPointInRect from "shared/utils/inventory/isPointInRect";

type Props = {
	Id: string;
	Data: Item;
	Holding?: boolean;
	Offset?: Vector2;
	Locked?: boolean;
};

export default function Item(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const hoveringCell = useSelector((state: RootState) => state.inventoryProducer.hoveringCell);
	const [transparency, transparencyAPI] = useMotor(0);
	const imageRef = useRef<ImageButton>();
	const mouse = useMouse();

	const config = getItemConfig(props.Data);

	// detect if is hovering and update hoveringItem state
	useEffect(() => {
		if (!(props.Locked || clientState.getState().inventoryProducer.itemHoldingId === props.Id) && hoveringCell) {
			if (
				isPointInRect(
					new Vector2(hoveringCell[0], hoveringCell[1]),
					new Vector2(props.Data.x, props.Data.y),
					new Vector2(config.width - 1, config.height - 1),
				)
			) {
				if (clientState.getState().inventoryProducer.hoveringItemsIds.find((v) => v !== props.Id)) {
					print("xd");
					clientState.setHoveringItem(props.Id, true);
				}
				return;
			}
		}
		if (clientState.getState().inventoryProducer.hoveringItemsIds.find((v) => v === props.Id))
			clientState.setHoveringItem(props.Id, false);
	}, [hoveringCell]);

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
			ImageTransparency={transparency.map((v) => {
				if (props.Locked) {
					if (v === 0) {
						transparencyAPI(
							new Linear(1, {
								velocity: 1.5,
							}),
						);
					} else if (v === 1) {
						transparencyAPI(
							new Linear(0, {
								velocity: 1.5,
							}),
						);
					}
				} else {
					transparencyAPI(new Instant(0));
				}
				return v;
			})}
			Event={{
				MouseButton1Down: (rbx) => {
					if (props.Locked) return;
					const offset = rbx.AbsolutePosition.sub(mouse.getValue());
					clientState.holdItem(props.Data, props.Id, offset);
					clientState.setHoveringItem(props.Id, false);
				},
			}}
			ref={imageRef}
		></imagebutton>
	);
}
