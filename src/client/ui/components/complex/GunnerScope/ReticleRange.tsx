import React from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { ReticleData } from "client/reflex/tankProducer";
import Line from "../../basic/Line";

type Props = {
	Position: UDim2;
	DistanceToReticle: number;
	AmmoType: string;
	Data: ReticleData;
	Elevation: number;
	MaxElevation: number;
};

export default function ReticleRange(props: Props) {
	const g = Workspace.Gravity / props.Data.Weight;

	const currentRange = (props.Data.Velocity * props.Data.Velocity * math.sin(2 * math.rad(props.Elevation))) / g;

	const anglePerStud = -0.5 * math.asin((-g * props.Data.Interval) / (props.Data.Velocity * props.Data.Velocity));
	// const studAngle = props.DistanceToReticle * math.tan(angle);
	const a = props.DistanceToReticle;
	const studAngle = math.sqrt(a * a + a * a - 2 * a * a * math.cos(anglePerStud));
	const pixelAngle = math.round(studAngle * 2500);

	return (
		<frame Position={props.Position} Size={UDim2.fromScale(0.06, 0)} Transparency={1}>
			<frame
				BackgroundTransparency={1}
				Size={UDim2.fromScale(1, 1)}
				Position={UDim2.fromOffset(0, -(currentRange / props.Data.Interval) * pixelAngle)}
			>
				<textlabel
					Position={new UDim2(0.5, 0, 0, -50)}
					Size={new UDim2(1, 0, 0, 50)}
					AnchorPoint={new Vector2(0.5, 0)}
					Text={props.AmmoType}
					TextScaled
					TextColor3={new Color3()}
					BackgroundTransparency={1}
				/>
				<frame BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
					<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
					{table
						.create(
							math.min(
								math.ceil(props.MaxElevation / math.deg(anglePerStud)),
								math.ceil(props.Data.MaxRanging / props.Data.Interval),
							),
							1,
						)
						.map((v, i) => {
							return (
								<frame Size={new UDim2(1, 0, 0, pixelAngle)} Transparency={1} LayoutOrder={i}>
									{i % 2 === 0 ? (
										<>
											<Line Start={UDim2.fromScale(0, 0)} End={UDim2.fromScale(1, 0)} />
											{i % 4 === 0 ? (
												<textlabel
													Position={UDim2.fromScale(1, 0)}
													AnchorPoint={new Vector2(0, 0.5)}
													Text={`${i * props.Data.Interval}`}
													Size={new UDim2(1, 0, 0, 10)}
													BackgroundTransparency={1}
													TextXAlignment={Enum.TextXAlignment.Left}
													TextScaled
												/>
											) : (
												<textlabel
													Position={UDim2.fromScale(0, 0)}
													TextXAlignment={Enum.TextXAlignment.Right}
													AnchorPoint={new Vector2(1, 0.5)}
													Text={`${i * props.Data.Interval}`}
													Size={new UDim2(1, 0, 0, 10)}
													BackgroundTransparency={1}
													TextScaled
												/>
											)}
										</>
									) : (
										<Line Start={UDim2.fromScale(0.2, 0)} End={UDim2.fromScale(0.8, 0)} />
									)}
								</frame>
							);
						})}
				</frame>
			</frame>
		</frame>
	);
}
