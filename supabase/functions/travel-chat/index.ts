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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for travel planning
    const systemPrompt = `You are an enthusiastic and knowledgeable AI travel companion. Your role is to:
- Help users discover amazing destinations worldwide
- Provide personalized travel recommendations
- Suggest attractions, restaurants, and accommodations
- Share insider tips and local insights
- Be conversational, warm, and encouraging
- Keep responses concise but informative (2-3 sentences typically)
- Use emojis occasionally to add personality 🌍✈️
- When discussing specific destinations, be specific about location names

Always maintain an excited, friendly tone while being genuinely helpful. Think of yourself as the user's well-traveled friend who loves sharing travel experiences.`;

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

    // Extract destination if mentioned (simple keyword extraction)
    let destination = null;
    const destinationKeywords = ['visit', 'go to', 'travel to', 'explore', 'see'];
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    for (const keyword of destinationKeywords) {
      if (lastUserMessage.includes(keyword)) {
        const words = lastUserMessage.split(' ');
        const keywordIndex = words.findIndex((w: string) => w.includes(keyword.split(' ')[0]));
        if (keywordIndex >= 0 && keywordIndex < words.length - 1) {
          destination = words.slice(keywordIndex + 1, keywordIndex + 3).join(' ')
            .replace(/[.,!?]/g, '');
          break;
        }
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
