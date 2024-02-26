import { MutableRefObject, useEffect, useState } from "@rbxts/react";
import Slider, { SliderConfig } from "shared/utils/Slider";

export default function useSlider(sliderRef: MutableRefObject<any>, config: SliderConfig) {
	const [slider, setSlider] = useState<typeof Slider>();

	useEffect(() => {
		if (sliderRef.current) {
			const slider = new Slider(sliderRef.current, config);
			setSlider(slider);
		}
		return () => {
			slider?.Destroy();
			setSlider(undefined);
		};
	}, []);

	return slider;
}
