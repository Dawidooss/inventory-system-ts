import Tanker from "./Tanker";
import { UserInputService } from "@rbxts/services";
import { Net } from "shared/Net";
import { TankModel, TankPeriscope } from "shared/types/tank";

export default class Gunner extends Tanker {
	public gunRotation = 0;
	public turretRotation = 0;

	public gunVelocity = 0;
	public turretVelocity = 0;

	public gunMotor: Motor6D;
	public turretMotor: Motor6D;

	constructor(tank: TankModel) {
		super(tank, "Gunner");

		this.gunMotor = this.model.turret.Model.FindFirstChild("gunMotor", true) as Motor6D;
		this.turretMotor = this.model.hull.FindFirstChild("turretMotor", true) as Motor6D;
	}

	public async Enter() {
		await super.Enter();

		this.animations.gunCrank.Play(0, 1, 0);
		this.animations.turretRingCrank.Play(0, 1, 0);

		this.maid.GiveTask(
			UserInputService.InputBegan.Connect((input, processed) => {
				if (input.KeyCode === Enum.KeyCode.A) {
					this.turretVelocity = 1;
					this.animations.turretRingCrank.Play(0, 1, -1);
				} else if (input.KeyCode === Enum.KeyCode.D) {
					this.turretVelocity = -1;
					this.animations.turretRingCrank.Play(0, 1, 1);
				} else if (input.KeyCode === Enum.KeyCode.S) {
					this.gunVelocity = 1;
					this.animations.gunCrank.Play(0, 1, -1);
				} else if (input.KeyCode === Enum.KeyCode.W) {
					this.gunVelocity = -1;
					this.animations.gunCrank.Play(0, 1, 1);
				}
			}),
		);

		this.maid.GiveTask(
			UserInputService.InputEnded.Connect((input, processed) => {
				if (processed) return;
				if (input.KeyCode === Enum.KeyCode.A && this.turretVelocity === 1) {
					this.turretVelocity = 0;
					this.animations.turretRingCrank.Stop();
				} else if (input.KeyCode === Enum.KeyCode.D && this.turretVelocity === -1) {
					this.turretVelocity = 0;
					this.animations.turretRingCrank.Stop();
				} else if (input.KeyCode === Enum.KeyCode.S && this.gunVelocity === 1) {
					this.gunVelocity = 0;
					this.animations.gunCrank.Stop();
				} else if (input.KeyCode === Enum.KeyCode.W && this.gunVelocity === -1) {
					this.gunVelocity = 0;
					this.animations.gunCrank.Stop();
				}
			}),
		);
	}

	public override async Periscope(periscope?: TankPeriscope) {
		super.Periscope(periscope);
		if (!periscope) {
			this.gunVelocity = 0;
			this.turretVelocity = 0;
		}
	}

	public override async Update() {
		this.gunRotation = this.gunRotation + this.gunVelocity / 10;
		this.turretRotation = (this.turretRotation + this.turretVelocity / 4) % 360;

		if (this.gun) {
			this.gunRotation = math.clamp(
				this.gunRotation,
				-((this.gun.GetAttribute("elevation") as number) || 360),
				(this.gun.GetAttribute("depresion") as number) || 360,
			);
		}

		this.gunMotor.C0 = CFrame.Angles(0, 0, math.rad(this.gunRotation));
		this.turretMotor.C0 = CFrame.Angles(0, math.rad(this.turretRotation), 0);

		Net.events.tankRotation.Client().Fire({
			tankId: this.model.Name,
			gunRotation: math.floor(this.gunRotation * 5),
			turretRotation: math.floor(this.turretRotation * 5),
		});

		await super.Update();
	}
}
