import React from "@rbxts/react";

type Props = {};

export default function Full(props: React.PropsWithChildren<Props>) {
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			{props.children}
		</frame>
	);
}
