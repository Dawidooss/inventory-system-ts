import React from "@rbxts/react";

type Props = {
	Start: UDim2;
	End: UDim2;
	Thickness?: number;
};

export default function Line(props: Props) {
	const size = props.End.sub(props.Start);
	return (
		<frame
			BorderSizePixel={0}
			BackgroundColor3={new Color3()}
			Position={props.Start.add(size.Lerp(new UDim2(), 0.5))}
			Size={size}
			AnchorPoint={new Vector2(0.5, 0.5)}
		>
			<uistroke Color={new Color3()} Thickness={props.Thickness || 1} />
		</frame>
	);
}
