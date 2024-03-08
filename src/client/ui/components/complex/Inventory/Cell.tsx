import React from "@rbxts/react";

type Props = {
	Color?: Color3;

	setCellHovering: (state: boolean) => void;
};

export default function Cell(props: Props) {
	return (
		<imagelabel
			Image={"rbxassetid://14829101701"}
			BackgroundTransparency={props.Color ? 0.5 : 1}
			BackgroundColor3={props.Color}
			BorderSizePixel={0}
			Event={{
				MouseEnter: () => {
					print("enter");
					props.setCellHovering(true);
				},
				MouseLeave: () => {
					props.setCellHovering(false);
				},
			}}
		></imagelabel>
	);
}
