export type PromptInstance = BasePart & {
	trigger: BindableEvent;
};

export default class PromptService {
	public static On(instance: PromptInstance) {
		if (instance.FindFirstChild("trigger")) return instance.trigger.Event;
		const trigger = new Instance("BindableEvent");
		trigger.Name = "trigger";
		trigger.Parent = instance;
		return trigger.Event;
	}

	public static Enable(instance: PromptInstance) {
		instance.SetAttribute("disabled", undefined);
	}

	public static Disable(instance: PromptInstance) {
		instance.SetAttribute("disabled", true);
	}
}
