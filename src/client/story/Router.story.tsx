import React from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import clientState from "shared/reflex/clientState";
import { HttpService, Players } from "@rbxts/services";
import ToolsHandler from "client/Tools";
import Router from "shared/ui/components/complex/Router";

export = (target: Frame): (() => void) => {
	const root = createRoot(target);
	root.render(Router());

	new ToolsHandler();

	const backpackId = HttpService.GenerateGUID(false);
	const primaryId = HttpService.GenerateGUID(false);
	const secondaryId = HttpService.GenerateGUID(false);
	const meleeId = HttpService.GenerateGUID(false);

	clientState.setGrid(backpackId, {
		id: backpackId,
		name: "backpack",
		type: "backpack",
		items: [
			{
				id: HttpService.GenerateGUID(false),
				name: "Szabla",
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

	clientState.setGrid(primaryId, {
		id: primaryId,
		name: "primary",
		type: "primary",
		items: [],
	});
	clientState.setGrid(secondaryId, {
		id: secondaryId,
		name: "secondary",
		type: "secondary",
		items: [],
	});
	clientState.setGrid(meleeId, {
		id: meleeId,
		name: "melee",
		type: "melee",
		items: [],
	});

	clientState.setInventory(tostring(Players.LocalPlayer.UserId), {
		backpack: backpackId,
		primary: primaryId,
		secondary: secondaryId,
		melee: meleeId,
	});

	return () => {
		root.unmount();
	};
};
