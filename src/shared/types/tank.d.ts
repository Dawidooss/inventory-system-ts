export type TankModel = Model & {
	turret: TankTurret;
	hull: Model;
};

export type TankTurret = Model & {
	Model: Model;
};

export type TankSeat = BasePart & {
	[key: string]: Animation;
};
export type TankExit = BasePart & {
	exit: Attachment;
};
export type TankGun = Model & {
	opened: BoolValue;
	main: BasePart & {
		shellCFrame: Attachment;
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
