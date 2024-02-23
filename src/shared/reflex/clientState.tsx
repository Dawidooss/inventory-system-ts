import { InferState, combineProducers, createProducer } from "@rbxts/reflex";
import inventoryProducer from "./inventoryProducer";
import viewmodelProducer from "./viewmodelProducer";
import { UseProducerHook, useProducer } from "@rbxts/react-reflex";

const clientState = combineProducers({
	inventoryProducer,
	viewmodelProducer,
});

export type RootProducer = typeof clientState;
export type RootState = InferState<RootProducer>;
export const useRootProducer: UseProducerHook<RootProducer> = useProducer;

export default clientState;
