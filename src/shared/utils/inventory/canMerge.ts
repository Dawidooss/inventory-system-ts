import { Item } from "shared/types/inventory";
import getItemConfig from "../../inventory/getItemConfig";

export default function canMerge(item: Item, targetItem: Item) {
	const itemConfig = getItemConfig(item);

	return item.name === targetItem.name && targetItem.quantity < itemConfig.max;
}
