import { ReplicatedFirst } from "@rbxts/services";

export default function getItemConfig(name: string) {
	return require(ReplicatedFirst.items[name].config) as ItemConfig;
}
