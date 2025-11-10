import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TripDetails {
  destination: string | null;
  days: number | null;
  people: number | null;
  budget: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tripDetails } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Enhanced system prompt with trip details context
    const currentDetails = tripDetails as TripDetails || {};
    const detailsContext = currentDetails.destination || currentDetails.days || currentDetails.people || currentDetails.budget
      ? `\n\nCurrent trip details collected:
${currentDetails.destination ? `- Destination: ${currentDetails.destination}` : ''}
${currentDetails.days ? `- Duration: ${currentDetails.days} days` : ''}
${currentDetails.people ? `- Travelers: ${currentDetails.people} ${currentDetails.people === 1 ? 'person' : 'people'}` : ''}
${currentDetails.budget ? `- Budget: ${currentDetails.budget}` : ''}

Keep track of what information we already have and don't ask for it again.`
      : '';

    const systemPrompt = `You are an enthusiastic and knowledgeable AI travel companion. Your role is to:
- Help users plan amazing trips by collecting essential information
- Ask follow-up questions naturally when details are missing
- Provide personalized travel recommendations and insights
- Be conversational, warm, and encouraging
- Keep responses concise (2-3 sentences) unless providing detailed information
- Use emojis occasionally to add personality 🌍✈️
- When users provide trip details, acknowledge them warmly

Essential trip details to collect (if not already provided):
1. Destination - Where they want to go
2. Duration - How many days
3. Number of travelers - How many people
4. Budget - Budget range (budget/mid-range/luxury or specific amount)${detailsContext}

Be natural in your conversation. Don't list all questions at once - ask one at a time based on what's missing.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            message: "I'm getting a lot of questions right now! Please try again in a moment. ⏳"
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            message: "I need a quick recharge! The workspace needs more AI credits. 🔋"
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 
      "I apologize, but I couldn't process that. Could you rephrase your question?";

    // Enhanced destination extraction - looks for place names and trip mentions
    let destination = null;
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // Common patterns for destination mentions
    const patterns = [
      /(?:trip to|visit|travel to|go to|explore|plan.*?to|heading to|flying to)\s+([a-z\s]+?)(?:\s|$|,|\.|\?)/i,
      /(?:in|around)\s+([a-z\s]{3,})(?:\s|$|,|\.|\?)/i,
    ];
    
    for (const pattern of patterns) {
      const match = messages[messages.length - 1]?.content.match(pattern);
      if (match && match[1]) {
        // Clean up the destination name
        destination = match[1].trim()
          .split(/\s+/)
          .slice(0, 3) // Max 3 words
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        console.log('Detected destination:', destination);
        break;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        destination: destination
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Travel chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        message: "Oops! I encountered a hiccup. Let's try that again! 🔄",
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
