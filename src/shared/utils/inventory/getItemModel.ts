import { ReplicatedFirst } from "@rbxts/services";
import { Item } from "shared/types/inventory";

export default function getItemModel(name: string | Item) {
	if (typeOf(name) === "string") {
		return (ReplicatedFirst.items.FindFirstChild(name as string) as ItemPrefab)?.model;
	} else {
		return (ReplicatedFirst.items.FindFirstChild((name as Item).name) as ItemPrefab)?.model;
	}
}
