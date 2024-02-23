import { createProducer } from "@rbxts/reflex";

export interface ViewmodelProducer {}

const initialState: ViewmodelProducer = {};

const viewmodelProducer = createProducer(initialState, {
	// setSelectedWeapon: (state: ViewmodelProducer, selectedWeapon: ViewmodelProducer["selectedWeapon"]) => ({
	// 	...state,
	// 	selectedWeapon,
	// }),
});

export default viewmodelProducer;
