import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet marker icons not showing up in React apps
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

const MapComponent = ({ centerLat = 40.7128, centerLng = -74.0060, markers = [], zoom = 12, height = "400px" }) => {
  return (
    <div style={{ height: height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <MapContainer center={[centerLat, centerLng]} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lng]}>
            <Popup>
              <strong>{marker.title}</strong>
              <br />{marker.description}
              <div style={{ marginTop: '0.5rem' }}>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#10B981', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Navigation size={12} /> Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
