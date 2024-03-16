import React from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import useTaggedInstances from "client/ui/hooks/useTaggedInstances";
import Prompt from "./Prompt";
import { PromptInstance } from "client/PromptService";

type Props = {};

const camera = Workspace.CurrentCamera!;

export default function Prompts(props: Props) {
	const instances = useTaggedInstances("prompt");

	const onPromptTrigger = (instance: PromptInstance) => {
		if (instance.FindFirstChild("trigger")) instance.trigger.Fire();
	};

	return (
		<>
			{instances.map((v) => (
				<Prompt
					instance={v as PromptInstance}
					onTrigger={() => {
						onPromptTrigger(v as PromptInstance);
					}}
				/>
			))}
		</>
	);
}
