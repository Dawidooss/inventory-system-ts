import React, { useEffect, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";

type Props = {
	AnchorPoint?: Vector2;
	Position?: UDim2;
	rotate: boolean;
};

export default function LoadingCircle(props: Props) {
	const [rotation, setRotation] = useState(0);

	useEffect(() => {
		RunService.RenderStepped.Wait();
		setRotation(rotation + 0.25);
	}, [rotation]);

	return (
		<imagelabel
			BackgroundTransparency={1}
			Image={"rbxassetid://16489624791"}
			AnchorPoint={props.AnchorPoint}
			Position={props.Position}
			Size={UDim2.fromOffset(75, 75)}
			Rotation={rotation}
			ImageTransparency={0.6}
		></imagelabel>
	);
}
