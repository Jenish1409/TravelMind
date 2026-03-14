const Groq = require('groq-sdk');
const Hotel = require('../models/Hotel');
const Activity = require('../models/Activity');
const Event = require('../models/Event');
const { optimizeItineraryProximity, validateCoordinatesWithinRadius } = require('../utils/geoUtils');
const { geocodePlacesList } = require('../data/places');

// Dynamic import for transformers (CommonJS syntax workaround)
let pipeline;

async function loadTransformers() {
    if (!pipeline) {
        const transformers = await import('@xenova/transformers');
        pipeline = transformers.pipeline;
    }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'missing_key' });

/**
 * PART 1: USER QUERY UNDERSTANDING
 * Extracts structured parameters from natural language prompt
 */
async function extractTravelParamsNLP(prompt) {
    const systemPrompt = `You are a strict data extraction tool for a travel agency. Extract the following from the user's travel request into JSON format:
{
  "destination": "Name of the city or region (string). Examples: Goa, Jaipur, Manali, Mumbai, Delhi",
  "days": "Number of days (integer, usually 1 to 14)",
  "budget": "Budget string (e.g. 'budget', 'luxury', '10000', or null)",
  "interests": ["keyword1", "keyword2"]
}
If destination or days cannot be found, use reasonable defaults (e.g. destination: null, days: 3). Return ONLY valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
    });

    let responseText = completion.choices[0]?.message?.content?.trim();
    responseText = responseText.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();

    try {
        const parsed = JSON.parse(responseText);
        console.log('[NLP Phase 1] Extracted Params:', parsed);
        return parsed;
    } catch (err) {
        console.error('[NLP Phase 1] Failed to parse params:', responseText);
        return { destination: null, days: 3, budget: null, interests: [] };
    }
}

/**
 * PART 3: SEMANTIC MATCHING
 * Ranks items using @xenova/transformers embeddings and manual cosine similarity
 */
async function getTopItemsSemantically(items, queryStr, topK) {
    if (!items || items.length === 0) return [];
    if (!queryStr || queryStr.trim() === '') return items.slice(0, Math.min(topK, items.length));

    await loadTransformers();
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });

    const queryEmb = await extractor(queryStr, { pooling: 'mean', normalize: true });
    const queryVec = Array.from(queryEmb.data);

    const scoredItems = [];
    for (const item of items) {
        const textToEmbed = `${item.name}. ${item.category ? item.category.join(' ') : ''} ${item.description || ''}`;
        const itemEmb = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
        const itemVec = Array.from(itemEmb.data);

        // Cosine similarity calc
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < queryVec.length; i++) {
            dotProduct += queryVec[i] * itemVec[i];
            normA += queryVec[i] * queryVec[i];
            normB += itemVec[i] * itemVec[i];
        }
        const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

        scoredItems.push({ item, sim });
    }

    scoredItems.sort((a, b) => b.sim - a.sim);
    return scoredItems.slice(0, topK).map(si => si.item);
}

/**
 * MAIN PIPELINE
 */
async function nlpPipeline(prompt, explicitDestination = null, explicitDays = null, userPreferences = null) {
    console.log('[NLP DEBUG] Starting pipeline for prompt:', prompt);

    // Phase 1: Query Extraction
    let params = await extractTravelParamsNLP(prompt);

    // Merge explicit details UI form passes directly or user history
    if (explicitDestination) params.destination = explicitDestination;
    if (explicitDays) params.days = explicitDays;
    if (userPreferences?.preferred_activities?.length) {
        params.interests = [...new Set([...params.interests, ...userPreferences.preferred_activities])];
    }

    const dest = params.destination;
    if (!dest) {
        return { success: false, error: 'Could not determine destination from your request.' };
    }

    const cityFilter = dest.toLowerCase();

    // Phase 2 + Phase 5: Database Retrieval & Validation
    const [hotels, activities, events] = await Promise.all([
        Hotel.find({ city: cityFilter }),
        Activity.find({ city: cityFilter }),
        Event.find({ city: cityFilter })
    ]);

    const totalFound = hotels.length + activities.length + events.length;
    console.log(`[NLP DEBUG] Found ${totalFound} items in local DB for destination: ${cityFilter}`);

    // Phase 3: Semantic Match (Only if we have local data)
    let contextData = { hotels: [], activities: [], events: [] };

    if (totalFound > 0) {
        const queryStr = params.interests.join(' ');
        console.log(`[NLP DEBUG] Running semantic search for interests: "${queryStr}"`);

        const topHotels = await getTopItemsSemantically(hotels, queryStr, 5);
        const topActivities = await getTopItemsSemantically(activities, queryStr, Math.min(30, activities.length));
        const topEvents = await getTopItemsSemantically(events, queryStr, Math.min(10, events.length));

        console.log(`[NLP DEBUG] Semantic filtering complete. Retained: ${topHotels.length} hotels, ${topActivities.length} activities, ${topEvents.length} events.`);

        contextData = {
            hotels: topHotels.map(h => ({ name: h.name, price: h.priceRange, description: h.description, amenities: h.amenities })),
            activities: topActivities.map(a => ({ name: a.name, category: a.category, price: a.price, description: a.description, duration: a.duration })),
            events: topEvents.map(e => ({ name: e.name, category: e.category, price: e.price, description: e.description }))
        };
    }

    // Phase 4 + Phase 6 + Phase 9: Prompt Constraints & Itinerary Logic
    const systemPrompt = `You are a strictly constrained professional travel planner capable of planning trips ANYWHERE IN THE WORLD.
CRITICAL RULES:
1. If "AvailableData" is provided, you MUST highly prioritize using those places.
2. If "AvailableData" is empty, generate REAL, FAMOUS tourist locations for the requested destination. NEVER invent fake places.
3. Max 4 activities per day.
4. Respect travel schedule: Morning (sightseeing) -> Afternoon (activities) -> Evening (nightlife/events).
5. Return ONLY valid JSON exactly matching the requested structure.
6. Include at least 1 Hotel recommendation in the itinerary (e.g. Day 1 arrival).`;

    const userMessage = `User Request: Destination: ${params.destination}, Days: ${params.days}, Interests: ${params.interests.join(', ')}, Budget: ${params.budget}

AvailableData (Local Catalog):
${totalFound > 0 ? JSON.stringify(contextData, null, 2) : 'No local data for this destination. Please generate from your global real-world knowledge.'}

Generate a realistic schedule JSON. Structure:
{
  "destination": "${params.destination}",
  "days": ${params.days},
  "budget_estimate": "Replace with the actual calculated total cost numeric string (e.g. ₹25000)",
  "best_time_to_visit": "Replace with the actual best months to visit",
  "itinerary": [
    {
      "day": 1,
      "theme": "Day theme",
      "places": [
        {
          "name": "Exact Place Name",
          "description": "Brief context",
          "duration": "Duration (e.g. 2 hours)",
          "tips": "Tip",
          "estimated_cost": "Cost snippet (e.g. ₹500)"
        }
      ],
      "description": "Summary",
      "estimated_cost": "Replace with numeric day cost snippet"
    }
  ]
}`;

    console.log(`[NLP DEBUG] Sending strictly grounded prompt to LLM...`);
    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        temperature: 0.1, // very low temp for strictness
        max_tokens: 4000
    });

    let responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) throw new Error('Empty response from LLM');

    let cleanedResponse = responseText.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();
    let parsedItinerary;
    try {
        parsedItinerary = JSON.parse(cleanedResponse);
    } catch (err) {
        throw new Error('Failed to parse final itinerary JSON');
    }

    // Phase 7 + Phase 8: Location Consistency & Coordinate Validation via OpenStreetMap
    let invalidCount = 0;
    const finalItinerary = [];

    // We maintain a quick lookup so we don't query OSM for known DB items
    const allDbItems = [];
    if (totalFound > 0) {
        allDbItems.push(...hotels, ...activities, ...events);
    }

    console.log(`[NLP DEBUG] Validating and geocoding generated places...`);
    for (const day of parsedItinerary.itinerary || []) {

        // Ensure the LLM didn't drop days
        if (!day.places || day.places.length === 0) continue;

        const processedPlaces = [];
        for (const place of day.places) {
            // Check if it's already in our local DB
            const dbMatch = allDbItems.find(item => item.name.toLowerCase().includes(place.name.toLowerCase()) || place.name.toLowerCase().includes(item.name.toLowerCase()));

            if (dbMatch && dbMatch.coordinates?.lat) {
                processedPlaces.push({ ...place, coordinates: dbMatch.coordinates });
            } else {
                // Otherwise ask OSM
                const geo = await geocodePlacesList([place], dest);
                if (geo.length > 0 && geo[0].coordinates) {
                    processedPlaces.push({ ...place, coordinates: geo[0].coordinates });
                } else {
                    // OSM is very strict with strings like "Solang Valley Paragliding". 
                    // Instead of dropping real activities and destroying the itinerary, we keep them but skip coordinate validation.
                    console.log(`[NLP DEBUG] OSM couldn't find precise coordinates for: ${place.name}. Keeping place without map marker.`);
                    processedPlaces.push({ ...place, coordinates: null });
                }
            }
        }

        if (processedPlaces.length > 0) {
            // PART 8: Map Coordinate Validation (Checks for geographic outliers > 150km for places that DO have coordinates)
            const spatiallyValidatedPlaces = validateCoordinatesWithinRadius(processedPlaces);
            if (spatiallyValidatedPlaces.length < processedPlaces.length) {
                console.log(`[NLP DEBUG] Validation REJECTED ${processedPlaces.length - spatiallyValidatedPlaces.length} geographic outliers.`);
                invalidCount += (processedPlaces.length - spatiallyValidatedPlaces.length);
            }

            finalItinerary.push({
                ...day,
                places: spatiallyValidatedPlaces
            });
        }
    }

    console.log(`[NLP DEBUG] Location Consistency Validation complete. Removed ${invalidCount} hallucinated places.`);
    parsedItinerary.itinerary = finalItinerary;

    // Final Proximity Optimization layer (reduces travel time)
    parsedItinerary.itinerary = optimizeItineraryProximity(parsedItinerary.itinerary);

    return { success: true, data: parsedItinerary, source: 'ai_nlp_pipeline' };
}

module.exports = { nlpPipeline };
