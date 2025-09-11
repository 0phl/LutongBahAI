export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cookingTime: string
  servings: string
  difficulty: "Easy" | "Medium" | "Hard"
  imageUrl?: string
  createdAt: string
  tips?: string[]
  category?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface UserData {
  name: string
  createdAt: string
}

export type AppState = "welcome" | "chat" | "recipes" | "recipe-detail" | "recipe-collection"
