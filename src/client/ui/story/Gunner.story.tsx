import { createRoot } from "@rbxts/react-roblox";
import { ReplicatedFirst, Workspace } from "@rbxts/services";
import clientState from "client/reflex/clientState";
import GunnerReticleRouter from "../components/complex/GunnerScope/GunnerReticleRouter";

export = (target: Frame): (() => void) => {
	const surfaceGui = new Instance("SurfaceGui");
	surfaceGui.Parent = Workspace.FindFirstChild("reticle", true)!.FindFirstChild("reticle");
	surfaceGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
	surfaceGui.PixelsPerStud = 2500;
	surfaceGui.LightInfluence = 1;

	const root = createRoot(surfaceGui);

	clientState.setReticle({
		DistanceToReticle: Workspace.CurrentCamera!.CFrame.Position.sub((surfaceGui.Parent! as BasePart).Position)
			.Magnitude,
		Elevation: 400,
		MaxElevation: 18,

		AmmoTypes: {
			AP: {
				Velocity: 680,
				Weight: 10,
				Interval: 100,
				MaxRanging: 2000,
			},
		},
	});
	root.render(GunnerReticleRouter());

	return () => {
		root.unmount();
		surfaceGui.Destroy();
	};
};
