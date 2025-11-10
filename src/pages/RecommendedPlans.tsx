import { useState } from "react";
import { randomPlaces } from "@/lib/random-places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItineraryDialog } from "@/components/ItineraryDialog";
import { ItineraryDay } from "@/components/ItineraryDialog";
import { randomHotels } from "@/lib/random-hotels";
import { randomPois } from "@/lib/random-pois";
import { randomBeaches } from "@/lib/random-beaches";
import { randomTreks } from "@/lib/random-treks";
import { randomStreets } from "@/lib/random-streets";
import { randomMonuments } from "@/lib/random-monuments";

const RecommendedPlans = () => {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateRandomItinerary = async (place: string) => {
    setSelectedPlace(place);
    setIsDialogOpen(true);
    setItinerary(null);

    const days = Math.floor(Math.random() * 5) + 3; // 3 to 7 days
    const generatedItinerary: ItineraryDay[] = [];
    const allPois = [...randomPois, ...randomBeaches, ...randomTreks, ...randomStreets, ...randomMonuments];

    try {
      for (let day = 1; day <= days; day++) {
        const activities = [];
        const hotel = randomHotels[Math.floor(Math.random() * randomHotels.length)];
        activities.push({
          time: "Check-in",
          title: `Stay at ${hotel}`,
          description: `Enjoy your stay at the luxurious ${hotel}.`,
          location: place,
        });

        for (let i = 0; i < 3; i++) {
          const poi = allPois[Math.floor(Math.random() * allPois.length)];
          activities.push({
            time: `${Math.floor(Math.random() * 12) + 1}:00 ${
              Math.random() > 0.5 ? "AM" : "PM"
            }`,
            title: `Visit ${poi}`,
            description: `Explore the wonders of ${poi}.`,
            location: place,
          });
        }
        generatedItinerary.push({ day, activities });
      }
      setItinerary(generatedItinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recommended Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {randomPlaces.map((place, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => generateRandomItinerary(place)}
          >
            <CardHeader>
              <CardTitle>{place}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={`https://source.unsplash.com/400x300/?${encodeURIComponent(
                  place
                )}`}
                alt={place}
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <ItineraryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        itinerary={itinerary}
        place={selectedPlace || ""}
      />
    </div>
  );
};

export default RecommendedPlans;
