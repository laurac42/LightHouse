// from: https://medium.com/@saraanofficial/google-maps-integration-in-next-14-13-and-react-load-display-step-by-step-guide-ab2f6ed7b3c0
import { GoogleMap, Marker } from "@react-google-maps/api";
import type { UserLocation } from "@/types/address";
import { Home } from "lucide-react";

export const defaultMapContainerStyle = {
    width: '100%',
    height: '60vh',
    borderRadius: '15px',
};

const defaultMapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: 'auto',
    mapTypeId: 'roadmap',
};
const defaultMapZoom = 14;

const MapComponent = (lat: number, lng: number, locs: UserLocation[]) => {
    const mapCenter = {
        lat: lat,
        lng: lng
    };
    console.log("Rendering map with center: ", mapCenter);

    return (
        <div className="w-full py-6 mb-12">
            <h2 className="text-2xl pb-2 font-bold">What's in the Local Area?</h2>
            {/* Home icon by Icons 8 */}
            <GoogleMap
                mapContainerStyle={defaultMapContainerStyle}
                center={mapCenter}
                zoom={defaultMapZoom}
                options={defaultMapOptions}>
                <Marker position={mapCenter} label="This Property" icon={{ url: "/images/icons8-home.svg", scaledSize: new window.google.maps.Size(32, 32), }}/>
                {locs.map((loc, index) => (
                    <Marker key={index} position={{ lat: loc.latitude, lng: loc.longitude }} label={loc.nickname} />
                ))}
            </GoogleMap>
        </div>
    )
};

export { MapComponent };