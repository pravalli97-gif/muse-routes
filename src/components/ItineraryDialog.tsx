import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";

export interface ItineraryDay {
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

interface ItineraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: ItineraryDay[] | null;
  place: string;
}

export const ItineraryDialog = ({ isOpen, onClose, itinerary, place }: ItineraryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-4/5">
        <DialogHeader>
          <DialogTitle>Itinerary for {place}</DialogTitle>
          <DialogDescription>
            Here is a sample itinerary for your trip to {place}.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full overflow-y-auto">
          {itinerary ? (
            <ItineraryDisplay itinerary={itinerary} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Loading itinerary...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
