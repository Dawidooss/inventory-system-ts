import { Item } from "shared/reflex/inventoryProducer";
import getItemConfig from "../../inventory/getItemConfig";

export default function canMerge(item: Item, targetItem: Item) {
	const itemConfig = getItemConfig(item);

	return item.name === targetItem.name && targetItem.quantity < itemConfig.max;
}
