export default function weld(instance: Instance, primaryPart?: BasePart, unanchor?: boolean, addNewParts?: boolean) {
	const onBasePart = (v: BasePart) => {
		if (unanchor) (v as BasePart).Anchored = false;
		if (!primaryPart) {
			primaryPart = v as BasePart;
			return;
		}
		if (v.FindFirstChildOfClass("WeldConstraint")) return;
		const weld = new Instance("WeldConstraint");
		weld.Part0 = primaryPart;
		weld.Part1 = v as BasePart;
		weld.Parent = v;
	};

	if (addNewParts)
		instance.ChildAdded.Connect((v) => {
			if (v.IsA("BasePart")) onBasePart(v);
		});
	instance
		.GetDescendants()
		.filter((v) => v.IsA("BasePart"))
		.forEach((v) => onBasePart(v as BasePart));
}
