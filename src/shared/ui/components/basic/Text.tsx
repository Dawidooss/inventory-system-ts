import React from "@rbxts/react";

type Props = {
	Text: string;
	Position: UDim2;
	Size: UDim2;
	Color?: Color3;
	TextXAlignment?: Enum.TextXAlignment;
	Transparency?: number;
	Weight?: Enum.FontWeight;
};

export default function Text(props: Props) {
	const font = Font.fromEnum(Enum.Font.Fondamento);
	font.Weight = props.Weight || Enum.FontWeight.Regular;

	return (
		<textlabel
			Text={props.Text}
			FontFace={font}
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
