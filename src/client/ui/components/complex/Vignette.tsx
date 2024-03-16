import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RootState } from "client/reflex/clientState";

export default function Vignette() {
	const visible = useSelector((state: RootState) => state.mainProducer.vignette);

	return (
		<imagelabel
			Size={UDim2.fromScale(1, 1)}
			Image="rbxassetid://10548483470"
			Visible={visible}
			BackgroundTransparency={1}
		/>
	);
}
