import React from "react";

export function VerticalList(props) {
	return (
		<div>
			{(props.children.length, 2 ? props.children : props.children.map((child) => child))}
		</div>
	);
}
