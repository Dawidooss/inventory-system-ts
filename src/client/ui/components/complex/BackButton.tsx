import { Linear, useMotor } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import clientState, { RootState } from "client/reflex/clientState";

export default function BackButton() {
	const callback = useSelector((state: RootState) => state.mainProducer.backCallback);
	const [transparency, transparencyAPI] = useMotor(1);

	transparencyAPI(new Linear(callback ? 0 : 1, { velocity: 5 }));

	return (
		<>
			{callback && (
				<textbutton
					TextTransparency={transparency}
					Size={UDim2.fromScale(0.07, 0.07)}
					AnchorPoint={new Vector2(1, 1)}
					Position={UDim2.fromScale(0.98, 0.98)}
					BackgroundTransparency={1}
					Text={"Back"}
					TextScaled
					FontFace={Font.fromName("Roboto", Enum.FontWeight.Bold)}
					TextColor3={Color3.fromRGB(189, 189, 189)}
					Event={{
						MouseButton1Click: () => {
							callback[0]();
							clientState.setBackCallback();
						},
					}}
				/>
			)}
		</>
	);
}
