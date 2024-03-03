import { InferState, combineProducers } from "@rbxts/reflex";
import inventoryProducer from "./inventoryProducer";
import { UseProducerHook, useProducer } from "@rbxts/react-reflex";

const clientState = combineProducers({
	inventoryProducer,
});

export type RootProducer = typeof clientState;
export type RootState = InferState<RootProducer>;
export const useRootProducer: UseProducerHook<RootProducer> = useProducer;

export default clientState;
