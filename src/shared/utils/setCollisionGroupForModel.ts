export default function setCollisionGroupForModel(model: Model, collisionGroup: string) {
	(model.GetDescendants().filter((v) => v.IsA("BasePart")) as BasePart[]).forEach((v) => {
		v.CollisionGroup = collisionGroup;
	});
}
