import { Linear, useMotor } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "client/reflex/clientState";

export default function Fade() {
	const [transparency, transparencyAPI] = useMotor(1);

	const fadeTime = useSelector((state: RootState) => state.mainProducer.fadeTime);

	useEffect(() => {
		let t: thread;
		if (!fadeTime) {
			transparencyAPI(new Linear(1, { velocity: 5 }));
		} else {
			transparencyAPI(new Linear(0, { velocity: 5 }));
			const t = task.delay(fadeTime, () => {
				clientState.setFade();
			});
		}
		return () => t && task.cancel(t);
	}, [fadeTime]);

	return (
		<frame
			ZIndex={math.huge}
			Size={UDim2.fromScale(2, 2)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			BackgroundTransparency={transparency}
			BackgroundColor3={Color3.fromRGB(0, 0, 0)}
		/>
	);
}
