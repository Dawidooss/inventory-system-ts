import { createProducer } from "@rbxts/reflex";

export interface MainProducer {
	fadeTime?: number;
	backCallback?: [() => void];
	vignette: boolean;
}

const initialState: MainProducer = {
	vignette: false,
};

const mainProducer = createProducer(initialState, {
	setFade: (oldState: MainProducer, fadeTime?: number) => ({
		...oldState,
		fadeTime,
	}),

	setBackCallback: (oldState: MainProducer, backCallback?: () => void) => ({
		...oldState,
		backCallback: backCallback ? [backCallback] : undefined,
	}),

	enableVignette: (oldState: MainProducer, state: boolean) => ({
		...oldState,
		vignette: state,
	}),
});

export default mainProducer;
