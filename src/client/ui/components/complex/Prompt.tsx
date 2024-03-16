import Maid from "@rbxts/maid";
import { Linear, useBindingListener, useCamera, useMotor } from "@rbxts/pretty-react-hooks";
import promiseR15 from "@rbxts/promise-character";
import React, { useEffect, useState } from "@rbxts/react";
import { Debris, Players, UserInputService, Workspace } from "@rbxts/services";
import { PromptInstance } from "client/PromptService";
import useAttribute from "client/ui/hooks/useAttribute";

type Props = {
	instance: PromptInstance;
	onTrigger: () => void;
};

export default function Prompt(props: Props) {
	const [debounce, setDebounce] = useState(false);
	const [transparency, transparencyAPI] = useMotor(0);
	const [diamondTransparency, diamondTransparencyAPI] = useMotor(0);
	const [hold, holdAPI] = useMotor(0);

	const [data, setData] = useState({
		inRange: false,
		obstructed: true,
		onScreen: false,
		radius: 0,
		position: new Vector2(),
		mouseOnPrompt: false,
	});

	const disabled = useAttribute(props.instance, "disabled");
	const camera = useCamera();

	useEffect(() => {
		const update = async () => {
			const character = Players.LocalPlayer.Character && (await promiseR15(Players.LocalPlayer.Character));
			if (!character) return;
			const [instanceLocation, onScreen] = camera.WorldToScreenPoint(props.instance.GetPivot().Position);
			const distance = character.HumanoidRootPart.Position.sub(props.instance.GetPivot().Position).Magnitude;
			const mouseDistance = UserInputService.GetMouseLocation().sub(
				new Vector2(instanceLocation.X, instanceLocation.Y),
			).Magnitude;

			const distanceFromCamera = camera.CFrame.Position.sub(props.instance.GetPivot().Position).Magnitude;

			const params = new RaycastParams();
			params.FilterDescendantsInstances = [Players.LocalPlayer.Character!];
			params.FilterType = Enum.RaycastFilterType.Exclude;

			const origin = camera.CFrame.Position;
			const result1 = Workspace.Raycast( origin, new CFrame(camera.CFrame.Position, props.instance.GetPivot().Position).LookVector.mul(1000), params); // prettier-ignore

			const rayVisible = result1 && result1.Instance === props.instance;
			const radius = (25 - distanceFromCamera) * 4;

			setData({
				inRange: distance < 15,
				obstructed: !rayVisible,
				onScreen: onScreen,
				position: new Vector2(instanceLocation.X, instanceLocation.Y),
				radius: radius,
				mouseOnPrompt: mouseDistance < radius,
			});
		};

		const maid = new Maid();
		maid.GiveTask(camera.GetPropertyChangedSignal("CFrame").Connect(update));
		maid.GiveTask(UserInputService.InputChanged.Connect(update));

		return () => {
			maid.DoCleaning();
		};
	}, [camera]);

	const visible = data.inRange && data.mouseOnPrompt && !data.obstructed && data.onScreen && !disabled;
	const diamondVisible = data.inRange && !data.obstructed && data.onScreen && !disabled && !visible;
	if (!visible) {
		holdAPI(new Linear(0, { velocity: 10 }));
	}

	transparencyAPI(
		new Linear(visible ? 0 : 1, {
			velocity: 10,
		}),
	);

	diamondTransparencyAPI(
		new Linear(diamondVisible ? 0 : 1, {
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
		<>
			<frame
				Size={UDim2.fromOffset(data.radius, data.radius)}
				SizeConstraint={Enum.SizeConstraint.RelativeXX}
				Position={UDim2.fromOffset(data.position.X, data.position.Y)}
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
			<frame
				Position={UDim2.fromOffset(data.position.X, data.position.Y)}
				Size={UDim2.fromOffset(data.radius / 4, data.radius / 4)}
				SizeConstraint={Enum.SizeConstraint.RelativeXX}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BorderSizePixel={0}
				BackgroundTransparency={diamondTransparency}
				BackgroundColor3={new Color3(1, 1, 1)}
				Rotation={45}
			/>
		</>
	);
}
