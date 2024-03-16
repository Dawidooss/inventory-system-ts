export type TankModel = Model & {
	turret: TankTurret;
	hull: Model;
};

export type TankTurret = Model & {
	model: Model;
	gun: TankGun;
};

export type TankScope = Model & {
	main: BasePart & {
		Motor6D: Motor6D;
	};
	reticle: BasePart;
};

export type TankSeat = BasePart & {
	[key: string]: Animation;
};
export type TankExit = BasePart & {
	exit: Attachment;
};

export type Projectile = BasePart & {
	Trail?: Trail;
};

export type TankGun = Model & {
	model: Model;
	breach: Model & {
		opened: BoolValue;
		main: BasePart & {
			shellCFrame: Attachment;
			firePoint: Attachment;
		};
		projectiles: Model & {
			[ammoType: string]: Projectile;
		};
	};
};
export type TankPeriscope = BasePart & {
	scope?: Attachment;
	scopeRef?: ObjectValue;
};
export type TankCrank = Model & {
	PrimaryPart: BasePart & {
		WeldConstraint: WeldConstraint;
	};
};
