import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, userName, regenerationCount = 0 } = await request.json()

    if (regenerationCount > 2) {
      return NextResponse.json(
        {
          error: "Maximum regeneration limit reached. You can generate a new recipe by starting a new conversation.",
        },
        { status: 429 },
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Build conversation context
    const conversationContext = chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")

    const prompt = `Based on this conversation with ${userName}, generate 1 Filipino recipe recommendation.

Conversation:
${conversationContext}

Generate exactly 1 Filipino recipe in this JSON format:
{
  "recipe": {
    "id": "unique-id",
    "name": "Recipe Name",
    "description": "Brief description (1-2 sentences)",
    "cookingTime": "30 minutes",
    "difficulty": "Easy|Medium|Hard",
    "servings": 4,
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...],
    "tips": ["tip 1", "tip 2", ...],
    "category": "Main Dish|Appetizer|Dessert|Soup|Rice Dish"
  },
  "regenerationCount": ${regenerationCount}
}

Requirements:
- Recipe must be an authentic Filipino dish
- Base recommendation on ingredients/preferences mentioned in conversation
- Include detailed cooking instructions (5-8 steps)
- Provide helpful cooking tips
- Use common Filipino ingredients
- Ensure recipe is practical and achievable

Return only valid JSON, no additional text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let content = response.text()

    // Clean up the response to ensure valid JSON
    content = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    try {
      const parsedResponse = JSON.parse(content)
      return NextResponse.json(parsedResponse)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({
        recipe: {
          id: "adobo-classic",
          name: "Classic Chicken Adobo",
          description: "The most iconic Filipino dish with tender chicken in savory soy-vinegar sauce.",
          cookingTime: "45 minutes",
          difficulty: "Easy",
          servings: 4,
          ingredients: [
            "2 lbs chicken pieces",
            "1/2 cup soy sauce",
            "1/4 cup white vinegar",
            "6 cloves garlic, minced",
            "2 bay leaves",
            "1 tsp black peppercorns",
            "2 tbsp cooking oil",
          ],
          instructions: [
            "Marinate chicken in soy sauce and vinegar for 30 minutes",
            "Heat oil in a pan and brown the chicken pieces",
            "Add garlic and sauté until fragrant",
            "Pour in the marinade, add bay leaves and peppercorns",
            "Simmer for 30-40 minutes until chicken is tender",
            "Adjust seasoning and serve with rice",
          ],
          tips: [
            "Don't stir immediately after adding vinegar to avoid bitter taste",
            "Use native vinegar for more authentic flavor",
          ],
          category: "Main Dish",
        },
        regenerationCount: regenerationCount,
      })
    }
  } catch (error) {
    console.error("Recipe generation error:", error)
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 })
  }
}
