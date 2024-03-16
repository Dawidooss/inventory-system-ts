import React from "@rbxts/react";
import Line from "../../basic/Line";
import ReticleRange from "./ReticleRange";
import { Workspace } from "@rbxts/services";
import { ReflexProvider } from "@rbxts/react-reflex";
import clientState from "client/reflex/clientState";
import GunnerReticle from "./GunnerReticle";

export default function GunnerReticleRouter() {
	return (
		<ReflexProvider producer={clientState}>
			<GunnerReticle />
		</ReflexProvider>
	);
}
