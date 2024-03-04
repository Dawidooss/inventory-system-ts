import React, { useEffect, useMemo, useRef } from "@rbxts/react";
import Text from "../../basic/Text";
import Button from "../../basic/Button";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "client/reflex/clientState";
import getItemConfig from "shared/utils/inventory/getItemConfig";
import Full from "../../basic/Full";
import { SliderConfig } from "shared/utils/Slider";
import useSlider from "client/ui/hooks/useSlider";

type Props = {};

export default function SplitMenu(props: Props) {
	const [x, y, item, callback] = useSelector((state: RootState) => state.inventoryProducer.splitData) || [];
	const visible = !!callback;
	const itemConfig = item && getItemConfig(item);

	const sliderRef = useRef();
	const textboxRef = useRef<TextBox>();

	const sliderData: SliderConfig = useMemo(() => {
		return {
			SliderData: {
				Start: 1,
				End: math.min(item?.quantity || 3, itemConfig?.max || 3) - 1,
				Increment: 1,
				DefaultValue: math.ceil((item?.quantity || 1) / 2),
			},
			MoveInfo: new TweenInfo(0, Enum.EasingStyle.Linear),
			Axis: "X",
		};
	}, [item, itemConfig]);

	const slider = useSlider(sliderRef, sliderData);

	useEffect(() => {
		slider?.Track();

		const conn = slider?.Changed.Connect((newValue) => {
			textboxRef.current!.Text = `${newValue}`;
		});

		textboxRef.current?.GetPropertyChangedSignal("Text").Connect(() => {
			const newValue = tonumber(textboxRef.current?.Text);
			if (newValue && newValue !== slider?.GetValue()) {
				slider?.OverrideValue(newValue);
			}
		});

		textboxRef.current?.FocusLost.Connect(() => {
			if (slider?.GetValue()) textboxRef.current!.Text = `${slider?.GetValue()}`;
		});

		if (textboxRef.current) textboxRef.current.Text = `${slider?.GetValue()}`;

		return () => {
			conn?.Disconnect();
		};
	}, [slider, textboxRef]);

	return visible ? (
		<imagelabel
			Image={"rbxassetid://14829383074"}
			BorderSizePixel={0}
			Size={UDim2.fromScale(1, 0.16)}
			Position={UDim2.fromOffset(x, y)}
		>
			<uistroke
				Color={Color3.fromRGB(186, 138, 18)}
				LineJoinMode={Enum.LineJoinMode.Round}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Thickness={3}
			/>
			<uiaspectratioconstraint AspectRatio={2} />
			<Text Text="ROZDZIELANIE" Position={UDim2.fromScale(0.1, 0.08)} Size={UDim2.fromScale(0.5, 0.2)} Bold />

			<frame
				BackgroundColor3={Color3.fromRGB(32, 32, 32)}
				Size={UDim2.fromScale(0.6, 0.02)}
				Position={UDim2.fromScale(0.4, 0.45)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				ref={sliderRef}
			>
				<Button
					key={"Slider"}
					Position={UDim2.fromScale(0, 2)}
					Size={UDim2.fromScale(0.12, math.huge)}
					Text={"↑"}
					Color={Color3.fromRGB(0, 0, 0)}
					Bold
				>
					<uiaspectratioconstraint />
				</Button>
				<frame
					Size={UDim2.fromScale(0.02, 4)}
					BackgroundColor3={Color3.fromRGB(32, 32, 32)}
					AnchorPoint={new Vector2(0, 0.5)}
					Position={UDim2.fromScale(0, 0.5)}
				/>
				<frame
					Size={UDim2.fromScale(0.02, 4)}
					BackgroundColor3={Color3.fromRGB(32, 32, 32)}
					AnchorPoint={new Vector2(0, 0.5)}
					Position={UDim2.fromScale(0.98, 0.5)}
				/>
				<textbox
					Size={UDim2.fromScale(0.2, math.huge)}
					FontFace={Font.fromEnum(Enum.Font.Fondamento)}
					TextColor3={Color3.fromRGB(163, 125, 0)}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(1.15, 0.5)}
					AnchorPoint={new Vector2(0, 0.5)}
					Text={"1"}
					ClearTextOnFocus={false}
					TextScaled
					ref={textboxRef}
				>
					<uiaspectratioconstraint />
					<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
				</textbox>
			</frame>
			<Button
				Text={"ANULUJ"}
				Position={UDim2.fromScale(0.4, 0.7)}
				Size={UDim2.fromScale(0.25, 0.25)}
				Bold
				Events={{
					MouseButton1Click: () => {
						clientState.setSplitData();
						callback && callback(false, slider?.GetValue() || 0);
					},
				}}
			/>
			<Button
				Text={"PODZIEL"}
				Position={UDim2.fromScale(0.7, 0.7)}
				Size={UDim2.fromScale(0.25, 0.25)}
				Color={Color3.fromRGB(81, 144, 59)}
				Bold
				Events={{
					MouseButton1Click: () => {
						clientState.setSplitData();
						callback && callback(true, slider?.GetValue() || 0);
					},
				}}
			/>
		</imagelabel>
	) : (
		<></>
	);
}
