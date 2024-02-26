import React from "@rbxts/react";

type Props = {
	Color?: Color3;
};

export default function Cell(props: Props) {
	return (
		<imagelabel
			Image={"rbxassetid://14829101701"}
			BackgroundTransparency={props.Color ? 0.5 : 1}
			BackgroundColor3={props.Color}
			BorderSizePixel={0}
		></imagelabel>
	);
}
