import { useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


interface Destination {
  name: string;
  lat: number;
  lng: number;
  day?: number;
}

interface TravelMapProps {
  destinations: Destination[];
}

const MapController = ({ destinations }: TravelMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (destinations.length > 0) {
      const lats = destinations.map(d => d.lat).filter(lat => lat !== 0);
      const lngs = destinations.map(d => d.lng).filter(lng => lng !== 0);
      if (lats.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        map.fitBounds([[minLat, minLng], [maxLat, maxLng]]);
      }
    }
  }, [destinations, map]);

  return null;
}

export const TravelMap = ({ destinations }: TravelMapProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('destinations in TravelMap', destinations);
  }, [destinations]);

  return (
    <div className="relative w-full h-full bg-gradient-map rounded-2xl shadow-xl overflow-hidden border border-border">
      <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: "100%", width: "100%" }} whenCreated={() => setIsLoading(false)}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapController destinations={destinations} />
        {destinations.map((dest, index) => (
          dest.lat && dest.lng && (
            <Marker key={index} position={[dest.lat, dest.lng]}>
              <Popup>
                {dest.name}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
