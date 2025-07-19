'use server';

import { getAIStyleRecommendations, type AIStyleRecommendationInput, type AIStyleRecommendationOutput } from "@/ai/flows/ai-style-recommendation";

export async function getAIStyleRecommendationsAction(
  input: AIStyleRecommendationInput
): Promise<AIStyleRecommendationOutput> {
  // In a real app, you might add more logic here, like authentication checks.
  return getAIStyleRecommendations(input);
}
