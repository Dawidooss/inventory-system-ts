type ItemConfig = {
	name: string;
	image: string;
	description?: string;

	width: number;
	height: number;
	max: number;
	type?: string;
};

interface ReplicatedFirst extends Instance {
	items: Folder & {
		[key: string]: Model & {
			config: ModuleScript;
		};
	};
}
