import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, dosha, mealType, preferences, availableFoods } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "meal_planning") {
      systemPrompt = `You are an expert Ayurvedic nutritionist and meal planning assistant. You understand the six tastes (Rasa): sweet, sour, salty, bitter, pungent, astringent. You know about Virya (hot/cold potency), Vipaka (post-digestive effect), and the three Doshas (Vata, Pitta, Kapha).

Your role is to suggest balanced meal combinations that:
1. Include all six tastes in proper proportions
2. Balance the doshas appropriately
3. Consider digestibility and food combinations
4. Follow Ayurvedic food combining principles (avoid incompatible combinations)

Always provide practical, actionable meal suggestions with specific foods.`;

      userPrompt = `Create a balanced ${mealType || "full day"} meal plan based on Ayurvedic principles.
${dosha ? `The person has a ${dosha} constitution and needs foods that balance this dosha.` : ""}
${preferences ? `Dietary preferences: ${preferences}` : ""}

Available foods in our database:
${JSON.stringify(availableFoods?.slice(0, 30) || [], null, 2)}

Please suggest specific meal combinations using these foods where possible, explaining the Ayurvedic reasoning behind each choice. Format your response with clear meal sections and explain which tastes and doshas are being balanced.`;

    } else if (type === "dosha_recommendation") {
      systemPrompt = `You are an expert Ayurvedic nutritionist specializing in dosha-balancing dietary recommendations. You have deep knowledge of:
- The three doshas: Vata (air/space), Pitta (fire/water), Kapha (earth/water)
- How different foods affect each dosha (increase or decrease)
- The six tastes and their dosha effects
- Food qualities (hot/cold, light/heavy, dry/oily)

Provide specific, practical food recommendations that will help balance the specified dosha.`;

      userPrompt = `Recommend foods to balance ${dosha} dosha.

Here are foods from our database with their dosha effects:
${JSON.stringify(availableFoods?.slice(0, 30) || [], null, 2)}

Please:
1. Identify which foods from the list are best for balancing ${dosha}
2. Explain why these foods help balance ${dosha}
3. Suggest which foods to avoid or limit
4. Provide meal timing recommendations for this dosha
5. Include any lifestyle tips related to diet for ${dosha} balance`;
    } else {
      throw new Error("Invalid request type");
    }

    console.log(`Processing ${type} request for dosha: ${dosha}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in ayurvedic-assistant:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
