import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface Destination {
  name: string;
  lat: number;
  lng: number;
}

interface TravelMapProps {
  destinations: Destination[];
}

export const TravelMap = ({ destinations }: TravelMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating map load - in production, integrate with Mapbox
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-map rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-background/90 to-transparent">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Your Journey
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {destinations.length > 0 
            ? `${destinations.length} destination${destinations.length > 1 ? 's' : ''} planned`
            : 'Start chatting to add destinations'}
        </p>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your map...</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Placeholder Map Visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-float">
                  <MapPin className="w-16 h-16 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Interactive Map Coming Soon
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Your destinations will appear here with beautiful pins and routes. 
                    Enter your Mapbox token to enable the full map experience!
                  </p>
                </div>
              </div>
            </div>

            {/* Destination Pins Preview */}
            {destinations.length > 0 && (
              <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Planned Destinations
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {destinations.map((dest, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 animate-pin-drop"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-foreground font-medium">{dest.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};
