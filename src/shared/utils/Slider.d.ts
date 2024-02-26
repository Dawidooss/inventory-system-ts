import Signal from "@rbxts/signal";

export type SliderDataDictionary = {
	Start: number;
	End: number;
	Increment: number;
	DefaultValue?: number;
};

export type SliderConfig = {
	SliderData: SliderDataDictionary;
	MoveInfo: TweenInfo;
	MoveType?: "Tween" | "Instant";
	Axis?: "X" | "Y";
	Padding?: number;
	AllowBackgroundClick?: boolean;
};

export interface Slider {
	new (holder: GuiBase2d, config: SliderConfig): Slider;
	Track(): void;
	Untrack(): void;
	OverrideValue(newValue: number): void;
	OverrideIncrement(newIncrement: number): void;
	GetValue(): number;
	GetIncrement(): number;
	Destroy(): void;

	Changed: Signal<(newValue: number) => any>;
	Dragged: Signal<(newValue: number) => any>;
	Released: Signal<(newValue: number) => any>;
}

declare const Slider: Slider;

export default Slider;
