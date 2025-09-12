import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory, userName } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Build conversation context
    const conversationContext = chatHistory
      .slice(-10) // Keep last 10 messages for context
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n")

    const prompt = `You are Lutong BahAI, a friendly Filipino recipe assistant chatbot. You help users discover Filipino dishes based on their available ingredients, preferences, and cravings.

User's name: ${userName}

Conversation history:
${conversationContext}

Current user message: ${message}

Guidelines:
- Be conversational and friendly
- Ask about ingredients, cooking preferences, dietary restrictions
- Suggest Filipino dishes when appropriate
- When the user seems ready to cook (has discussed ingredients/preferences), suggest generating a recipe
- Keep responses concise but helpful
- Use Filipino food knowledge extensively

Respond naturally to continue the conversation. If you think the user is ready to generate a recipe based on the conversation, end your response with the exact phrase: "[GENERATE_RECIPE_READY]"`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    // Check if AI suggests recipe generation
    const shouldShowGenerateButton = content.includes("[GENERATE_RECIPE_READY]")
    const cleanContent = content.replace("[GENERATE_RECIPE_READY]", "").trim()

    return NextResponse.json({
      content: cleanContent,
      shouldShowGenerateButton,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
