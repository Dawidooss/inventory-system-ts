import { ReplicatedFirst } from "@rbxts/services";
import { Item } from "shared/reflex/inventoryProducer";

export default function getItemConfig(name: string | Item) {
	if (typeOf(name) === "string") {
		return require(ReplicatedFirst.items[name as string].config) as ItemConfig;
	} else {
		return require(ReplicatedFirst.items[(name as Item).name].config) as ItemConfig;
	}
}
