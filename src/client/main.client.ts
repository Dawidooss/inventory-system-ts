import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import Router from "./ui/components/complex/Router";
import TankController from "./tank/TankController";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
const player = Players.LocalPlayer;

const screenGui = new Instance("ScreenGui");
screenGui.Parent = playerGui;

const root = createRoot(screenGui);
root.render(Router());

new TankController();
