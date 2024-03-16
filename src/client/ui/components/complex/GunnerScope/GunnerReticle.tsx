import React from "@rbxts/react";
import Line from "../../basic/Line";
import ReticleRange from "./ReticleRange";
import { Workspace } from "@rbxts/services";
import { useSelector } from "@rbxts/react-reflex";
import { RootState } from "client/reflex/clientState";
import { Object } from "shared/utils/Object";

export default function GunnerReticle() {
	const reticle = useSelector((state: RootState) => state.tankProducer.reticle);

	return (
		<frame Size={UDim2.fromScale(1, 1)} Transparency={1}>
			<Line Start={UDim2.fromScale(0, 0.5)} End={UDim2.fromScale(1, 0.5)} />
			<Line Start={UDim2.fromScale(0.505, 0)} End={UDim2.fromScale(0.505, 1)} />
			{reticle &&
				Object.entries(reticle.AmmoTypes).map(([ammoType, reticleData]) => (
					<ReticleRange
						AmmoType={ammoType}
						Data={reticleData}
						Position={UDim2.fromScale(0.2, 0.5)}
						DistanceToReticle={reticle.DistanceToReticle}
						Elevation={reticle.Elevation}
					/>
				))}
		</frame>
	);
}
