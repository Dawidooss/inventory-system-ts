import React from "@rbxts/react";
import { ReflexProvider } from "@rbxts/react-reflex";
import InventoryRouter from "./Inventory/InventoryRouter";
import ItemsEquipped from "./ItemsEquipped";
import clientState from "client/reflex/clientState";

export default function Router() {
	return (
		<ReflexProvider producer={clientState}>
			<InventoryRouter />
			<ItemsEquipped />
		</ReflexProvider>
	);
}
