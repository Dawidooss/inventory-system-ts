import ReactRoblox, { createRoot } from "@rbxts/react-roblox";
import { ReplicatedFirst, UserInputService, Workspace } from "@rbxts/services";
import clientState from "client/reflex/clientState";
import GunnerReticleRouter from "client/ui/components/complex/GunnerScope/GunnerReticleRouter";
import { Net } from "shared/Net";
import { Projectile, TankModel, TankPeriscope, TankScope } from "shared/types/tank";
import getTagged from "shared/utils/getTagged";
import Tanker from "./Tanker";
import { lerp } from "@rbxts/pretty-react-hooks";
import { Object } from "shared/utils/Object";
import { ReticleData } from "client/reflex/tankProducer";

const camera = Workspace.CurrentCamera!;

const MAX_SCOPE_RANGE = 2500;
const MAX_GUN_VELOCITY = 1;
const MAX_TURRET_VELOCITY = 1;

export default class Gunner extends Tanker {
	public gunRotation = 0;
	public turretRotation = 0;

	public gunVelocity = 0;
	public turretVelocity = 0;

	public gunMouseVelocity = 0;
	public turretMouseVelocity = 0;

	public targetScopeRange = 0;
	public scopeRange = 0;
	public scopeElevation = 0;

	public gunMotor: Motor6D;
	public gunMotorC0: CFrame;
	public turretMotor: Motor6D;
	public turretMotorC0: CFrame;

	public scope?: TankScope;
	public reticle?: ReactRoblox.Root;

	constructor(tank: TankModel) {
		super(tank, "Gunner");

		this.gunMotor = this.model.turret.FindFirstChild("gunMotor", true) as Motor6D;
		this.gunMotorC0 = this.gunMotor.C0;
		this.turretMotor = this.model.hull.FindFirstChild("turretMotor", true) as Motor6D;
		this.turretMotorC0 = this.turretMotor.C0;
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
				} else if (input.KeyCode === Enum.KeyCode.F) {
					this.Fire();
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

		this.maid.GiveTask(
			UserInputService.InputChanged.Connect((input, processed) => {
				if (processed) return;
				this.targetScopeRange += input.Position.Z * 100;
				this.targetScopeRange = math.clamp(this.targetScopeRange, 0, MAX_SCOPE_RANGE);
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "reticle", (scope: TankScope) => {
				if (!this.scope) {
					this.scope = scope;

					const surfaceGui = new Instance("SurfaceGui");
					surfaceGui.Parent = scope.reticle;
					surfaceGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
					surfaceGui.PixelsPerStud = 2500;
					surfaceGui.LightInfluence = 1;

					this.reticle = createRoot(surfaceGui);
					this.reticle.render(GunnerReticleRouter());
				}
			}),
		);

		this.maid.GiveTask(() => {
			this.reticle?.unmount();
		});
	}

	public override async Periscope(periscope?: TankPeriscope) {
		await super.Periscope(periscope);

		getTagged(this.model, "hideInPeriscope", (v: BasePart) => {
			v.Transparency = periscope ? 1 : 0;
		})();

		if (!periscope) {
			this.gunVelocity = 0;
			this.turretVelocity = 0;
		}
	}

	public override async Update() {
		const finalGunVelocity = math.clamp(
			this.gunVelocity + this.gunMouseVelocity,
			-MAX_GUN_VELOCITY,
			MAX_TURRET_VELOCITY,
		);
		const finalTurretVelocity = math.clamp(
			this.turretVelocity + this.turretMouseVelocity,
			-MAX_TURRET_VELOCITY,
			MAX_TURRET_VELOCITY,
		);

		if (this.gun && this.gun.FindFirstChild("ammo") && !this.gun.breach.opened.Value) {
			const ammoType = this.gun.FindFirstChild("ammo")!.GetAttribute("ammoType") as string;
			const projectile = this.gun.breach.projectiles[ammoType];
			const g = Workspace.Gravity / projectile.GetMass();
			const v = projectile.GetAttribute("velocity") as number;
			this.scopeElevation = math.deg(0.5 * math.asin((-g * this.scopeRange) / (v * v)));
		} else {
			this.scopeElevation = 0;
		}

		if (this.scope) this.scope.main.Motor6D.C1 = CFrame.Angles(0, 0, -math.rad(this.scopeElevation));

		this.scopeRange = lerp(this.scopeRange, this.targetScopeRange, 0.2);
		this.gunRotation = this.gunRotation + finalGunVelocity / 10;
		this.turretRotation = (this.turretRotation + finalTurretVelocity / 4) % 360;

		const depresion = (this.gun?.GetAttribute("depresion") as number) || 0;
		const elevation = (this.gun?.GetAttribute("elevation") as number) || 0;

		this.gunRotation = math.clamp(this.gunRotation, -elevation, depresion);

		// const rangefinderParams = new RaycastParams();
		// rangefinderParams.FilterDescendantsInstances = [this.model];
		// rangefinderParams.FilterType = Enum.RaycastFilterType.Exclude;

		// const rangefinderResult = Workspace.Raycast(
		// 	camera.CFrame.Position,
		// 	camera.CFrame.LookVector.mul(10000),
		// 	rangefinderParams,
		// );
		// if (result) print(result.Position.sub(camera.CFrame.Position).Magnitude);

		const finalGunElevation = this.gunRotation + this.scopeElevation;

		this.gunRotation = math.clamp(
			this.gunRotation,
			-(this.gun?.GetAttribute("elevation") as number) || 0,
			(this.gun?.GetAttribute("depresion") as number) || 0,
		);

		Net.events.tankRotation.Client().Fire({
			tankId: this.model.Name,
			gunRotation: math.floor(finalGunElevation * 20),
			turretRotation: math.floor(this.turretRotation * 20),
		});

		this.gunMotor.C0 = this.gunMotorC0.Lerp(CFrame.Angles(0, 0, math.rad(finalGunElevation)), 0.2);
		this.turretMotor.C0 = this.turretMotorC0.Lerp(CFrame.Angles(0, math.rad(this.turretRotation), 0), 0.2);

		this.gunMotorC0 = this.gunMotor.C0;
		this.turretMotorC0 = this.turretMotor.C0;

		if (this.reticle && this.scope && this.gun) {
			const distanceToReticle = Workspace.CurrentCamera!.CFrame.Position.sub(
				this.scope.reticle.Position,
			).Magnitude;

			const ammoTypes: { [ammoType: string]: ReticleData } = {};
			if (this.gun.FindFirstChild("ammo") && !this.gun.breach.opened.Value) {
				const ammoType = this.gun.FindFirstChild("ammo")!.GetAttribute("ammoType") as string;
				const projectile = this.gun.breach.projectiles[ammoType];
				ammoTypes[ammoType] = {
					MaxDistance: MAX_SCOPE_RANGE,
					Velocity: projectile.GetAttribute("velocity") as number,
					Weight: projectile.GetMass(),
				};
			}

			clientState.setReticle({
				DistanceToReticle: distanceToReticle,
				Elevation: this.scopeRange,
				AmmoTypes: ammoTypes,
			});
		}

		await super.Update();
	}

	protected override async UpdateCameraRotation(x: number, y: number) {
		if (this.periscope) {
			this.gunMouseVelocity = y * 4;
			this.turretMouseVelocity = -x * 4;
		} else {
			super.UpdateCameraRotation(x, y);
		}
	}

	public Fire() {
		const ammoInGun = this.gun?.FindFirstChild("ammo") as BasePart;
		if (!ammoInGun) return;

		this.debounce = true;

		Net.events.fireTank.Client().Fire({ tankId: this.model.Name });

		wait(0.25);
		this.debounce = false;
	}
}
