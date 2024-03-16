import { useEffect, useState } from "@rbxts/react";
import { CollectionService } from "@rbxts/services";

export default function useTaggedInstances(tag: string) {
	let [instances, setInstances] = useState<Instance[]>([]);

	useEffect(() => {
		const conn = CollectionService.GetInstanceAddedSignal(tag).Connect((v) => {
			instances = [...instances, v];
			setInstances(instances);
		});
		setInstances(CollectionService.GetTagged(tag));
		return () => {
			conn.Disconnect();
		};
	}, []);

	return instances;
}
