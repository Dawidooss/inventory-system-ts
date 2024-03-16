import { CollectionService } from "@rbxts/services";

export default function getTagged(container: Instance, tag: string, callback: (instance: any) => void) {
	CollectionService.GetTagged(tag).forEach((v) => {
		if (v.IsDescendantOf(container)) {
			callback(v);
		}
	});
	const conn = CollectionService.GetInstanceAddedSignal(tag).Connect(callback);

	return () => {
		conn.Disconnect();
	};
}
