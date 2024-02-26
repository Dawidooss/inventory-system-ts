import React, { useEffect, useRef } from "@rbxts/react";
import Text from "../Text";
import useSlider from "shared/ui/hooks/useSlider";
import Button from "../Button";

type Props = {
	Position: UDim2;
	DefaultValue: number;
	Max: number;
	Callback: (success: boolean, quantity: number) => void;
};

export default function Splitting(props: Props) {
	const [x, y];

	const sliderRef = useRef();
	const textboxRef = useRef<TextBox>();

	const slider = useSlider(sliderRef, {
		SliderData: { Start: 0, End: 10, Increment: props.Max, DefaultValue: props.DefaultValue },
		MoveInfo: new TweenInfo(0, Enum.EasingStyle.Linear),
		Axis: "X",
	});

	useEffect(() => {
		if (!textboxRef.current) return;
		slider?.Track();

		const conn = slider?.Changed.Connect((newValue) => {
			textboxRef.current!.Text = `${newValue}`;
		});

		textboxRef.current.GetPropertyChangedSignal("Text").Connect(() => {
			const newValue = tonumber(textboxRef.current?.Text);
			if (newValue && newValue !== slider?.GetValue()) {
				print("newValue", newValue);
				slider?.OverrideValue(newValue);
			}
		});

		textboxRef.current!.FocusLost.Connect(() => {
			if (slider?.GetValue()) textboxRef.current!.Text = `${slider?.GetValue()}`;
		});

		return () => {
			conn?.Disconnect();
		};
	}, [slider, textboxRef]);

	return (
		<imagelabel
			Image={"rbxassetid://14829383074"}
			BorderSizePixel={0}
			Size={UDim2.fromScale(1, 0.16)}
			Position={props.Position}
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
				OnClick={() => props.Callback(false, slider?.GetValue() || 0)}
			/>
			<Button
				Text={"PODZIEL"}
				Position={UDim2.fromScale(0.7, 0.7)}
				Size={UDim2.fromScale(0.25, 0.25)}
				Color={Color3.fromRGB(81, 144, 59)}
				Bold
				OnClick={() => props.Callback(true, slider?.GetValue() || 0)}
			/>
		</imagelabel>
	);
}
