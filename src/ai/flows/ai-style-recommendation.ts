
// This is an AI-powered style recommendation flow that suggests outfits based on user preferences and current trends.

'use server';

import ai from '@/genkit';
// import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ReviewSchema = z.object({
  id: z.string(),
  user: z.object({
    name: z.string(),
    avatarUrl: z.string().url().optional(),
  }),
  rating: z.number().min(1).max(5),
  comment: z.string(),
});

const ClothingItemSchema = z.object({
  id: z.string().describe('Unique identifier for the clothing item.'),
  name: z.string().describe('Name of the clothing item.'),
  description: z.string().describe('Detailed description of the clothing item.'),
  imageUrls: z.array(z.string()).describe('URLs of the clothing item images.'),
  category: z.enum(['top', 'bottom', 'dress', 'shoes', 'accessory', 'saree', 'kurti', 'western dress', 'baby boy', 'baby girl', 'boy dress', 'girl dress', 'cuddler dress']).describe('Category of the clothing item.'),
  availableSizes: z.array(z.string()).describe('Available sizes for the clothing item.'),
  price: z.number().describe('Price of the clothing item in INR.'),
  material: z.string().describe('The materials used to create the item'),
  careInstructions: z.string().describe('How to properly care for this item'),
  reviews: z.array(ReviewSchema).optional().describe("Customer reviews for the item.")
});

const UserPreferencesSchema = z.object({
  style: z.string().describe('Preferred style of clothing (e.g., casual, formal, bohemian).'),
  colorPreferences: z.array(z.string()).describe('Preferred colors for clothing.'),
  size: z.string().describe('Preferred clothing size (e.g., S, M, L).'),
  budget: z.number().describe('Maximum budget for an outfit in INR.'),
  occasion: z.string().describe('The occasion the outfit is for (e.g., party, work, casual).'),
  dislikedCategories: z.array(z.enum(['top', 'bottom', 'dress', 'shoes', 'accessory'])).optional().describe('Clothing categories the user dislikes.')
});

export type ClothingItem = z.infer<typeof ClothingItemSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

const AIStyleRecommendationInputSchema = z.object({
  userPreferences: UserPreferencesSchema.describe('User\s style preferences, including size, style, occasion and budget.'),
  availableClothing: z.array(ClothingItemSchema).describe('Available clothing items in the store.'),
});

export type AIStyleRecommendationInput = z.infer<typeof AIStyleRecommendationInputSchema>;

const OutfitRecommendationSchema = z.object({
  description: z.string().describe('A description of the outfit, highlighting the features that match user preferences.'),
  items: z.array(ClothingItemSchema).describe('List of clothing items recommended for the outfit.'),
  totalPrice: z.number().describe('Total price of the outfit.'),
  isAppropriate: z.boolean().describe('Whether the outfit is appropriate given the user preferences and occasion'),
});

export type OutfitRecommendation = z.infer<typeof OutfitRecommendationSchema>;

const AIStyleRecommendationOutputSchema = z.object({
  recommendations: z.array(OutfitRecommendationSchema).describe('Recommended outfits based on user preferences and current trends.'),
});

export type AIStyleRecommendationOutput = z.infer<typeof AIStyleRecommendationOutputSchema>;


export async function getAIStyleRecommendations(input: AIStyleRecommendationInput): Promise<AIStyleRecommendationOutput> {
  return aiStyleRecommendationFlow(input);
}

const outfitRecommendationPrompt = ai.definePrompt({
  name: 'outfitRecommendationPrompt',
  input: {
    schema: z.object({
      userPreferences: UserPreferencesSchema,
      availableClothing: z.array(ClothingItemSchema),
    }),
  },
  output: {schema: AIStyleRecommendationOutputSchema},
  prompt: `You are a personal stylist for Bloomtales Boutique, an e-commerce website selling women's and children's clothing in India.

  The user has provided their style preferences, and a list of available clothing items. 
  The available clothing items are:
  {{#each availableClothing}}
  - {{this.name}} ({{this.category}}): {{this.description}} - Price: ₹{{this.price}}, Sizes: {{this.availableSizes}}
  {{/each}}

  The user's preferences are:
  - Style: {{userPreferences.style}}
  - Color Preferences: {{userPreferences.colorPreferences}}
  - Size: {{userPreferences.size}}
  - Budget: ₹{{userPreferences.budget}}
  - Occasion: {{userPreferences.occasion}}

  Recommend outfits that match the user's preferences and are within their budget.

  Ensure that each outfit is coherent and stylish, and that the total price does not exceed the user's budget.
  Be very careful with your calculation of price. Ensure that the outfit is appropriate for the specified occasion.

  Do not suggest any items from these categories: {{userPreferences.dislikedCategories}}
  Return your answer as a JSON in the following format:
  {
    "recommendations": [
      {
        "description": "A description of the outfit, highlighting the features that match user preferences.",
        "items": [{"id": "the id of the item"}, ...],  // List of clothing items recommended for the outfit with all fields for each item.
        "totalPrice": 123.45,
        "isAppropriate": true,
      },
      ...
    ]
  }
  `,
});

const aiStyleRecommendationFlow = ai.defineFlow({
    name: 'aiStyleRecommendationFlow',
    inputSchema: AIStyleRecommendationInputSchema,
    outputSchema: AIStyleRecommendationOutputSchema,
  },
  async input => {
    const {output} = await outfitRecommendationPrompt(input);
    return output!;
  }
);
