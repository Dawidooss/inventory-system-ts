import { Debris } from "@rbxts/services";

export default async function removeCollisionBetweenModels(model1: PVInstance, model2: PVInstance, time?: number) {
	const start = tick();

	const model1Parts: BasePart[] = [];
	const model2Parts: BasePart[] = [];

	const createConstraints = (part: BasePart, otherParts: BasePart[]) => {
		for (let k of otherParts) {
			const constraint = new Instance("NoCollisionConstraint");
			constraint.Parent = part;
			constraint.Part0 = part;
			constraint.Part1 = k;
			if (time) Debris.AddItem(constraint, time - (tick() - start));
		}
	};

	for (let [, v] of pairs(model2.GetDescendants())) {
		if (v.IsA("BasePart")) {
			model2Parts.push(v);
		}
	}

	for (let [, v] of pairs(model1.GetDescendants())) {
		if (v.IsA("BasePart")) {
			model1Parts.push(v);
			createConstraints(v, model2Parts);
		}
	}

	const model1Conn = model1.DescendantAdded.Connect((v) => {
		if (v.IsA("BasePart")) createConstraints(v, model2Parts);
	});
	const model2Conn = model2.DescendantAdded.Connect((v) => {
		if (v.IsA("BasePart")) createConstraints(v, model1Parts);
	});

	if (time) {
		wait(time - (tick() - start));
		model1Conn.Disconnect();
		model2Conn.Disconnect();
	}
}
