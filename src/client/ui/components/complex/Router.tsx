import React from "@rbxts/react";
import { ReflexProvider } from "@rbxts/react-reflex";
import clientState from "client/reflex/clientState";
import BackButton from "./BackButton";
import Fade from "./Fade";
import Prompts from "./Prompts";
import Vignette from "./Vignette";

export default function Router() {
	return (
		<ReflexProvider producer={clientState}>
			<Fade />
			<Prompts />
			<BackButton />
			<Vignette />
		</ReflexProvider>
	);
}
