import L from "leaflet";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

const rescuerIcon = new L.DivIcon({
  className: "custom-div-icon",
  html: '<div class="h-4 w-4 rounded-full border-2 border-white bg-[#3B6D11] shadow"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function RescuerMap({ rescuers, userLat, userLng }) {
  if (!rescuers?.length) {
    return null;
  }

  const center = [rescuers[0].lat, rescuers[0].lng];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom
        className="h-[200px] w-full md:h-[300px]"
      >
        <RecenterMap center={center} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {typeof userLat === "number" && typeof userLng === "number" && (
          <CircleMarker
            center={[userLat, userLng]}
            radius={8}
            pathOptions={{
              color: "#173404",
              fillColor: "#3B6D11",
              fillOpacity: 0.9,
            }}
          >
            <Popup>Your location</Popup>
          </CircleMarker>
        )}
        {rescuers.map((rescuer) => (
          <Marker
            key={rescuer._id || `${rescuer.name}-${rescuer.lat}-${rescuer.lng}`}
            position={[rescuer.lat, rescuer.lng]}
            icon={rescuerIcon}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-medium">{rescuer.name}</p>
                <p>{rescuer.address || rescuer.city}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: false });
  }, [center, map]);

  return null;
}
