import React from "@rbxts/react";
import Router from "../components/complex/Router";
import { createRoot } from "@rbxts/react-roblox";

export = (target: Frame): (() => void) => {
	const root = createRoot(target);

	root.render(Router());

	return () => {
		root.unmount();
	};
};
