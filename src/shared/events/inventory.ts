import { Grid, GridTypes, Item } from "shared/types/inventory";
import Red from "shared/utils/Networking/Red";
import { Sedes } from "shared/utils/Networking/Sedes";

const itemSerializer = new Sedes.Serializer<Item>({
	id: Sedes.ToString(),
	name: Sedes.ToString(),
	quantity: Sedes.ToUnsigned(64),
	x: Sedes.ToUnsigned(8),
	y: Sedes.ToUnsigned(8),
	locked: Sedes.ToBool(),
});

const gridSerializer = new Sedes.Serializer<Grid>({
	id: Sedes.ToString(),
	name: Sedes.ToString(),
	type: Sedes.ToString() as Sedes.Method<GridTypes>,
	items: Sedes.ToArray(itemSerializer),
});

export namespace InventoryEvents {
	export const serializers = {
		fetchInventoryIn: new Sedes.Serializer({ inventoryId: Sedes.ToString() }),
		fetchInventoryOut: new Sedes.Serializer({ grids: Sedes.ToDict(gridSerializer) }),

		moveItemIn: new Sedes.Serializer({
			itemId: Sedes.ToString(),
			gridId: Sedes.ToString(),
			targetGridId: Sedes.ToString(),
			x: Sedes.ToUnsigned(8),
			y: Sedes.ToUnsigned(8),
			quantity: Sedes.ToUnsigned(64),
		}),
		moveItemOut: new Sedes.Serializer({ newItemId: Sedes.ToString() }),

		mergeItemsIn: new Sedes.Serializer({
			itemId: Sedes.ToString(),
			gridId: Sedes.ToString(),
			targetItemId: Sedes.ToString(),
			targetGridId: Sedes.ToString(),
			quantity: Sedes.ToUnsigned(64),
		}),

		dropItemIn: new Sedes.Serializer({
			itemId: Sedes.ToString(),
			gridId: Sedes.ToString(),
		}),

		addItem: new Sedes.Serializer({
			item: itemSerializer,
			gridId: Sedes.ToString(),
		}),

		setItemQuantity: new Sedes.Serializer({
			itemId: Sedes.ToString(),
			quantity: Sedes.ToUnsigned(64),
		}),
	};
	export const events = {
		addItem: Red.Event("addItem", serializers.addItem),
		setItemQuantity: Red.Event("setItemQuantity", serializers.setItemQuantity),
	};

	export const functions = {
		fetchInventory: Red.Function("fetchGrid", serializers.fetchInventoryIn, serializers.fetchInventoryOut),
		moveItem: Red.Function("moveItem", serializers.moveItemIn, serializers.moveItemOut),
		mergeItems: Red.Function("mergeItems", serializers.mergeItemsIn, Sedes.NoSerializer),
		dropItem: Red.Function("dropItem", serializers.dropItemIn, Sedes.NoSerializer),
	};
}
