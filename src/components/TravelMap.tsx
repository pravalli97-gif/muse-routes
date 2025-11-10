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
              <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-xl">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Planned Destinations
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {destinations.map((dest, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-travel/10 border border-primary/20 animate-pin-drop hover:bg-gradient-travel/20 transition-all"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-10 h-10 rounded-full gradient-travel flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-foreground font-semibold block">{dest.name}</span>
                        <span className="text-xs text-muted-foreground">Destination {index + 1}</span>
                      </div>
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Visual pins on the map area */}
            {destinations.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-full max-w-2xl h-full max-h-96">
                  {destinations.map((dest, index) => {
                    // Create a circular layout for pins
                    const angle = (index / destinations.length) * 2 * Math.PI;
                    const radius = 120;
                    const x = 50 + Math.cos(angle) * radius / 3;
                    const y = 50 + Math.sin(angle) * radius / 3;
                    
                    return (
                      <div
                        key={index}
                        className="absolute animate-pin-drop"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          animationDelay: `${index * 0.15}s`
                        }}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full gradient-travel flex items-center justify-center text-white font-bold shadow-2xl border-4 border-white animate-pulse">
                            {index + 1}
                          </div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-border shadow-lg">
                            {dest.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
