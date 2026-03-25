"use client";

import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, MarkerPopup } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Clock, ExternalLink, MapPin, Navigation, Star } from "lucide-react";
import { Button } from "./ui/button";

type MapHelper = {
    id: string;
    userId: string;
    name: string;
    category: string;
    lat: number;
    lng: number;
    rating: number;
    completedJobs: number;
    price: number;
    availability: "online" | "offline" | "busy";
};

export function MyMap() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [draggableMarker, setDraggableMarker] = useState({ lng: -73.9851, lat: 40.75 });

    // Updated dummyHelpers with more fields for demonstration
    const dummyHelpers: MapHelper[] = [
        {
            id: "1",
            userId: "u1",
            name: "Ravi",
            category: "Plumber",
            lat: 32.7087,
            lng: 77.5233,
            rating: 4.5,
            completedJobs: 120,
            price: 200,
            availability: "online",
        },
        {
            id: "2",
            userId: "u2",
            name: "Sita",
            category: "Electrician",
            lat: 28.7041,
            lng: 77.1025,
            rating: 4.0,
            completedJobs: 80,
            price: 150,
            availability: "busy",
        },
        {
            id: "3",
            userId: "u3",
            name: "Gopal",
            category: "Carpenter",
            lat: 31.709,
            lng: 76.526,
            rating: 4.8,
            completedJobs: 200,
            price: 250,
            availability: "offline",
        },
    ];

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setDraggableMarker({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    }, []);

    if (!location) {
        return <div>Loading map...</div>;
    }

    return (
        <Card className="h-80 p-0 overflow-hidden">
            <Map
                center={[location.lng, location.lat]}
                zoom={14}
                styles={{
                    light: "https://tiles.openfreemap.org/styles/liberty",
                    dark: "https://tiles.openfreemap.org/styles/liberty",
                }}
            >
                <MapControls
                    position="bottom-right"
                    showZoom
                    showCompass
                    showLocate
                    showFullscreen
                />

                <MapMarker
                    draggable
                    longitude={draggableMarker.lng}
                    latitude={draggableMarker.lat}
                    onDragEnd={(lngLat) => {
                        setDraggableMarker({ lng: lngLat.lng, lat: lngLat.lat });
                    }}
                >
                    <MarkerContent>
                        <div className="cursor-move">
                            <MapPin
                                className="fill-black stroke-white dark:fill-white"
                                size={28}
                            />
                        </div>
                    </MarkerContent>
                    <MarkerPopup>
                        <div className="space-y-1">
                            <p className="font-medium text-foreground">Your Location</p>
                            <p className="text-xs text-muted-foreground">
                                {draggableMarker.lat.toFixed(4)}, {draggableMarker.lng.toFixed(4)}
                            </p>
                        </div>
                    </MarkerPopup>
                </MapMarker>

                {dummyHelpers.map((helper) => (
                    <MapMarker key={helper.id} longitude={helper.lng} latitude={helper.lat}>
                        <MarkerContent>
                            <div
                                className={`size-5 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform
                                    ${helper.availability === "online" ? "bg-green-500" : helper.availability === "busy" ? "bg-yellow-500" : "bg-gray-400"}
                                `}
                            />
                            <MarkerLabel position="bottom">{helper.name}</MarkerLabel>
                        </MarkerContent>
                        <MarkerPopup className="p-0 w-64">
                            <div className="space-y-2 p-3">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {helper.category}
                                    </span>
                                    <h3 className="font-semibold text-foreground leading-tight">
                                        {helper.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                        <span className="font-medium">{helper.rating}</span>
                                        <span className="text-muted-foreground">
                                            ({helper.completedJobs} jobs)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600">
                                        <span className="text-xs">
                                            {helper.availability.charAt(0).toUpperCase() + helper.availability.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="size-3.5" />
                                    <span>₹{helper.price} / job</span>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button size="sm" className="flex-1 h-8">
                                        <Navigation className="size-3.5 mr-1.5" />
                                        Directions
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8">
                                        <ExternalLink className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}
            </Map>
        </Card>
    );
}
