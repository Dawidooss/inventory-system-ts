type ItemModel = Model & {
	PrimaryPart: BasePart;
};

type ItemPrefab = Model & {
	config: ModuleScript;
	model?: ItemModel;
};

interface ReplicatedFirst extends Instance {
	items: Folder & {
		[key: string]: ItemPrefab;
	};
	pouch: ItemModel;
}
