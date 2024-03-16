import { InferState, combineProducers } from "@rbxts/reflex";
import { UseProducerHook, useProducer } from "@rbxts/react-reflex";
import mainProducer from "./mainProducer";

const clientState = combineProducers({
	mainProducer,
});

export type RootProducer = typeof clientState;
export type RootState = InferState<RootProducer>;
export const useRootProducer: UseProducerHook<RootProducer> = useProducer;

export default clientState;
