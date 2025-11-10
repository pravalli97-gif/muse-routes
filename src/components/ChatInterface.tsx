import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MapPin, Users, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TripDetails {
  destination: string | null;
  days: number | null;
  people: number | null;
  budget: string | null;
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

interface ChatInterfaceProps {
  onDestinationAdd?: (destination: string) => void;
  onItineraryGenerated?: (itinerary: ItineraryDay[]) => void;
}

const createFallbackItinerary = (details: TripDetails): ItineraryDay[] => {
  const { destination, days, budget } = details;
  const itinerary: ItineraryDay[] = [];
  
  for (let day = 1; day <= (days || 5); day++) {
    const activities = [];
    
    activities.push({
      time: "9:00 AM",
      title: `Breakfast at Local Café`,
      location: `Popular breakfast spot in ${destination}`,
      description: `Start your day with a delicious local breakfast. Try the regional specialties and enjoy fresh coffee while planning your day ahead.`,
      cost: budget === 'budget' ? '$8-15' : budget === 'luxury' ? '$25-40' : '$15-25'
    });
    
    activities.push({
      time: "11:00 AM",
      title: day === 1 ? "City Walking Tour" : `Visit Historic Landmark`,
      location: `${destination} Historic District`,
      description: `Explore the main attractions and cultural landmarks. Take your time to photograph iconic spots and learn about the rich history and culture of the area.`,
      cost: "$10-20"
    });
    
    activities.push({
      time: "1:30 PM",
      title: "Authentic Local Lunch",
      location: `Traditional restaurant in ${destination}`,
      description: `Enjoy authentic regional cuisine at a highly-rated local restaurant. Don't miss their signature dishes and ask for recommendations from locals.`,
      cost: budget === 'budget' ? '$15-25' : budget === 'luxury' ? '$50-80' : '$25-40'
    });
    
    activities.push({
      time: "3:30 PM",
      title: day % 2 === 0 ? "Museum Visit" : "Nature & Parks",
      location: `${destination} ${day % 2 === 0 ? 'Museum' : 'Park'}`,
      description: `${day % 2 === 0 ? 'Immerse yourself in local art and history at one of the city\'s premier museums.' : 'Relax in beautiful natural surroundings, perfect for photos and experiencing local life.'}`,
      cost: "$15-30"
    });
    
    if (day !== (days || 5)) {
      activities.push({
        time: "6:00 PM",
        title: "Sunset Viewpoint",
        location: `Best sunset spot in ${destination}`,
        description: `Watch the stunning sunset from one of the city's most picturesque viewpoints. A perfect way to end the day with amazing photo opportunities.`,
        cost: "Free"
      });
    }
    
    activities.push({
      time: "7:30 PM",
      title: day === (days || 5) ? "Farewell Dinner" : "Dinner Experience",
      location: `${destination} dining district`,
      description: `${day === (days || 5) ? 'Celebrate your final evening with a memorable dinner at a special restaurant.' : 'Enjoy delicious local cuisine in a vibrant atmosphere. Try multiple dishes to experience the diverse flavors.'}`,
      cost: budget === 'budget' ? '$20-35' : budget === 'luxury' ? '$80-150' : '$40-70'
    });
    
    itinerary.push({ day, activities });
  }
  
  return itinerary;
};

export const ChatInterface = ({ onDestinationAdd, onItineraryGenerated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 Tell me where you'd like to go and I'll plan an amazing trip for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    destination: null,
    days: null,
    people: null,
    budget: null
  });
  const [questionCount, setQuestionCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const extractTripDetails = (text: string): Partial<TripDetails> => {
    const extracted: Partial<TripDetails> = {};
    
    const destPatterns = [
      /(?:to|in|visit|visiting|going to|trip to|traveling to|headed to|heading to|go to)\s+([a-zA-Z\s]+)/i,
      /([a-zA-Z\s]+?)\s+(?:trip|vacation|holiday|tour)/i,
      /^([a-zA-Z\s]+)$/i,
    ];
    
    for (const pattern of destPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const destination = match[1].trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        const commonWords = ['go', 'want', 'plan', 'trip', 'travel', 'visit', 'thinking', 'going'];
        if (!commonWords.includes(destination.toLowerCase()) && destination.length > 2) {
          extracted.destination = destination;
          break;
        }
      }
    }
    
    const daysPatterns = [
      /(\d+)\s*(?:day|days)/i,
      /(?:for|about|around)\s*(\d+)\s*(?:day|days)/i,
      /week/i,
      /weekend/i,
    ];
    
    for (const pattern of daysPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (text.toLowerCase().includes('week')) extracted.days = 7;
        else if (text.toLowerCase().includes('weekend')) extracted.days = 3;
        else extracted.days = parseInt(match[1]);
        break;
      }
    }
    
    const peoplePatterns = [
      /(\d+)\s*(?:people|person|persons|travelers|pax|adults?)/i,
      /(?:group of|party of|with)\s*(\d+)/i,
      /(?:solo|alone|myself|just me)/i,
      /(?:couple|two of us|my (?:wife|husband|partner|girlfriend|boyfriend) and (?:me|i))/i,
      /family/i,
      /with my (?:wife|husband|partner|girlfriend|boyfriend)/i,
    ];
    
    for (const pattern of peoplePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (text.toLowerCase().includes('solo') || text.toLowerCase().includes('alone')) extracted.people = 1;
        else if (text.toLowerCase().includes('couple')) extracted.people = 2;
        else if (text.toLowerCase().includes('family')) extracted.people = 4;
        else extracted.people = parseInt(match[1] || '1');
        break;
      }
    }
    
    const budgetPatterns = [
      /(?:budget|spending)\s*(?:of|around|about)?\s*\$?(\d+(?:,\d+)?)/i,
      /(budget|luxury|mid-range|backpack|cheap|expensive|affordable)/i,
    ];
    
    for (const pattern of budgetPatterns) {
      const match = text.match(pattern);
      if (match) {
        const term = match[1].toLowerCase();
        if (['budget', 'cheap', 'backpack', 'affordable'].includes(term)) extracted.budget = 'budget';
        else if (['luxury', 'expensive'].includes(term)) extracted.budget = 'luxury';
        else if (term === 'mid-range') extracted.budget = 'mid-range';
        else extracted.budget = `$${match[1]}`;
        break;
      }
    }
    
    return extracted;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const extracted = extractTripDetails(userMessage);
      const updatedDetails = { ...tripDetails };
      
      if (extracted.destination && extracted.destination !== updatedDetails.destination) {
        // New destination, reset everything
        setTripDetails({
          destination: extracted.destination,
          days: extracted.days,
          people: extracted.people,
          budget: extracted.budget
        });
        setQuestionCount(0);
        if (onDestinationAdd) onDestinationAdd(extracted.destination);
      } else {
        if (extracted.days) updatedDetails.days = extracted.days;
        if (extracted.people) updatedDetails.people = extracted.people;
        if (extracted.budget) updatedDetails.budget = extracted.budget;
        setTripDetails(updatedDetails);
      }
      
      if (updatedDetails.destination) {
        const missing = [];
        if (!updatedDetails.days) missing.push('days');
        if (!updatedDetails.people) missing.push('people');
        if (!updatedDetails.budget) missing.push('budget');
        
        if (missing.length > 0 && questionCount < 2) {
          setQuestionCount(prev => prev + 1);
          const questions = {
            days: `Great choice! 🌟 How many days are you planning?`,
            people: `Awesome! ${updatedDetails.destination} is beautiful! 🎉 Just you, or traveling with someone?`,
            budget: `Love it! What's your budget style - budget-friendly, mid-range, or luxury?`
          };
          const nextQuestion = missing[0] as keyof typeof questions;
          setMessages(prev => [...prev, { role: 'assistant', content: questions[nextQuestion] }]);
          setIsLoading(false);
          return;
        }
        
        const finalDetails = {
          destination: updatedDetails.destination,
          days: updatedDetails.days || 5,
          people: updatedDetails.people || 2,
          budget: updatedDetails.budget || 'mid-range'
        };
        
        setTripDetails(finalDetails);
        
        const assumptions = [];
        if (!updatedDetails.days) assumptions.push(`${finalDetails.days} days`);
        if (!updatedDetails.people) assumptions.push(`${finalDetails.people} people`);
        if (!updatedDetails.budget) assumptions.push(`${finalDetails.budget} budget`);
        
        const assumptionsMsg = assumptions.length ? `\n\n(I'm assuming: ${assumptions.join(', ')}. Let me know if you'd like to change anything!)` : '';
        setMessages(prev => [...prev, { role: 'assistant', content: `Perfect! ✨ Creating your ${finalDetails.days}-day itinerary for ${finalDetails.destination}!${assumptionsMsg}` }]);
        
        const itinerary = createFallbackItinerary(finalDetails);
        
        if (onItineraryGenerated) onItineraryGenerated(itinerary);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sounds exciting! 🌍 Which destination are you thinking about?" }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border bg-gradient-travel">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Travel Companion
        </h2>
        <p className="text-white/90 text-sm mt-1">Your AI-powered journey planner</p>
        
        {tripDetails.destination && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className={`flex items-center gap-1 text-xs ${tripDetails.destination ? 'text-green-300' : 'text-white/50'}`}>
              {tripDetails.destination ? <CheckCircle2 className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
              <span>Destination</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${tripDetails.days ? 'text-green-300' : 'text-white/50'}`}>
              {tripDetails.days ? <CheckCircle2 className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              <span>Days</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${tripDetails.people ? 'text-green-300' : 'text-white/50'}`}>
              {tripDetails.people ? <CheckCircle2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              <span>People</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${tripDetails.budget ? 'text-green-300' : 'text-white/50'}`}>
              {tripDetails.budget ? <CheckCircle2 className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
              <span>Budget</span>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`chat-bubble flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-accent text-accent-foreground'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent text-accent-foreground rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Creating your perfect itinerary...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-muted/30">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Where do you want to go? Tell me your plans..." className="flex-1 rounded-full border-border bg-background" disabled={isLoading} />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full gradient-travel">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
