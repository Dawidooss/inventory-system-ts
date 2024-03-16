import { createProducer } from "@rbxts/reflex";

export type ReticleData = {
	Weight: number;
	Velocity: number;
	MaxDistance: number;
};

export interface TankProducer {
	reticle?: {
		Elevation: number;
		DistanceToReticle: number;

		AmmoTypes: {
			[key: string]: ReticleData;
		};
	};
}

const initialState: TankProducer = {};

const mainProducer = createProducer(initialState, {
	setReticle: (oldState: TankProducer, reticle?: TankProducer["reticle"]) => ({
		...oldState,
		reticle,
	}),
});

export default mainProducer;
