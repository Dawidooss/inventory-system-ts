import React, { useEffect, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";

type Props = {
	AnchorPoint?: Vector2;
	Position?: UDim2;
	Size?: UDim2;
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
			Size={props.Size || UDim2.fromScale(1, 1)}
			Rotation={rotation}
			ImageTransparency={0.6}
		></imagelabel>
	);
}
