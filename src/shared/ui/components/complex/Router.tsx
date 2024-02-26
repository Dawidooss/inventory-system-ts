import React from "@rbxts/react";
import { ReflexProvider } from "@rbxts/react-reflex";
import clientState from "shared/reflex/clientState";
import Inventory from "./Inventory";

export default function Router() {
	return (
		<ReflexProvider producer={clientState}>
			<Inventory />
		</ReflexProvider>
	);
}
