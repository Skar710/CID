"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix for default marker icons
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Crime {
  _id: string;
  type: string;
  location: {
    coordinates: [number, number];
  };
  date: string;
  description: string;
  status: string;
}

interface MapProps {
  crimes: Crime[];
}

export default function Map({ crimes }: MapProps) {
  return (
    <MapContainer
      center={[19.0760, 72.8777]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {crimes.map((crime) => (
        <Marker
          key={crime._id}
          position={[crime.location.coordinates[1], crime.location.coordinates[0]]}
          icon={icon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{crime.type}</h3>
              <p className="text-sm">{new Date(crime.date).toLocaleDateString()}</p>
              <p>{crime.description}</p>
              <p className="text-sm font-semibold mt-1">Status: {crime.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}