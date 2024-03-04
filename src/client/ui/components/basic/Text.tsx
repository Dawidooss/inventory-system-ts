import React, { Children } from "@rbxts/react";

type Props = {
	Text: string;
	Position?: UDim2;
	AnchorPoint?: Vector2;
	Size?: UDim2;
	Color?: Color3;
	TextXAlignment?: Enum.TextXAlignment;
	Transparency?: number;
	Bold?: boolean;
	Rotation?: number;
	AutomaticSize?: Enum.AutomaticSize;
	TextSize?: number;
};

export default function Text(props: React.PropsWithChildren<Props>) {
	const font = Font.fromEnum(Enum.Font.Fondamento);
	font.Weight = props.Bold ? Enum.FontWeight.Bold : Enum.FontWeight.Regular;

	return (
		<textlabel
			Rotation={props.Rotation}
			Text={props.Text}
			FontFace={font}
			TextColor3={props.Color || Color3.fromRGB(143, 1, 3)}
			Position={props.Position}
			AnchorPoint={props.AnchorPoint}
			Size={props.Size}
			TextScaled={!props.TextSize}
			TextSize={props.TextSize}
			BackgroundTransparency={1}
			TextXAlignment={props.TextXAlignment || Enum.TextXAlignment.Left}
			TextTransparency={props.Transparency || 0.4}
			AutomaticSize={props.AutomaticSize}
		>
			{props.children}
		</textlabel>
	);
}