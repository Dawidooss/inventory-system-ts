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
		items: {
			[HttpService.GenerateGUID(false)]: {
				name: "Szabla",
				quantity: 1,
				x: 0,
				y: 0,
				locked: false,
			},
			[HttpService.GenerateGUID(false)]: {
				name: "Patyk",
				quantity: 3,
				x: 4,
				y: 2,
				locked: false,
			},
			[HttpService.GenerateGUID(false)]: {
				name: "Patyk",
				quantity: 3,
				x: 7,
				y: 2,
				locked: false,
			},
		},
	});

	clientState.setInventory(tostring(Players.LocalPlayer.UserId), {
		backpack: backpackId,
	});

	return () => {
		root.unmount();
	};
};
