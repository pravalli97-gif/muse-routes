import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { randomAirlines } from "@/lib/random-airlines";
import { randomAirports } from "@/lib/random-airports";
import { randomHotels } from "@/lib/random-hotels";
import { randomStreets } from "@/lib/random-streets";

const AiPriceTracker = () => {
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [flightDate, setFlightDate] = useState<Date | undefined>(new Date());
  const [flights, setFlights] = useState<any[]>([]);

  const [hotelPlace, setHotelPlace] = useState("");
  const [hotelDate, setHotelDate] = useState<Date | undefined>(new Date());
  const [hotels, setHotels] = useState<any[]>([]);

  const handleFlightSearch = () => {
    // Generate random flight data
    const generatedFlights = Array.from({ length: 10 }, (_, i) => {
      const layovers = Math.floor(Math.random() * 3);
      const layoverLocations = Array.from({ length: layovers }, () =>
        randomAirports[Math.floor(Math.random() * randomAirports.length)]
      );

      const baseDate = flightDate || new Date();
      const randomDate = new Date(baseDate);
      randomDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 7)); // 0 to 6 days after selected date

      return {
        id: i,
        name: randomAirlines[
          Math.floor(Math.random() * randomAirlines.length)
        ],
        price: Math.floor(Math.random() * 1000) + 200,
        layovers,
        layoverLocations,
        date: randomDate.toDateString(),
      };
    });

    // Sort by price
    generatedFlights.sort((a, b) => a.price - b.price);

    setFlights(generatedFlights);
  };

  const handleHotelSearch = () => {
    const generatedHotels = Array.from({ length: 5 }, (_, i) => {
      const roomTypes = ["1 Bedroom", "2 Bedroom", "Luxury", "Villa"];
      const randomRoomType =
        roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const randomStarRating = Math.floor(Math.random() * 5) + 1;
      const randomStreet =
        randomStreets[Math.floor(Math.random() * randomStreets.length)];

      const availableDates = Array.from({ length: 3 }, (_, j) => {
        const date = new Date(hotelDate || new Date());
        date.setDate(date.getDate() + Math.floor(Math.random() * 30) + j * 5);
        return date.toDateString();
      });

      return {
        id: i,
        name: randomHotels[Math.floor(Math.random() * randomHotels.length)],
        roomType: randomRoomType,
        starRating: randomStarRating,
        availableDates,
        address: `${Math.floor(Math.random() * 1000)} ${randomStreet}, ${hotelPlace}`,
      };
    });
    setHotels(generatedHotels);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Price Tracker</h1>
      <Tabs defaultValue="flights">
        <TabsList>
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
        </TabsList>
        <TabsContent value="flights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Input
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <Input
              placeholder="Current Location"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Calendar
              mode="single"
              selected={flightDate}
              onSelect={setFlightDate}
              className="rounded-md border"
            />
          </div>
          <Button onClick={handleFlightSearch} className="mt-4">
            Search Flights
          </Button>

          {flights.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 text-blue-600">Top 3 Cheapest Flights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {flights.slice(0, 3).map((flight) => (
                  <div key={flight.id} className="border p-4 rounded-lg bg-blue-50">
                    <p className="font-bold">{flight.name}</p>
                    <p>Price: ${flight.price}</p>
                    <p>Date: {flight.date}</p>
                    <p>Layovers: {flight.layovers}</p>
                    {flight.layovers > 0 && (
                      <p>
                        Layover Locations: {flight.layoverLocations.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mt-8 mb-4 text-gray-600">All Flights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {flights.slice(3).map((flight) => (
                  <div key={flight.id} className="border p-4 rounded-lg bg-gray-50">
                    <p className="font-bold">{flight.name}</p>
                    <p>Price: ${flight.price}</p>
                    <p>Date: {flight.date}</p>
                    <p>Layovers: {flight.layovers}</p>
                    {flight.layovers > 0 && (
                      <p>
                        Layover Locations: {flight.layoverLocations.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="hotels">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Input
              placeholder="Place"
              value={hotelPlace}
              onChange={(e) => setHotelPlace(e.target.value)}
            />
            <Calendar
              mode="single"
              selected={hotelDate}
              onSelect={setHotelDate}
              className="rounded-md border"
            />
          </div>
          <Button onClick={handleHotelSearch} className="mt-4">
            Search Hotels
          </Button>

          {hotels.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Hotel Suggestions</h2>
              <Tabs defaultValue={hotels[0].id}>
                <TabsList>
                  {hotels.map((hotel) => (
                    <TabsTrigger key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {hotels.map((hotel) => (
                  <TabsContent key={hotel.id} value={hotel.id}>
                    <div className="border p-4 rounded-lg mt-4">
                      <p className="font-bold">{hotel.name}</p>
                      <p>Room Type: {hotel.roomType}</p>
                      <p>Star Rating: {"⭐".repeat(hotel.starRating)}</p>
                      <p>Available Dates: {hotel.availableDates.join(", ")}</p>
                      <p>Address: {hotel.address}</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiPriceTracker;
