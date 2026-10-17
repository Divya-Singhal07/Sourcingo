// recommendationRoutes.ts
import { Router, Response } from 'express';
import { createUserClient } from '../lib/supabase.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { getManufacturerRecommendation, CustomerPreferences } from '../services/aiService.js';

const router = Router();

// Protect all routes here with authentication
router.use(requireAuth);

interface RecommendationRequestBody {
  customerPreferences?: CustomerPreferences;
}

router.post('/recommend', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const db = createUserClient(req.accessToken!);
    const { customerPreferences } = req.body as RecommendationRequestBody;

    // 1. Automatically fetch manufacturers and their business details from Supabase
    const { data: rawManufacturers, error: mfgError } = await db
      .from('manufacturers')
      .select(`
        business_id,
        monthly_quota,
        average_delivery_days,
        businesses (
          name,
          legal_name,
          city,
          state
        )
      `);

    if (mfgError) {
      console.error('Failed to fetch manufacturer profiles:', mfgError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Could not fetch manufacturer records from database.' 
      });
    }

    if (!rawManufacturers || rawManufacturers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No manufacturers available for recommendation.' 
      });
    }

    // 2. Automatically format and score the manufacturers based on database data
    const scoredManufacturers = rawManufacturers.map((mfg: any) => {
      const businessInfo = mfg.businesses || {};
      const companyName = businessInfo.name || businessInfo.legal_name || 'Unknown Manufacturer';

      const deliveryDays = mfg.average_delivery_days ?? 7;
      const calculatedDeliveryRate = Math.max(0.5, 1 - (deliveryDays / 30));
      const simulatedLoyaltyScore = Math.min(100, Math.max(50, 100 - (deliveryDays * 2)));

      return {
        id: mfg.business_id,
        name: companyName,
        loyaltyScore: simulatedLoyaltyScore,
        orderVolume: mfg.monthly_quota ?? 100,
        onTimeDeliveryRate: Number(calculatedDeliveryRate.toFixed(2)),
        disputeHistoryCount: 0,
        location: `${businessInfo.city || ''}, ${businessInfo.state || ''}`.trim(),
      };
    });

    // 3. Automatically feed the database-driven array into your AI Service
    const recommendation = await getManufacturerRecommendation(
      scoredManufacturers, 
      customerPreferences || { priority: 'on_time_delivery' }
    );

    // 4. Return the automated response
    return res.status(200).json({
      success: true,
      data: {
        evaluatedCount: scoredManufacturers.length,
        recommendation,
        manufacturers: scoredManufacturers
      }
    });

  } catch (error) {
    console.error('Error processing automated AI recommendation:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendation rationale.' 
    });
  }
});

export default router;