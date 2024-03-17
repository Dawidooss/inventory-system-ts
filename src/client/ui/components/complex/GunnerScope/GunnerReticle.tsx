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
			<Line Start={UDim2.fromScale(0.507, 0)} End={UDim2.fromScale(0.507, 1)} />
			{reticle &&
				Object.entries(reticle.AmmoTypes).map(([ammoType, reticleData]) => (
					<ReticleRange
						AmmoType={ammoType}
						Data={reticleData}
						MaxElevation={reticle.MaxElevation}
						Position={
							ammoType === "APCR"
								? UDim2.fromScale(0.15, 0.5)
								: ammoType === "AP"
									? UDim2.fromScale(0.3, 0.5)
									: ammoType === "HE"
										? UDim2.fromScale(0.7, 0.5)
										: UDim2.fromScale()
						}
						DistanceToReticle={reticle.DistanceToReticle}
						Elevation={reticle.Elevation}
					/>
				))}
		</frame>
	);
}
