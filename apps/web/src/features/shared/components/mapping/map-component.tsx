"use client";

import { Map } from "./map";

type MyMapProps = React.ComponentProps<typeof Map> & {
	userId?: string;
	initialCategoryId?: string;
	initialSubcategoryId?: string;
};

export function MyMap({
	userId,
	initialCategoryId,
	initialSubcategoryId,
	...mapProps
}: MyMapProps) {
	void userId;
	void initialCategoryId;
	void initialSubcategoryId;

	return <Map {...mapProps} center={mapProps.center ?? [77.209, 28.6139]} zoom={mapProps.zoom ?? 11} />;
}