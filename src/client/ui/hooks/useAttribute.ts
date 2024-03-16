import { useEffect, useState } from "@rbxts/react";

export default function useAttribute<T>(instance: Instance, attribute: string) {
	const [value, setValue] = useState<T | undefined>(instance.GetAttribute(attribute) as T);

	useEffect(() => {
		const conn = instance.GetAttributeChangedSignal(attribute).Connect(() => {
			setValue(instance.GetAttribute(attribute) as T);
		});
		return () => conn.Disconnect();
	}, [instance, attribute]);

	return value;
}
