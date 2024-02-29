import React from "@rbxts/react";
import { ReflexProvider } from "@rbxts/react-reflex";
import clientState from "shared/reflex/clientState";
import InventoryRouter from "./Inventory/InventoryRouter";
import ItemsEquipped from "./ItemsEquipped";

export default function Router() {
	return (
		<ReflexProvider producer={clientState}>
			<InventoryRouter />
			<ItemsEquipped />
		</ReflexProvider>
	);
}
