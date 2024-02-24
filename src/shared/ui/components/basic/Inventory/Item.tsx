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
	Offset?: [number, number];
	Locked?: boolean;
};

export default function Item(props: Props) {
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const hoveringCell = useSelector((state: RootState) => state.inventoryProducer.hoveringCell);
	const itemHoldingCellOffset = useSelector((state: RootState) => state.inventoryProducer.itemHoldingCellOffset);
	const [transparency, transparencyAPI] = useMotor(0);
	const imageRef = useRef<ImageButton>();
	const mouse = useMouse();

	const config = getItemConfig(props.Data);

	// detect if is hovering and update hoveringItem state
	useEffect(() => {
		if (!(props.Locked || clientState.getState().inventoryProducer.itemHoldingId === props.Id) && hoveringCell) {
			let x = hoveringCell[0] + itemHoldingCellOffset[0];
			let y = hoveringCell[1] + itemHoldingCellOffset[1];

			if (
				isPointInRect(
					new Vector2(x, y),
					new Vector2(props.Data.x, props.Data.y),
					new Vector2(config.width - 1, config.height - 1),
				)
			) {
				if (!clientState.getState().inventoryProducer.hoveringItems.find((v) => v === props.Data))
					clientState.setHoveringItem(props.Data, true);
				return;
			}
		}
		if (clientState.getState().inventoryProducer.hoveringItems.find((v) => v === props.Data)) {
			clientState.setHoveringItem(props.Data, false);
		}
	}, [hoveringCell]);

	let position: Binding<UDim2>;
	if (props.Holding) {
		position = mouse.map((p) => UDim2.fromOffset(p.X + (props.Offset?.[0] || 0), p.Y + (props.Offset?.[1] || 0)));
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

					clientState.holdItem(props.Data, props.Id, [offset.X, offset.Y]);
					clientState.setHoveringItem(props.Data, false);
				},
			}}
			ref={imageRef}
		></imagebutton>
	);
}
