const { v4: uuidv4 } = require('uuid');
const { nlpPipeline } = require('../services/nlpService');
const { buildPersonalizationContext } = require('../services/recommendationService');

/**
 * POST /api/generate-itinerary
 * Main endpoint: generates a personalized AI travel itinerary.
 */
const generateItinerary = async (req, res) => {
  try {
    const {
      userId = 'guest',
      prompt = '',
      destination: explicitDestination,
      days: explicitDays,
      interests: explicitInterests = [],
      budget: explicitBudget,
    } = req.body;

    if (!explicitDestination && !prompt) {
      return res.status(400).json({ error: 'Please provide a destination or a travel request prompt.' });
    }

    // Build personalization context from user history
    const personalization = await buildPersonalizationContext(userId, explicitInterests);

    // Call the robust NLP pipeline
    const result = await nlpPipeline(
      prompt || `Trip to ${explicitDestination} for ${explicitDays || 3} days`,
      explicitDestination,
      explicitDays,
      personalization.isPersonalized ? personalization.preferences : null
    );

    if (!result.success) {
      return res.status(422).json({ error: result.error, hint: 'Try a supported catalog destination.' });
    }

    res.json({
      ...result.data,
      meta: {
        userId,
        generated_at: new Date().toISOString(),
        source: result.source,
        personalization: {
          isPersonalized: personalization.isPersonalized,
          context: personalization.context,
          message: personalization.message || 'First-time user — generic itinerary generated.',
        },
      },
    });
  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({ error: 'Failed to generate itinerary', details: error.message });
  }
};

module.exports = { generateItinerary };
