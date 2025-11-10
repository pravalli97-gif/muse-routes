import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { TravelMap } from '@/components/TravelMap';
import { ItineraryDisplay } from '@/components/ItineraryDisplay';
import { Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cityCoordinates } from '@/lib/geocode';

interface Destination {
  name: string;
  lat: number;
  lng: number;
  day?: number;
}

interface ItineraryDay {
  day: number;
  activities: {
    time: string;
    title: string;
    description: string;
    location: string;
    cost?: string;
    lat?: number;
    lng?: number;
  }[];
}

const Index = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const handleDestinationAdd = (destinationName: string) => {
    if (!destinationName) return;
    
    // Avoid duplicates
    const exists = destinations.some(d => 
      d.name.toLowerCase() === destinationName.toLowerCase()
    );
    
    if (!exists) {
      const newDestination: Destination = {
        name: destinationName,
        lat: 0,
        lng: 0
      };
      setDestinations(prev => [...prev, newDestination]);
      console.log('Added destination:', destinationName);
    }
  };

  const handleItineraryGenerated = async (generatedItinerary: ItineraryDay[]) => {
    setItinerary(generatedItinerary);
    
    // Extract unique locations from itinerary and add to map
    const locations: Destination[] = [];
    const locationMap = new Map<string, { day: number, location: string }>();
    
    for (const day of generatedItinerary) {
      for (const activity of day.activities) {
        if (activity.location && !locationMap.has(activity.location)) {
          locationMap.set(activity.location, {
            day: day.day,
            location: activity.location
          });
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(activity.location)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
              locations.push({
                name: activity.location,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                day: day.day
              });
            } else {
              // Fallback to random coordinates if location not found
              locations.push({
                name: activity.location,
                lat: Math.random() * 180 - 90,
                lng: Math.random() * 360 - 180,
                day: day.day
              });
            }
          } catch (error) {
            console.error('Error fetching coordinates:', error);
            // Fallback to random coordinates on error
            locations.push({
              name: activity.location,
              lat: Math.random() * 180 - 90,
              lng: Math.random() * 360 - 180,
              day: day.day
            });
          }
        }
      }
    }
    
    setDestinations(locations);
    console.log('Itinerary generated with locations:', locations);
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden py-6 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 gradient-travel opacity-10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-travel flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-travel-teal to-travel-orange bg-clip-text text-transparent">
                  AI Travel Companion
                </h1>
                <p className="text-sm text-muted-foreground">Your intelligent journey planner</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Chat Section */}
          <div className="h-full">
            <ChatInterface 
              onDestinationAdd={handleDestinationAdd}
              onItineraryGenerated={handleItineraryGenerated}
            />
          </div>

          {/* Right Section */}
          <div className="h-full">
            <Tabs defaultValue="map" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map">Map</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              </TabsList>
              <TabsContent value="map" className="flex-1 overflow-y-auto">
                <TravelMap destinations={destinations} itinerary={itinerary} />
              </TabsContent>
              <TabsContent value="itinerary" className="flex-1 overflow-y-auto">
                <ItineraryDisplay itinerary={itinerary} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default Index;