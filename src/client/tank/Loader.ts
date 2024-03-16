import { Players } from "@rbxts/services";
import PromptService, { PromptInstance } from "client/PromptService";
import createMotor from "shared/utils/createMotor";
import getTagged from "shared/utils/getTagged";
import Tanker from "./Tanker";
import { Net } from "shared/Net";
import { TankModel, TankPeriscope } from "shared/types/tank";

export default class Loader extends Tanker {
	public ammoGrabbed?: BasePart;

	constructor(tank: TankModel) {
		super(tank, "Loader");

		this.maid.GiveTask(
			getTagged(this.model, "reload", (prompt: PromptInstance) => {
				PromptService.On(prompt).Connect(async () => {
					if (this.ammoGrabbed) this.Reload();
					else this.Unload();
				});
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "ammoSource", (prompt: PromptInstance) => {
				PromptService.On(prompt).Connect(async () => {
					if (!this.ammoGrabbed) this.GrabAmmo(prompt);
					else this.PlaceDownAmmo();
				});
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "gunHatchLever", (prompt: PromptInstance) => {
				PromptService.On(prompt).Connect(async () => {
					this.GunHatchLever();
				});
			}),
		);
	}

	public async GunHatchLever() {
		if (this.debounce) return;
		if (this.ammoGrabbed) return;

		this.debounce = true;

		this.animations.idle.Stop(0.25);

		const track = this.gun?.opened.Value ? this.animations.gunLeverDown : this.animations.gunLeverUp;
		track.Play(0.25, 2);
		track.GetMarkerReachedSignal("pull").Wait();

		Net.events.pullGunLever.Client().Fire({
			tankId: this.model.Name,
		});

		track.Stopped.Wait();
		wait(track.Length - track.TimePosition - 0.02);
		this.animations.idle.Play(0.25);

		this.debounce = false;
	}

	public async PlaceDownAmmo() {
		if (this.debounce) return;
		if (!this.ammoGrabbed) return;

		this.animations.grabAmmo.Play(0, undefined, -1);

		wait(this.animations.grabAmmo.Length * 0.985);
		Net.events.placeDownAmmo.Client().Fire({ tankId: this.model.Name });
		delete this.ammoGrabbed;
		this.animations.idle.Play(0.5);
		this.debounce = false;
	}

	public async GrabAmmo(ammo: BasePart) {
		if (this.debounce) return;
		if (this.ammoGrabbed) return;

		this.debounce = true;

		Net.functions.grabAmmo
			.Call({
				tankId: this.model.Name,
				ammoType: ammo.Name,
			})
			.After((succ) => {
				if (!succ) {
					this.debounce = false;
					return;
				}
				this.ammoGrabbed = Players.LocalPlayer.Character!.FindFirstChild("ammo") as BasePart;
				this.animations.idle.Stop(0.5);
				this.animations.grabAmmo.Play(0.5);

				this.animations.grabAmmo.Stopped.Wait();
				this.animations.grabAmmo.Play(0, undefined, 0);
				this.animations.grabAmmo.TimePosition = this.animations.grabAmmo.Length * 0.99;
				this.debounce = false;
			});
	}

	public async Unload() {
		if (!this.gun?.opened.Value) return;
		if (this.ammoGrabbed) return;
		if (!this.gun?.FindFirstChild("ammo")) return;
		this.debounce = true;

		Net.functions.unload.Call({ tankId: this.model.Name }).After((succ) => {
			if (!succ) {
				this.debounce = false;
				return;
			}
			this.ammoGrabbed = Players.LocalPlayer.Character!.FindFirstChild("ammo") as BasePart;

			this.animations.idle.Stop();
			this.animations.reload.Play(0, undefined, -1);
			task.wait(this.animations.reload.Length * 0.985);
			this.animations.grabAmmo.Play(0, undefined, 0);
			this.animations.grabAmmo.TimePosition = this.animations.grabAmmo.Length * 0.99;
			this.animations.grabAmmo.AdjustSpeed(0);
			this.debounce = false;
		});
	}

	public async Reload() {
		if (!this.ammoGrabbed) return;
		if (!this.gun?.opened.Value) return;
		if (this.gun?.FindFirstChild("ammo")) return;

		this.debounce = true;
		this.animations.grabAmmo.AdjustSpeed(1);
		this.animations.grabAmmo.Stop(0.5);
		this.animations.reload.Play(0.5);

		wait(this.animations.reload.Length * 0.985);

		Net.events.reload.Client().Fire({ tankId: this.model.Name });
		delete this.ammoGrabbed;

		this.animations.idle.Play(0.5);
		this.debounce = false;
	}
	public async Periscope(periscope?: TankPeriscope) {
		if (this.ammoGrabbed) return;
		await super.Periscope(periscope);
	}

	public override async Exit() {
		if (this.ammoGrabbed) return false;
		return await super.Exit();
	}
}
