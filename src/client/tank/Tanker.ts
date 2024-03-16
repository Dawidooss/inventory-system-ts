import BezierCurve from "@rbxts/bezier";
import Maid from "@rbxts/maid";
import promiseR15 from "@rbxts/promise-character";
import { Players, RunService, UserInputService, Workspace } from "@rbxts/services";
import PromptService, { PromptInstance } from "client/PromptService";
import clientState from "client/reflex/clientState";
import { Net } from "shared/Net";
import { TankModel, TankPeriscope, TankGun } from "shared/types/tank";
import { Object } from "shared/utils/Object";
import getTagged from "shared/utils/getTagged";

const camera = Workspace.CurrentCamera!;

export default abstract class Tanker {
	public roleName: string;

	public model: TankModel;
	public maid = new Maid();
	public animations: { [key: string]: AnimationTrack } = {};

	public debounce = false;
	public cameraMovement = 0.5;
	public cameraMoveDirection?: string;
	public periscope?: TankPeriscope;

	public cameraRotationX = 0;
	public cameraRotationY = 0;

	public gun?: TankGun;

	constructor(model: TankModel, roleName: string) {
		this.model = model;
		this.roleName = roleName;

		this.maid.GiveTask(
			getTagged(this.model, "periscope", (prompt: PromptInstance & TankPeriscope) => {
				PromptService.On(prompt).Connect(async () => {
					this.Periscope(prompt);
				});
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "mg", (prompt: PromptInstance) => {
				PromptService.On(prompt).Connect(async () => {});
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "gun", (gun: TankGun) => {
				this.gun = gun;
			}),
		);

		this.maid.GiveTask(
			getTagged(this.model, "prompt", (prompt: PromptInstance) => {
				const roleRequired = prompt.GetAttribute("roleRequired");
				const roleProhibited = prompt.GetAttribute("roleProhibited");
				if (
					(roleProhibited && roleProhibited === this.roleName) ||
					(roleRequired && roleRequired !== this.roleName)
				)
					PromptService.Disable(prompt);
				else PromptService.Enable(prompt);
			}),
		);

		RunService.BindToRenderStep("tank", Enum.RenderPriority.Last.Value + 100, () => this.Update());
		this.maid.GiveTask(() => RunService.UnbindFromRenderStep("tank"));

		this.maid.GiveTask(
			UserInputService.InputBegan.Connect((input, processed) => {
				if (processed) return;
				if (input.KeyCode === Enum.KeyCode.A) this.cameraMoveDirection = "left";
				else if (input.KeyCode === Enum.KeyCode.D) this.cameraMoveDirection = "right";
			}),
		);

		this.maid.GiveTask(
			UserInputService.InputEnded.Connect((input, processed) => {
				if (processed) return;
				if (input.KeyCode === Enum.KeyCode.A && this.cameraMoveDirection === "left")
					delete this.cameraMoveDirection;
				else if (input.KeyCode === Enum.KeyCode.D && this.cameraMoveDirection === "right")
					delete this.cameraMoveDirection;
			}),
		);
	}

	public async Enter() {
		const character = await promiseR15(Players.LocalPlayer.Character!);
		const seat = this.model.FindFirstChild(`${this.roleName} Seat`, true);
		if (!seat) {
			warn(`missing seat "${this.roleName} Seat" in tank`);
			return;
		}

		if (seat.FindFirstChild("seatWeld")) {
			warn(`seat is already occupied`);
			return;
		}

		for (let anim of seat.GetChildren()) {
			if (anim.IsA("Animation")) {
				this.animations[anim.Name] = character.Humanoid.Animator.LoadAnimation(anim);
			}
		}
		clientState.setFade(1);
		wait(0.5);
		Net.events.enterTank.Client().Fire({
			tankId: this.model.Name,
			role: this.roleName,
		});

		character.Humanoid.SetStateEnabled(Enum.HumanoidStateType.Freefall, false);
		this.animations.idle.Play();
	}

	public async Periscope(periscope?: TankPeriscope) {
		if (this.debounce) return;

		this.debounce = true;
		if (periscope) {
			if (this.animations.periscope) {
				this.animations.idle.Stop(0.5);
				this.animations.periscope.Play(0.5);
				wait(0.5);
			}

			clientState.setFade(1);
			wait(0.5);
			this.periscope = periscope;
			this.cameraRotationX = 0;
			this.cameraRotationY = 0;
			clientState.setBackCallback(() => {
				this.debounce = false;
				this.Periscope();
			});
		} else {
			clientState.setFade(1);
			wait(0.5);
			if (this.animations.periscope) {
				this.animations.periscope.Stop(0.5);
				this.animations.idle.Play(0.5);
			}
			delete this.periscope;
			wait(1);
			this.debounce = false;
		}
	}

	public async Exit(): Promise<boolean> {
		clientState.setFade(1);
		wait(0.5);
		Net.events.exitTank.Client().Fire({ tankId: this.model.Name });

		Object.entries(this.animations).forEach(([, track]) => track.Stop());
		this.animations = {};

		camera.CameraType = Enum.CameraType.Custom;

		this.maid.DoCleaning();
		return true;
	}

	public async Update() {
		if (this.cameraMoveDirection === "left") this.cameraMovement -= 0.02;
		if (this.cameraMoveDirection === "right") this.cameraMovement += 0.02;
		this.cameraMovement = math.clamp(this.cameraMovement, 0, 1);

		const rmbHold = UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton2);

		UserInputService.MouseBehavior = rmbHold ? Enum.MouseBehavior.LockCurrentPosition : Enum.MouseBehavior.Default;
		UserInputService.MouseIconEnabled = !rmbHold;

		const mouseDelta = UserInputService.GetMouseDelta();
		const MouseDeltaSensitivity = UserInputService.MouseDeltaSensitivity;

		this.cameraRotationX += (mouseDelta.X / 150) * MouseDeltaSensitivity;
		this.cameraRotationY += (mouseDelta.Y / 150) * MouseDeltaSensitivity;
		this.cameraRotationY = math.clamp(this.cameraRotationY, -math.pi / 2, math.pi / 2);

		const cameraPart = this.model.FindFirstChild(`${this.roleName} Camera`, true) as BasePart & {
			left: Attachment;
			right: Attachment;
		};

		let cframe: CFrame;
		const scope =
			this.periscope &&
			((this.periscope.FindFirstChild("scope") ||
				(this.periscope.FindFirstChild("scopeRef") as ObjectValue)?.Value) as Attachment);
		if (this.periscope && scope) {
			const maxXAngle = math.rad((scope.GetAttribute("xAngle") as number) || 0);
			const maxYAngle = math.rad((scope.GetAttribute("yAngle") as number) || 0);

			const cameraPartOrientation = scope.WorldCFrame.ToOrientation();
			this.cameraRotationX = math.clamp(this.cameraRotationX, -maxXAngle, maxXAngle);
			this.cameraRotationY = math.clamp(this.cameraRotationX, -maxYAngle, maxYAngle);
			let xOrientation = cameraPartOrientation[1] - this.cameraRotationX;
			let yOrientation = cameraPartOrientation[0] - this.cameraRotationY;

			let orientation = CFrame.fromOrientation(yOrientation, xOrientation, 0);

			cframe = new CFrame(scope.WorldCFrame.Position).mul(orientation);
			camera.FieldOfView = (scope.GetAttribute("fov") as number) || 70;
		} else {
			const curve = new BezierCurve([
				cameraPart.left.WorldPosition,
				cameraPart.Position,
				cameraPart.right.WorldPosition,
			]);
			const position = curve.calculate(this.cameraMovement);

			const cameraPartOrientation = cameraPart.CFrame.ToOrientation();
			const yOrientation = math.clamp(cameraPartOrientation[0] - this.cameraRotationY, -math.pi / 2, math.pi / 2);
			const xOrientation = cameraPartOrientation[1] - this.cameraRotationX;

			cframe = new CFrame(position).mul(CFrame.fromOrientation(yOrientation, xOrientation, 0));
			camera.FieldOfView = 70;
		}
		clientState.enableVignette(!!this.periscope);

		camera.CameraType = Enum.CameraType.Scriptable;
		camera.CFrame = cframe;
	}
}
