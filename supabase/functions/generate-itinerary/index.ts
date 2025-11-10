import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, days, people, budget } = await req.json();
    
    if (!destination || !days || !people || !budget) {
      throw new Error('Missing required trip details');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create detailed itinerary prompt
    const prompt = `Create a highly detailed ${days}-day travel itinerary for ${destination} for ${people} ${people === 1 ? 'person' : 'people'} with a ${budget} budget.

For EACH day, provide 4-6 activities with the following structure:
- Specific time (e.g., 9:00 AM, 2:30 PM)
- Activity title (be specific, use actual place names)
- Exact location name (restaurant name, landmark name, neighborhood)
- Detailed description (2-3 sentences about what to do/see/experience)
- Estimated cost (if applicable)

Make the itinerary:
1. REALISTIC - actual places that exist in ${destination}
2. TIME-OPTIMIZED - activities should flow logically based on location
3. BUDGET-APPROPRIATE - match the ${budget} spending level
4. DIVERSE - mix of culture, food, nature, entertainment
5. DETAILED - specific names, not generic descriptions

Format your response as a JSON array with this exact structure:
[
  {
    "day": 1,
    "activities": [
      {
        "time": "9:00 AM",
        "title": "Breakfast at [Specific Restaurant Name]",
        "location": "[Exact Location Name and Neighborhood]",
        "description": "[Detailed 2-3 sentence description of what to expect, what to order, why it's special]",
        "cost": "$15-25 per person"
      }
    ]
  }
]

IMPORTANT: 
- Use REAL place names from ${destination}
- Be as specific as possible
- Include opening hours consideration
- Add insider tips in descriptions
- Estimate realistic costs
- Plan 4-6 activities per day covering morning, afternoon, and evening

Respond with ONLY the JSON array, no markdown, no explanation, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional travel planner who creates detailed, realistic itineraries. Always respond with valid JSON only, no markdown formatting.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let itineraryText = data.choices[0]?.message?.content || '';
    
    // Clean up the response - remove markdown code blocks if present
    itineraryText = itineraryText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON itinerary
    let itinerary;
    try {
      itinerary = JSON.parse(itineraryText);
    } catch (parseError) {
      console.error('Failed to parse itinerary JSON:', itineraryText);
      // If parsing fails, create a simple fallback itinerary
      itinerary = createFallbackItinerary(destination, days, budget);
    }
    
    // Validate and ensure structure
    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      itinerary = createFallbackItinerary(destination, days, budget);
    }

    return new Response(
      JSON.stringify({ 
        itinerary: itinerary,
        destination: destination,
        days: days,
        people: people,
        budget: budget
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Generate itinerary error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        itinerary: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fallback itinerary generator if AI fails
function createFallbackItinerary(destination: string, days: number, budget: string): any[] {
  const itinerary = [];
  
  for (let day = 1; day <= days; day++) {
    itinerary.push({
      day: day,
      activities: [
        {
          time: "9:00 AM",
          title: "Breakfast & Coffee",
          location: `Local café in ${destination}`,
          description: `Start your day with a delicious breakfast at a charming local spot. Try the regional specialties and enjoy the morning atmosphere.`,
          cost: budget === 'budget' ? '$8-15' : budget === 'luxury' ? '$25-40' : '$15-25'
        },
        {
          time: "11:00 AM",
          title: "Morning Exploration",
          location: `Historic district of ${destination}`,
          description: `Explore the main attractions and landmarks. Take your time to soak in the local culture and snap some photos at iconic spots.`,
          cost: "$10-20"
        },
        {
          time: "1:30 PM",
          title: "Lunch Experience",
          location: `Popular restaurant in ${destination}`,
          description: `Enjoy authentic local cuisine at a highly-rated restaurant. Don't miss the signature dishes that make this place famous among locals.`,
          cost: budget === 'budget' ? '$15-25' : budget === 'luxury' ? '$50-80' : '$25-40'
        },
        {
          time: "3:30 PM",
          title: "Afternoon Activity",
          location: `Cultural site in ${destination}`,
          description: `Visit museums, galleries, or natural attractions. Immerse yourself in the local culture and learn about the area's rich history.`,
          cost: "$15-30"
        },
        {
          time: "7:00 PM",
          title: "Dinner & Evening",
          location: `Dining district in ${destination}`,
          description: `Cap off your day with a memorable dinner. Choose from various restaurants offering everything from street food to fine dining.`,
          cost: budget === 'budget' ? '$20-35' : budget === 'luxury' ? '$80-150' : '$40-70'
        }
      ]
    });
  }
  
  return itinerary;
}
