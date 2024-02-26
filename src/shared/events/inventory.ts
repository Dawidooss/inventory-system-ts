import { Grid, Item } from "shared/reflex/inventoryProducer";
import Red from "shared/utils/Networking/Red";
import { Sedes } from "shared/utils/Networking/Sedes";

const itemSerializer = new Sedes.Serializer<Item>([
	["id", Sedes.ToString()],
	["name", Sedes.ToString()],
	["quantity", Sedes.ToUnsigned(64)],
	["x", Sedes.ToUnsigned(8)],
	["y", Sedes.ToUnsigned(8)],
	["locked", Sedes.ToBool()],
]);
const gridSerializer = new Sedes.Serializer<Grid>([
	["id", Sedes.ToString()],
	["type", Sedes.ToString()],
	["items", Sedes.ToArray(itemSerializer)],
]);

export namespace InventoryEvents {
	export const serializers = {
		fetchInventoryIn: new Sedes.Serializer<{
			inventoryId: string;
		}>([["inventoryId", Sedes.ToString()]]),

		fetchInventoryOut: new Sedes.Serializer<{
			grids: { [gridName: string]: Grid };
		}>([["grids", Sedes.ToDict(Sedes.ToString(), gridSerializer)]]),

		moveItemIn: new Sedes.Serializer<{
			itemId: string;
			gridId: string;
			targetGridId: string;
			x: number;
			y: number;
			quantity: number;
		}>([
			["itemId", Sedes.ToString()],
			["gridId", Sedes.ToString()],
			["targetGridId", Sedes.ToString()],
			["x", Sedes.ToUnsigned(8)],
			["y", Sedes.ToUnsigned(8)],
			["quantity", Sedes.ToUnsigned(64)],
		]),

		moveItemOut: new Sedes.Serializer<{
			newItemId: string;
		}>([["newItemId", Sedes.ToString()]]),

		mergeItemsIn: new Sedes.Serializer<{
			itemId: string;
			gridId: string;
			targetItemId: string;
			targetGridId: string;
			quantity: number;
		}>([
			["itemId", Sedes.ToString()],
			["gridId", Sedes.ToString()],
			["targetItemId", Sedes.ToString()],
			["targetGridId", Sedes.ToString()],
			["quantity", Sedes.ToUnsigned(64)],
		]),
	};
	export const events = {};

	export const functions = {
		fetchInventory: Red.Function("fetchGrid", serializers.fetchInventoryIn, serializers.fetchInventoryOut),
		moveItem: Red.Function("moveItem", serializers.moveItemIn, serializers.moveItemOut),
		mergeItems: Red.Function("mergeItems", serializers.mergeItemsIn, Sedes.NoSerializer),
	};
}
