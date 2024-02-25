import React from "@rbxts/react";

type Props = {
	Text: string;
	Position: UDim2;
	Size: UDim2;
	Color?: Color3;
	TextXAlignment?: Enum.TextXAlignment;
	Transparency?: number;
};

export default function Text(props: Props) {
	return (
		<textlabel
			Text={props.Text}
			FontFace={Font.fromEnum(Enum.Font.Fondamento)}
			TextColor3={props.Color || Color3.fromRGB(143, 1, 3)}
			Position={props.Position}
			Size={props.Size}
			TextScaled={true}
			BackgroundTransparency={1}
			TextXAlignment={props.TextXAlignment || Enum.TextXAlignment.Left}
			TextTransparency={props.Transparency || 0.4}
		/>
	);
}
