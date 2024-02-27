import { KeyCodes, useKeyPress } from "@rbxts/pretty-react-hooks";
import { useEffect } from "@rbxts/react";

export default function useKeyOncePressed(keyCodes: KeyCodes[], callback: () => void) {
	const showInventoryKeyPressed = useKeyPress(keyCodes);
	useEffect(() => {
		if (!showInventoryKeyPressed) return;
		callback();
	}, [showInventoryKeyPressed]);
}
