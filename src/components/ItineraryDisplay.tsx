import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Clock, DollarSign } from "lucide-react";

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

interface ItineraryDisplayProps {
  itinerary: ItineraryDay[];
}

const getDayColor = (day: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-green-500 to-green-600',
      'from-teal-500 to-teal-600',
      'from-indigo-500 to-indigo-600',
    ];
    return colors[(day - 1) % colors.length];
  };

export const ItineraryDisplay = ({ itinerary }: ItineraryDisplayProps) => {
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-card rounded-2xl shadow-xl border border-border">
        <div className="text-center">
          <p className="text-muted-foreground">Your itinerary will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <Tabs defaultValue={`day-${itinerary[0].day}`} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          {itinerary.map((day) => (
            <TabsTrigger key={day.day} value={`day-${day.day}`}>Day {day.day}</TabsTrigger>
          ))}
        </TabsList>
        {itinerary.map((day) => (
          <TabsContent key={day.day} value={`day-${day.day}`} className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getDayColor(day.day)} text-white font-semibold shadow-lg`}>
                    <Clock className="w-4 h-4" />
                    Day {day.day}
                  </div>
                  
                  <div className="space-y-3">
                    {day.activities.map((activity, actIdx) => (
                      <div
                        key={actIdx}
                        className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-primary">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </div>
                          {activity.cost && (
                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              {activity.cost}
                            </div>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-foreground mb-1 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{activity.title}</span>
                        </h4>
                        
                        <p className="text-xs text-muted-foreground mb-2 ml-6">
                          {activity.location}
                        </p>
                        
                        <p className="text-sm text-foreground/80 leading-relaxed ml-6">
                          {activity.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
