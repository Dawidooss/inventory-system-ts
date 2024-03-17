import Maid from "@rbxts/maid";
import { Debris, ReplicatedFirst, TweenService, Workspace } from "@rbxts/services";
import { TankCrank, TankExit, TankGun, TankModel, TankSeat } from "shared/types/tank";
import FastCast from "shared/utils/FastCast";
import { Object } from "shared/utils/Object";
import createMotor from "shared/utils/createMotor";
import getTagged from "shared/utils/getTagged";
import weld from "shared/utils/weld";

const createMotorAt = (cframe: CFrame): [BasePart, BasePart, Motor6D] => {
	const part0 = new Instance("Part");
	part0.Transparency = 1;
	part0.Size = new Vector3(1, 1, 1);
	part0.CanCollide = false;
	part0.Anchored = true;
	part0.CFrame = cframe;

	const part1 = part0.Clone();

	const motor = new Instance("Motor6D");
	motor.Parent = part0;
	motor.Part0 = part0;
	motor.Part1 = part1;

	return [part0, part1, motor];
};

export default class Tank {
	public id: string;
	public model: TankModel;
	public tankers: { [roleName: string]: Player } = {};

	public gunAnimations: { [trackName: string]: AnimationTrack } = {};

	public gun?: TankGun;
	public turretRingCrank?: TankCrank;
	public gunCrank?: TankCrank;
	public gunMotor?: Motor6D;
	public breachMotor?: Motor6D;
	public turretMotor?: Motor6D;

	public gunRotation = 0;
	public turretRotation = 0;

	protected caster = new FastCast();
	protected maid = new Maid();

	constructor(model: TankModel) {
		this.model = model;
		this.id = model.Name;

		this.maid.GiveTask(
			getTagged(this.model, "gun", (gun: TankGun) => {
				this.gun = gun;
				const [gunRingPart0, gunRingPart1, gunRingMotor] = createMotorAt(gun.GetPivot());
				gunRingPart0.Parent = this.model.turret.model;
				gunRingPart1.Parent = gun.model;
				gunRingMotor.Name = "gunMotor";
				this.gunMotor = gunRingMotor;

				const [breachPart0, breachPart1, breachMotor] = createMotorAt(gun.GetPivot());
				breachPart0.Parent = gun.breach;
				breachPart1.Parent = gun.model;
				breachMotor.Name = "breachMotor";
				this.breachMotor = breachMotor;

				weld(this.gun.model, undefined, true, true);
				weld(this.gun.breach, undefined, true, true);

				const animController = gun.breach.FindFirstChildOfClass("AnimationController")!;
				for (let v of gun.breach.GetChildren()) {
					if (v.IsA("Animation")) {
						const track = animController.LoadAnimation(v);
						this.gunAnimations[track.Name] = track;
					}
				}
				this.gunAnimations.gunHatch.Play(0, undefined, 0);
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "turretRingCrank", (crank: TankCrank) => {
				if (this.turretRingCrank) return;
				this.turretRingCrank = crank;
			}),
		);
		this.maid.GiveTask(
			getTagged(this.model, "gunCrank", (crank: TankCrank) => {
				if (this.gunCrank) return;
				this.gunCrank = crank;
			}),
		);

		const [turretRingPart0, turretRingPart1, turretRingMotor] = createMotorAt(this.model.turret.GetPivot());
		turretRingPart0.Parent = this.model.hull;
		turretRingPart1.Parent = this.model.turret.model;
		turretRingMotor.Name = "turretMotor";
		this.turretMotor = turretRingMotor;

		weld(this.model.turret.model, undefined, true, true);
		weld(this.model.hull, undefined, true, true);

		this.caster.LengthChanged.Connect(
			(activeCast, lastPoint, rayDir, displacement, segmentVelocity, cosmeticBulletObject) => {
				// activeCast.AddVelocity()

				const projectile = cosmeticBulletObject as BasePart;
				if (projectile) {
					const position = lastPoint.add(rayDir.mul(displacement));

					const cframe = new CFrame(position, position.add(rayDir)).mul(CFrame.Angles(0, math.pi / 2, 0));
					TweenService.Create(projectile, new TweenInfo(0.05), {
						CFrame: cframe,
					}).Play();
				}
			},
		);

		this.caster.CastTerminating.Connect((activeCast) => {
			const explosionEffect = ReplicatedFirst.FindFirstChild("explosionEffect")!.Clone() as BasePart;
			explosionEffect.Parent = Workspace;
			explosionEffect.Position = activeCast.GetPosition();
			Debris.AddItem(explosionEffect, 0.3);

			activeCast.RayInfo.CosmeticBulletObject?.Destroy();
		});
		this.caster.RayHit.Connect(() => {});
	}

	public Enter(player: Player, roleName: string) {
		if (this.tankers[roleName]) return;

		const seat = this.model.FindFirstChild(`${roleName} Seat`, true) as TankSeat;
		if (!seat) return;

		seat.FindFirstChild("seatWeld")?.Destroy();

		const character = player.Character;
		if (!character) return;

		character.PivotTo(seat.GetPivot());
		(character.FindFirstChild("Humanoid") as Humanoid).WalkSpeed = 0;
		(character.FindFirstChild("Humanoid") as Humanoid).JumpPower = 0;

		const seatWeld = new Instance("WeldConstraint");
		seatWeld.Name = "seatWeld";
		seatWeld.Parent = seat;
		seatWeld.Part0 = character.PrimaryPart;
		seatWeld.Part1 = seat;

		const x = new Instance("NoCollisionConstraint");
		x.Parent = seat;
		x.Part0 = character.PrimaryPart;
		x.Part1 = seat;

		if (roleName === "Gunner") {
			if (this.turretRingCrank) {
				const playerTurretRingCrank = this.turretRingCrank.Clone();
				playerTurretRingCrank.Parent = character;
				playerTurretRingCrank.PrimaryPart.FindFirstChild("WeldConstraint")?.Destroy();
				const playerTurretRingCrankMotor = createMotor(
					character.FindFirstChild("HumanoidRootPart") as BasePart,
					playerTurretRingCrank.PrimaryPart!,
				);
				playerTurretRingCrankMotor.Name = "turretRingCrank";

				this.turretRingCrank
					.GetChildren()
					.filter((v) => v.IsA("BasePart"))
					.forEach((v) => ((v as BasePart).Transparency = 1));
			}
			if (this.gunCrank) {
				const playerGunCrank = this.gunCrank.Clone();
				playerGunCrank.Parent = character;
				playerGunCrank.PrimaryPart.FindFirstChild("WeldConstraint")?.Destroy();
				const playerGunCrankMotor = createMotor(
					character.FindFirstChild("HumanoidRootPart") as BasePart,
					playerGunCrank.PrimaryPart!,
				);
				playerGunCrankMotor.Name = "gunCrank";

				this.gunCrank
					.GetChildren()
					.filter((v) => v.IsA("BasePart"))
					.forEach((v) => ((v as BasePart).Transparency = 1));
			}
		}

		this.tankers[roleName] = player;
	}

	public Exit(player: Player) {
		const [roleName] = Object.entries(this.tankers).find(([roleName, playerCheck]) => player === playerCheck) || [];
		if (!roleName) return;

		const exit = this.model.FindFirstChild(`${roleName} Exit`, true) as TankExit;
		const seat = this.model.FindFirstChild(`${roleName} Seat`, true) as TankSeat;
		if (!exit) return;

		const character = player.Character;
		if (!character) return;

		(character.FindFirstChild("Humanoid") as Humanoid).WalkSpeed = 16;
		(character.FindFirstChild("Humanoid") as Humanoid).JumpPower = 50;

		if (roleName === "Gunner") {
			this.gunCrank
				?.GetChildren()
				.filter((v) => v.IsA("BasePart"))
				.forEach((v) => ((v as BasePart).Transparency = 0));
			this.turretRingCrank
				?.GetChildren()
				.filter((v) => v.IsA("BasePart"))
				.forEach((v) => ((v as BasePart).Transparency = 0));
		}

		character.FindFirstChild("gunCrank")?.Destroy();
		character.FindFirstChild("turretRingCrank")?.Destroy();

		seat?.FindFirstChild("seatWeld")?.Destroy();
		wait();

		character.FindFirstChild("ammo")?.Destroy();
		character.PivotTo(exit.exit.WorldCFrame);

		delete this.tankers[roleName];
	}

	public GrabAmmo(ammo: BasePart) {
		const loader = this.tankers.Loader;

		// ammo is in chamber
		if (ammo.Parent === this.gun && this.gun) {
			(this.gun.FindFirstChild("reloadSound", true) as Sound)?.Play();
		}

		return new Promise<void>((resolve) => {
			// getTagged(this.model, "ammoSource", (ammo: BasePart) => {
			// if (ammo.Name !== ammoType) return;
			ammo.FindFirstChildOfClass("Motor6D")?.Destroy();
			ammo.FindFirstChildOfClass("WeldConstraint")?.Destroy();
			getTagged(this.model, "ammoPivot", (pivot: BasePart) => {
				ammo.RemoveTag("prompt");
				ammo.Anchored = false;
				ammo.CanCollide = false;
				ammo.Parent = loader.Character;
				ammo.SetAttribute("ammoType", ammo.Name);
				ammo.Name = "ammo";
				ammo.Transparency = 0;

				const ammoWeld = createMotor(
					loader.Character!.FindFirstChild("HumanoidRootPart") as BasePart,
					ammo,
					pivot.CFrame,
				);
				ammoWeld.Parent = ammo;
				ammoWeld.Name = "ammo";

				resolve();
			})();
			// })();
		});
	}

	public ToggleGunHatch() {
		if (!this.gun) return;

		this.gun.breach.opened.Value = !this.gun.breach.opened.Value;

		(this.gun.FindFirstChild("gunHatchLeverSound", true) as Sound)?.Play();
		if (!this.gun.breach.opened.Value) {
			this.gunAnimations.gunHatch.Play(0, 1, -1);
			this.gunAnimations.gunHatch.Stopped.Wait();
			this.gunAnimations.gunHatch.Play(0, 1, 0);
			this.gunAnimations.gunHatch.TimePosition = 0;
		} else {
			this.gunAnimations.gunHatch.Play();
			this.gunAnimations.gunHatch.Stopped.Wait();
			this.gunAnimations.gunHatch.Play(0, 1, 0);
			this.gunAnimations.gunHatch.TimePosition = this.gunAnimations.gunHatch.Length - 0.000001;
		}
	}

	public PlaceDownAmmo() {
		const loader = this.tankers.Loader;
		if (!loader) return;

		loader.Character!.FindFirstChild("ammo")?.Destroy();
	}

	public Reload() {
		if (!this.gun) return;

		(this.gun.FindFirstChild("reloadSound", true) as Sound)?.Play();

		const loader = this.tankers.Loader;
		const ammo = loader.Character!.FindFirstChild("ammo") as BasePart;

		const weld = new Instance("WeldConstraint");
		ammo.FindFirstChildOfClass("Motor6D")?.Destroy();
		ammo.Parent = this.gun;
		ammo.CFrame = this.gun.breach.main.shellCFrame.WorldCFrame;
		weld.Part0 = ammo;
		weld.Part1 = this.gun.breach.main;
		weld.Parent = ammo;
	}

	public SetRotation(turretRotation: number, gunRotation: number) {
		this.turretRotation = turretRotation;
		this.gunRotation = gunRotation;

		if (this.gunMotor) this.gunMotor.C0 = CFrame.Angles(0, 0, math.rad(this.gunRotation));
		if (this.turretMotor) this.turretMotor.C0 = CFrame.Angles(0, math.rad(this.turretRotation), 0);
	}

	public Fire() {
		if (!this.gun) return;
		if (this.gun.breach.opened.Value) return;
		const ammo = this.gun.FindFirstChild("ammo") as BasePart;
		if (!ammo) return;

		// doesn't work idk why (it's because player is welded to tank
		this.gun.breach.main.ApplyImpulseAtPosition(
			this.gun.breach.main.firePoint.WorldCFrame.LookVector.mul(-500000),
			this.gun.breach.main.firePoint.WorldPosition,
		);

		this.gun.breach.main.firePoint
			.GetChildren()
			.filter((v) => v.IsA("ParticleEmitter"))
			.forEach(async (v) => {
				(v as ParticleEmitter).Enabled = true;
				wait(0.2);
				(v as ParticleEmitter).Enabled = false;
			});

		this.gun.breach.main.firePoint.FindFirstChildOfClass("Sound")?.Play();

		task.spawn(() => {
			if (this.breachMotor) {
				TweenService.Create(this.breachMotor, new TweenInfo(0.1, Enum.EasingStyle.Sine), {
					C0: new CFrame(-1.5, 0, 0),
				}).Play();
				wait(0.15);
				TweenService.Create(this.breachMotor, new TweenInfo(1.5, Enum.EasingStyle.Sine), {
					C0: new CFrame(0, 0, 0),
				}).Play();
			}
		});

		const ammoType = ammo.GetAttribute("ammoType") as string;
		// const ammoType = "APCR";
		const projectile = this.gun.breach.projectiles[ammoType].Clone();
		if (projectile.Trail) projectile.Trail.Enabled = true;
		projectile.FindFirstChildOfClass("WeldConstraint")?.Destroy();
		projectile.Transparency = 0;
		projectile.Anchored = true;

		const behavior = FastCast.newBehavior();
		behavior.Acceleration = new Vector3(0, -Workspace.Gravity / projectile.GetMass(), 0);
		behavior.AutoIgnoreContainer = true;
		behavior.CosmeticBulletTemplate = projectile;
		behavior.CosmeticBulletContainer = this.model;
		behavior.CanPierceFunction = () => {
			return false;
		};

		const params = new RaycastParams();
		params.FilterDescendantsInstances = [this.model];
		params.IgnoreWater = true;
		params.FilterType = Enum.RaycastFilterType.Exclude;

		behavior.RaycastParams = params;
		behavior.MaxDistance = 10000;

		this.caster.Fire(
			this.gun.breach.main.firePoint.WorldPosition,
			this.gun.breach.main.firePoint.WorldCFrame.LookVector.mul(10000),
			projectile.GetAttribute("velocity") as number,
			behavior,
		);

		// ammo.Destroy();
	}
}
