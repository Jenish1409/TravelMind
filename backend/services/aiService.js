const Groq = require('groq-sdk');
const { geocodePlacesList } = require('../data/places');
const { optimizeItineraryProximity } = require('../utils/geoUtils');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'missing_key' });

/**
 * Parse natural language prompt to extract travel parameters dynamically
 */
function extractTravelParams(prompt) {
  const params = {
    destination: null,
    days: 3,
    interests: [],
    budget: null,
  };

  if (!prompt) return params;

  // Extract destination using a naive regex, but the AI will fix it if wrong
  const destMatch = prompt.match(/(?:to|for|in|visit)\s+([a-zA-Z\s]+?)(?:\s+(?:under|for|with|trip|itinerary)|$)/i);
  if (destMatch && destMatch[1].trim().length > 2) {
    params.destination = destMatch[1].trim();
  } else {
    // If not found, look for something before "trip"
    const tripMatch = prompt.match(/([a-zA-Z\s]+?)\s+trip/i);
    if (tripMatch) {
      params.destination = tripMatch[1].replace(/day|days|[0-9]+/g, '').trim();
    }
  }

  // Extract days
  const daysMatch = prompt.match(/(\d+)\s*day/i);
  if (daysMatch) params.days = parseInt(daysMatch[1]);

  // Extract budget
  const budgetMatch = prompt.match(/₹?\s*(\d+[\d,]*)/);
  if (budgetMatch) params.budget = parseInt(budgetMatch[1].replace(',', ''));

  // Extract common interests
  const interestMap = {
    beach: 'beaches', beaches: 'beaches',
    nightlife: 'nightlife', party: 'nightlife', club: 'nightlife',
    heritage: 'heritage', history: 'heritage', monument: 'heritage',
    nature: 'nature', trek: 'adventure', trekking: 'adventure',
    adventure: 'adventure', sport: 'watersports', watersport: 'watersports',
    food: 'food', cafe: 'cafes', cafes: 'cafes',
    shopping: 'shopping', culture: 'culture', relax: 'relaxation',
    wildlife: 'wildlife', temple: 'culture', museum: 'culture',
  };

  const lowerPrompt = prompt.toLowerCase();
  Object.keys(interestMap).forEach(keyword => {
    if (lowerPrompt.includes(keyword) && !params.interests.includes(interestMap[keyword])) {
      params.interests.push(interestMap[keyword]);
    }
  });

  return params;
}

/**
 * Generate fully dynamic itinerary using Groq AI.
 */
async function generateItineraryWithAI(destination, days, interests, budget, userPreferences = null) {
  const actualDest = destination || "Any interesting destination";

  const personalizationNote = userPreferences
    ? `\nUser Preferences: The user likes ${userPreferences.preferred_activities.join(', ')}. Prioritize these activities.\nAvoid: ${userPreferences.disliked_places.join(', ') || 'nothing specified'}.`
    : '';

  const systemPrompt = `You are an expert travel planner covering destinations GLOBALLY.
Your task is to create a dynamic, realistic, day-by-day travel itinerary. 
CRITICAL RULES:
1. Recommend REAL, famous tourist locations, hotels, and restaurants.
2. Return ONLY valid JSON. No markdown, no explanations.
3. Distribute places evenly across days (2-4 places per day). Include a Hotel/Accommodation recommendation.
4. For every place, provide a realistic estimated cost (in ₹ INR if in India, else local currency equivalent converted to USD or INR).
5. Always generate the requested exact JSON structure.
${personalizationNote}`;

  const userMessage = `Create a ${days}-day itinerary for ${actualDest}.
Interest areas: ${interests.join(', ') || 'general sightseeing'}.
Budget limit: ${budget ? `₹${budget}` : 'flexible'}.

Return this EXACT JSON structure (no markdown):
{
  "destination": "Exact Corrected Destination Name",
  "days": ${days},
  "budget_estimate": "Estimated total cost per person",
  "best_time_to_visit": "Month range",
  "itinerary": [
    {
      "day": 1,
      "theme": "Day theme title (e.g. Arrival & Heritage)",
      "places": [
        {
          "name": "Specific Hotel or Place Name",
          "description": "What to do or why to stay here",
          "duration": "Duration (e.g. 2 hours or Overnight)",
          "tips": "Practical tip",
          "estimated_cost": "Cost estimate (e.g. ₹200 or ₹4000/night)"
        }
      ],
      "description": "Overall day summary",
      "estimated_cost": "Total day cost"
    }
  ]
}`;

  try {
    console.log(`Generating AI itinerary for: ${actualDest}`);
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) throw new Error('Empty response from AI');

    const cleanedResponse = responseText
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    // Dynamically Geocode the places returned by AI
    console.log(`Geocoding ${parsed.destination} places via OSM Nominatim...`);
    const enrichedItinerary = [];
    for (const day of parsed.itinerary) {
      const placesWithCoords = await geocodePlacesList(day.places, parsed.destination);
      enrichedItinerary.push({
        ...day,
        places: placesWithCoords,
      });
    }

    parsed.itinerary = optimizeItineraryProximity(enrichedItinerary);

    return { success: true, data: parsed, source: 'ai_dynamic' };
  } catch (error) {
    console.error('Dynamic AI generation failed:', error.message);
    return {
      success: false,
      error: 'Failed to generate dynamic itinerary. Please try again or check your prompt.',
    };
  }
}

module.exports = { generateItineraryWithAI, extractTravelParams };
