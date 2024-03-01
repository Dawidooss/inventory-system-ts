import { Instant, Linear, toBinding, useMotor, useMouse } from "@rbxts/pretty-react-hooks";
import React, { Binding, useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import getItemConfig from "shared/inventory/getItemConfig";
import clientState, { RootState } from "shared/reflex/clientState";
import { Item } from "shared/reflex/inventoryProducer";
import isPointInRect from "shared/utils/inventory/isPointInRect";
import Text from "../../basic/Text";

type Props = {
	Data: Item;
	GridId?: string;
	Holding?: boolean;
	Offset?: [number, number];
	Locked?: boolean;
	CenterOnGrid?: boolean;
};

export default function Item(props: Props) {
	const itemHolding = useSelector((state: RootState) => state.inventoryProducer.itemHolding);
	const cellSize = useSelector((state: RootState) => state.inventoryProducer.cellSize);
	const cellHovering = useSelector((state: RootState) => state.inventoryProducer.cellHovering);
	const splitVisible = useSelector((state: RootState) => !!state.inventoryProducer.splitData);

	const [transparency, transparencyAPI] = useMotor(0);
	const imageRef = useRef<ImageButton>();
	const mouse = useMouse();

	const config = getItemConfig(props.Data);

	// detect if is hovering and update itemsHovering state
	useEffect(() => {
		const state = clientState.getState().inventoryProducer;
		if (!(props.Locked || state.itemHolding?.id === props.Data.id) && cellHovering) {
			if (
				isPointInRect(
					new Vector2(cellHovering[0], cellHovering[1]),
					new Vector2(props.Data.x, props.Data.y),
					new Vector2(config.width - 1, config.height - 1),
				) &&
				props.GridId === state.gridHoveringId
			) {
				if (!state.itemsHovering.find((v) => v === props.Data)) clientState.setItemHovering(props.Data, true);
				return;
			}
		}
		if (state.itemsHovering.find((v) => v === props.Data)) {
			clientState.setItemHovering(props.Data, false);
		}
	}, [cellHovering, itemHolding]);

	let position: Binding<UDim2>;
	let anchorPoint: Vector2 | undefined;
	if (props.Holding) {
		position = mouse.map((p) => UDim2.fromOffset(p.X + (props.Offset?.[0] || 0), p.Y + (props.Offset?.[1] || 0)));
	} else if (props.CenterOnGrid) {
		position = toBinding(UDim2.fromScale(0.5, 0.5));
		anchorPoint = new Vector2(0.5, 0.5);
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
			AnchorPoint={anchorPoint}
			ImageTransparency={transparency.map((v) => {
				if (props.Locked) {
					if (v === 0) {
						transparencyAPI(new Linear(1, { velocity: 1.2 }));
					} else if (v === 1) {
						transparencyAPI(new Linear(0, { velocity: 1.2 }));
					}
				} else {
					transparencyAPI(new Instant(0));
				}
				return v;
			})}
			Event={{
				MouseButton1Down: (rbx) => {
					if (props.Locked) return;
					if (splitVisible) return;
					clientState.setContextData();
					const offset = rbx.AbsolutePosition.sub(mouse.getValue()).add(GuiService.GetGuiInset()[0]);

					clientState.holdItem(props.Data, [offset.X, offset.Y]);
					clientState.setItemHovering(props.Data, false);
				},
				MouseButton2Click: (rbx) => {
					if (props.Locked) return;
					if (splitVisible) return;

					const mouseLocation = mouse.getValue().sub(GuiService.GetGuiInset()[0]);
					clientState.setContextData([
						mouseLocation.X,
						mouseLocation.Y,
						props.Data,
						{
							drop: {
								color: Color3.fromRGB(255, 0, 0),
								callback: (item) => {
									clientState.removeItem(props.Data);
								},
							},
						},
					]);
				},
			}}
			ref={imageRef}
		>
			{props.Data.quantity > 1 && !props.Locked && (
				<Text
					Text={`${props.Data.quantity}`}
					Position={new UDim2(0, -cellSize / 8, 1, -cellSize / 1.6)}
					TextXAlignment={Enum.TextXAlignment.Right}
					Size={new UDim2(1, 0, 0, cellSize / 1.75)}
				/>
			)}
		</imagebutton>
	);
}
