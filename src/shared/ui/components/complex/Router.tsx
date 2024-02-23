import React, { StrictMode } from "@rbxts/react";
import InventoryUI from "./Inventory";
import clientState from "shared/reflex/clientState";
import { ReflexProvider } from "@rbxts/react-reflex";

export default function Router() {
	return (
		<StrictMode>
			<ReflexProvider producer={clientState}>
				<InventoryUI />
			</ReflexProvider>
		</StrictMode>
	);
}
