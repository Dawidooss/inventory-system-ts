import Red from "shared/utils/Networking/Red";
import { Sedes } from "shared/utils/Networking/Sedes";

export namespace Net {
	export const serializers = {};
	export const events = {
		enterTank: Red.Event("enterTank", new Sedes.Serializer({ tankId: Sedes.ToString(), role: Sedes.ToString() })),
		pullGunLever: Red.Event("pullGunLever", new Sedes.Serializer({ tankId: Sedes.ToString() })),
		placeDownAmmo: Red.Event("placeDownAmmo", new Sedes.Serializer({ tankId: Sedes.ToString() })),
		reload: Red.Event("reload", new Sedes.Serializer({ tankId: Sedes.ToString() })),
		exitTank: Red.Event("exitTank", new Sedes.Serializer({ tankId: Sedes.ToString() })),
		fireTank: Red.Event("fireTank", new Sedes.Serializer({ tankId: Sedes.ToString() })),
		tankRotation: Red.Event(
			"tankRotation",
			new Sedes.Serializer({
				tankId: Sedes.ToString(),
				gunRotation: Sedes.ToSigned(20),
				turretRotation: Sedes.ToSigned(20),
			}),
		),
	};
	export const functions = {
		grabAmmo: Red.Function(
			"grabAmmo",
			new Sedes.Serializer({ tankId: Sedes.ToString(), ammoType: Sedes.ToString() }),
			Sedes.NoSerializer,
		),
		unload: Red.Function("unload", new Sedes.Serializer({ tankId: Sedes.ToString() }), Sedes.NoSerializer),
	};
}
