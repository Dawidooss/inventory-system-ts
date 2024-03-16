import Maid from "@rbxts/maid";
import { Linear, useBindingListener, useCamera, useMotor } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { Debris, Players, UserInputService, Workspace } from "@rbxts/services";
import { PromptInstance } from "client/PromptService";
import useAttribute from "client/ui/hooks/useAttribute";

type Props = {
	instance: PromptInstance;
	onTrigger: () => void;
};

export default function Prompt(props: Props) {
	const [visible, setVisible] = useState(false);
	const [radius, setRadius] = useState(0);
	const [position, setPosition] = useState(new Vector2());
	const [debounce, setDebounce] = useState(false);
	const [transparency, transparencyAPI] = useMotor(0);
	const [hold, holdAPI] = useMotor(0);

	const disabled = useAttribute(props.instance, "disabled");
	const camera = useCamera();

	useEffect(() => {
		const update = () => {
			const [instanceLocation, onScreen] = camera.WorldToScreenPoint(props.instance.GetPivot().Position);
			const distance = camera.CFrame.Position.sub(props.instance.GetPivot().Position).Magnitude;
			const mouseDistance = UserInputService.GetMouseLocation().sub(
				new Vector2(instanceLocation.X, instanceLocation.Y),
			).Magnitude;

			const params = new RaycastParams();
			params.FilterDescendantsInstances = [Players.LocalPlayer.Character!];
			params.FilterType = Enum.RaycastFilterType.Exclude;

			const origin = camera.CFrame.Position;
			const result1 = Workspace.Raycast( origin, new CFrame(camera.CFrame.Position, props.instance.GetPivot().Position).LookVector.mul(1000), params); // prettier-ignore

			const rayVisible = result1 && result1.Instance === props.instance;

			const radius = (25 - distance) * 4;
			const visible = (distance < 15 && mouseDistance < radius && rayVisible && onScreen) as boolean;

			setPosition(new Vector2(instanceLocation.X, instanceLocation.Y));
			setRadius(radius);
			setVisible(visible);
			if (!visible) {
				holdAPI(new Linear(0, { velocity: 10 }));
			}
		};

		const maid = new Maid();
		maid.GiveTask(camera.GetPropertyChangedSignal("CFrame").Connect(update));
		maid.GiveTask(UserInputService.InputChanged.Connect(update));

		return () => {
			maid.DoCleaning();
		};
	}, [camera]);

	if (disabled && visible) setVisible(false);

	transparencyAPI(
		new Linear(visible ? 0 : 1, {
			velocity: 10,
		}),
	);

	useBindingListener(hold, (v) => {
		if (v === 1 && !debounce) {
			if (visible) props.onTrigger();
			holdAPI(new Linear(0, { velocity: 10 }));
			setDebounce(true);
			wait(0.5);
			setDebounce(false);
		}
	});

	return (
		<frame
			Size={UDim2.fromOffset(radius, radius)}
			SizeConstraint={Enum.SizeConstraint.RelativeXX}
			Position={UDim2.fromOffset(position.X, position.Y)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Transparency={1}
			Visible={transparency.map((v) => v !== 1)}
		>
			<textlabel
				Text={props.instance.Name}
				AnchorPoint={new Vector2(0.5, 0)}
				Position={UDim2.fromScale(0.5, -0.5)}
				Size={UDim2.fromScale(2, 0.5)}
				BackgroundTransparency={1}
				TextTransparency={transparency}
				TextScaled
				TextColor3={Color3.fromRGB(255, 255, 255)}
				FontFace={Font.fromName("Roboto", Enum.FontWeight.Bold)}
			/>
			<frame Size={UDim2.fromScale(1, 1)} Transparency={1}>
				<textbutton
					Size={UDim2.fromScale(1, 1)}
					Transparency={1}
					Event={{
						MouseButton1Down: () => {
							holdAPI(new Linear(1, { velocity: 1 }));
						},
						MouseButton1Up: () => {
							holdAPI(new Linear(0, { velocity: 10 }));
						},
					}}
				>
					<frame
						Size={hold.map((v) => UDim2.fromScale(v, v))}
						AnchorPoint={new Vector2(0.5, 0.5)}
						Position={UDim2.fromScale(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(191, 191, 191)}
						Transparency={transparency}
					>
						<uicorner CornerRadius={new UDim(1, 0)} />
					</frame>
					<imagelabel
						Size={UDim2.fromScale(1, 1)}
						BackgroundTransparency={1}
						ImageTransparency={transparency}
						ImageColor3={Color3.fromRGB(140, 140, 140)}
						Image={"rbxassetid://16735275158"}
					/>
				</textbutton>
			</frame>
		</frame>
	);
}
