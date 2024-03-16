import { HttpService, Players, Workspace } from "@rbxts/services";
import { Net } from "shared/Net";
import check from "shared/utils/check";
import getTagged from "shared/utils/getTagged";
import Tank from "./Tank";
import { TankModel } from "shared/types/tank";

Players.PlayerAdded.Connect((player) => {
	player.CharacterAppearanceLoaded.Connect((character) => {
		for (let v of character.GetDescendants()) {
			if (v.IsA("Accessory")) v.Destroy();
		}
	});
});

const tanks: Tank[] = [];

getTagged(Workspace, "tank", (tankModel: TankModel) => {
	tankModel.Name = `tank-${tanks.size()}`;
	const tank = new Tank(tankModel);
	tanks.push(tank);
});

Net.events.enterTank.Server().On((player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	if (!tank) return;

	tank.Enter(player, data.role);
});

Net.events.exitTank.Server().On((player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	if (!tank) return;

	tank.Exit(player);
});

Net.events.pullGunLever.Server().On((player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	if (!tank) return;

	tank.ToggleGunHatch();
});

Net.events.placeDownAmmo.Server().On((player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	if (!tank) return;

	tank.PlaceDownAmmo();
});

Net.events.reload.Server().On((player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	check(tank, `No tank with id${data.tankId}`);

	tank.Reload();
	return {};
});

Net.events.tankRotation.Server().On((player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	check(tank, `No tank with id${data.tankId}`);

	tank.SetRotation(data.turretRotation / 5, data.gunRotation / 5);
	return {};
});

Net.functions.unload.SetCallback(async (player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	check(tank, `No tank with id${data.tankId}`);
	check(player.Character, "Player has no character");
	check(!player.Character.FindFirstChild("ammo"), "Player has ammo on him");

	const ammo = tank.gun?.FindFirstChild("ammo") as BasePart | undefined;
	check(ammo, "No ammo found in gun");

	await tank.GrabAmmo(ammo);

	return {};
});

Net.functions.grabAmmo.SetCallback(async (player, data) => {
	const tank = tanks.find((v) => v.id === data.tankId);
	check(tank, `No tank with id${data.tankId}`);
	check(player.Character, "Player has no character");
	check(!player.Character.FindFirstChild("ammo"), "Player has ammo on him");

	let success = false;

	getTagged(tank.model, "ammoSource", async (ammo: BasePart) => {
		if (ammo.Name !== data.ammoType) return;
		await tank.GrabAmmo(ammo.Clone());
		success = true;
	})();

	while (!success) wait();

	return {};
});
