import { Workspace } from "@rbxts/services";
import getTagged from "shared/utils/getTagged";
import Tanker from "./Tanker";
import PromptService, { PromptInstance } from "client/PromptService";
import Loader from "./Loader";
import Gunner from "./Gunner";
import { Net } from "shared/Net";
import { TankModel, TankSeat } from "shared/types/tank";

export default class TankHandler {
	private static instance?: TankHandler;

	public tankIn?: TankModel;
	public role?: Tanker;

	constructor() {
		TankHandler.instance = this;

		getTagged(Workspace, "hatch", (prompt: PromptInstance & TankSeat) => {
			PromptService.On(prompt).Connect(async () => {
				let tankModel = prompt.Parent as TankModel;
				while (tankModel.Parent !== Workspace) {
					tankModel = tankModel.Parent as TankModel;
				}

				prompt.FindFirstChildOfClass("Sound")?.Play();
				this.Enter(tankModel, prompt.GetAttribute("role") as string);
			});
		});
		getTagged(
			Workspace,
			"exit",
			(
				prompt: PromptInstance & {
					exit: Attachment;
				},
			) => {
				PromptService.On(prompt).Connect(async () => {
					prompt.FindFirstChildOfClass("Sound")?.Play();
					this.Exit();
				});
			},
		);
	}

	public async Enter(tank: TankModel, role: string) {
		if (this.tankIn) {
			if (!(await this.Exit())) return;
			wait();
		}
		this.tankIn = tank;

		if (role === "Loader") this.role = new Loader(tank);
		if (role === "Gunner") this.role = new Gunner(tank);

		this.role?.Enter();
	}

	public async Exit() {
		if (!this.role) return;
		if (!(await this.role.Exit())) return;
		delete this.role;
		delete this.tankIn;
		return true;
	}

	public static Get() {
		return this.instance || new TankHandler();
	}
}
