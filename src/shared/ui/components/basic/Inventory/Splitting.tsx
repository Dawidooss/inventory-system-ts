import React, { useEffect, useRef } from "@rbxts/react";
import Text from "../Text";
import useSlider from "shared/ui/hooks/useSlider";

type Props = {};

export default function Splitting(props: Props) {
	const sliderRef = useRef();

	const slider = useSlider(sliderRef, {
		SliderData: { Start: 0, End: 10, Increment: 1, DefaultValue: 5 },
		MoveInfo: new TweenInfo(0, Enum.EasingStyle.Linear),
		Axis: "X",
	});

	useEffect(() => {
		slider?.Track();
	}, [slider]);

	return (
		<imagelabel
			Image={"rbxassetid://14829383074"}
			BorderSizePixel={0}
			Size={UDim2.fromScale(1, 0.16)}
			Position={UDim2.fromScale(0.5, 0.5)}
		>
			<uistroke
				Color={Color3.fromRGB(186, 138, 18)}
				LineJoinMode={Enum.LineJoinMode.Round}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Thickness={3}
			/>
			<uiaspectratioconstraint AspectRatio={2} />
			<Text
				Text="ROZDZIELANIE"
				Position={UDim2.fromScale(0.05, 0.08)}
				Size={UDim2.fromScale(0.5, 0.2)}
				Weight={Enum.FontWeight.Bold}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(32, 32, 32)}
				Size={UDim2.fromScale(0.75, 0.02)}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				ref={sliderRef}
			>
				<textbutton
					key={"Slider"}
					Position={UDim2.fromScale(0, 2)}
					Size={UDim2.fromScale(0.12, math.huge)}
					Text={"↑"}
					BackgroundTransparency={1}
					TextScaled
					FontFace={Font.fromEnum(Enum.Font.Fondamento)}
				>
					<uiaspectratioconstraint />
				</textbutton>
			</frame>
		</imagelabel>
	);
}
