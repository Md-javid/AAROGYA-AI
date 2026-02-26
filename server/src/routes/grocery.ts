/**
 * grocery.ts — Regional Grocery Concierge Routes
 * 
 * Bridges the Nutrition Agent ↔ n8n Grocery Workflow ↔ User Cart
 * Revenue model: Affiliate links (Blinkit, Zepto, Amazon)
 */
import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { config } from '../config/env.js';

const router = express.Router();

// n8n webhook URL (set in .env)
const N8N_GROCERY_WEBHOOK = process.env.N8N_GROCERY_WEBHOOK || 'http://localhost:5678/webhook/grocery-concierge';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

// ─────────────────────────────────────────────
//  POST /api/grocery/add-to-cart
//  Called when user wants to buy ingredients
// ─────────────────────────────────────────────
router.post('/add-to-cart', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { recipe, ingredients, region, platform } = req.body;

        // Validate required fields
        if (!recipe || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: recipe, ingredients (array)'
            });
            return;
        }

        // Call the n8n Grocery Concierge workflow
        const response = await fetch(N8N_GROCERY_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': N8N_API_KEY,
            },
            body: JSON.stringify({
                userId: req.userId,
                recipe,
                ingredients,
                region: region || 'Bangalore',
                language: 'en',
                platform_preference: platform || 'blinkit',
            }),
        });

        if (!response.ok) {
            throw new Error(`n8n returned status ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error: any) {
        console.error('🛒 Grocery concierge error:', error.message);

        // Fallback: Build simple search links directly (no n8n needed)
        const { recipe, ingredients, platform } = req.body;
        const fallbackLinks = buildFallbackLinks(ingredients, platform || 'blinkit');

        res.json({
            success: true,
            fallback: true,
            recipe: recipe,
            message: `🛒 Here are your grocery links for "${recipe}"!`,
            links: fallbackLinks,
            note: 'Direct search links generated (n8n unavailable)',
        });
    }
});

// ─────────────────────────────────────────────
//  POST /api/grocery/quick-links
//  Lightweight: just returns search URLs, no n8n
// ─────────────────────────────────────────────
router.post('/quick-links', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { recipe, ingredients, platform } = req.body;

        if (!ingredients || !Array.isArray(ingredients)) {
            res.status(400).json({ success: false, error: 'Missing ingredients array' });
            return;
        }

        const links = buildFallbackLinks(ingredients, platform || 'all');

        res.json({
            success: true,
            recipe: recipe || 'Your Recipe',
            links,
            platforms: getAvailablePlatforms(),
        });
    } catch (error: any) {
        console.error('Quick links error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to generate links' });
    }
});

// ─────────────────────────────────────────────
//  GET /api/grocery/platforms
//  Returns supported grocery platforms
// ─────────────────────────────────────────────
router.get('/platforms', (_req: AuthRequest, res: Response): void => {
    res.json({ platforms: getAvailablePlatforms() });
});

// ─────────────────────────────────────────────
//  Helper: Build fallback deep links
// ─────────────────────────────────────────────
function buildFallbackLinks(
    ingredients: Array<{ name: string; quantity?: string }>,
    platform: string
) {
    const BLINKIT_TAG = process.env.BLINKIT_AFFILIATE_TAG || 'aarogya-ai';
    const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG || 'aarogyaai-21';

    return ingredients.map((item) => {
        const encoded = encodeURIComponent(item.name);
        const links: Record<string, string> = {};

        if (platform === 'all' || platform === 'blinkit') {
            links.blinkit = `https://blinkit.com/s/?q=${encoded}&ref=${BLINKIT_TAG}`;
        }
        if (platform === 'all' || platform === 'zepto') {
            links.zepto = `https://www.zeptonow.com/search?query=${encoded}&utm_source=${BLINKIT_TAG}`;
        }
        if (platform === 'all' || platform === 'amazon') {
            links.amazon = `https://www.amazon.in/s?k=${encoded}&tag=${AMAZON_TAG}`;
        }
        if (platform === 'all' || platform === 'bigbasket') {
            links.bigbasket = `https://www.bigbasket.com/ps/?q=${encoded}`;
        }

        return {
            name: item.name,
            quantity: item.quantity || '',
            ...links,
        };
    });
}

// ─────────────────────────────────────────────
//  Helper: Platform list
// ─────────────────────────────────────────────
function getAvailablePlatforms() {
    return [
        {
            id: 'blinkit',
            name: 'Blinkit',
            icon: '⚡',
            tagline: '10-minute delivery',
            regions: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'],
        },
        {
            id: 'zepto',
            name: 'Zepto',
            icon: '🚀',
            tagline: '10-minute delivery',
            regions: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'],
        },
        {
            id: 'amazon',
            name: 'Amazon Fresh',
            icon: '📦',
            tagline: 'Same-day delivery',
            regions: ['All India'],
        },
        {
            id: 'bigbasket',
            name: 'BigBasket',
            icon: '🧺',
            tagline: 'Quality groceries',
            regions: ['All India'],
        },
    ];
}

export default router;
