import { createRoot } from "@rbxts/react-roblox";
import clientState from "client/reflex/clientState";
import Router from "client/ui/components/complex/Router";

export = (target: Frame): (() => void) => {
	const root = createRoot(target);
	root.render(Router());

	clientState.setBackCallback(() => {});

	return () => {
		root.unmount();
	};
};
