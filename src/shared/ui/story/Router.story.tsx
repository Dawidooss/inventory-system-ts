import React from "@rbxts/react";
import Router from "../components/complex/Router";
import { createRoot } from "@rbxts/react-roblox";
import clientState from "shared/reflex/clientState";
import { HttpService, Players } from "@rbxts/services";

export = (target: Frame): (() => void) => {
	const root = createRoot(target);
	root.render(Router());

	const backpackId = HttpService.GenerateGUID(false);

	clientState.setGrid(backpackId, {
		id: backpackId,
		width: 15,
		height: 6,
		items: [
			{
				id: HttpService.GenerateGUID(false),
				name: "Patyk",
				quantity: 3,
				x: 1,
				y: 1,
				locked: false,
			},

			{
				id: HttpService.GenerateGUID(false),
				name: "Patyk",
				quantity: 4,
				x: 3,
				y: 1,
				locked: false,
			},
		],
	});

	clientState.setInventory(tostring(Players.LocalPlayer.UserId), {
		backpack: backpackId,
	});

	return () => {
		root.unmount();
	};
};
