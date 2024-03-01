import React from "@rbxts/react";

type Props = {
	Text?: string;
	Position?: UDim2;
	Size?: UDim2;
	Color?: Color3;
	TextXAlignment?: Enum.TextXAlignment;
	Transparency?: number;
	Bold?: boolean;

	OnClick?: () => void;
};

export default function Button(props: React.PropsWithChildren<Props>) {
	const font = Font.fromEnum(Enum.Font.Fondamento);
	font.Weight = props.Bold ? Enum.FontWeight.Bold : Enum.FontWeight.Regular;

	return (
		<textbutton
			Text={props.Text}
			FontFace={font}
			TextColor3={props.Color || Color3.fromRGB(143, 1, 3)}
			Position={props.Position}
			Size={props.Size}
			TextScaled={true}
			BackgroundTransparency={1}
			TextXAlignment={props.TextXAlignment || Enum.TextXAlignment.Left}
			TextTransparency={props.Transparency || 0.4}
			Event={{
				MouseButton1Click: props?.OnClick,
			}}
		>
			{props.children}
		</textbutton>
	);
}
