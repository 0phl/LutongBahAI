"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage, type Recipe, type ChatSession } from "@/lib/storage"
import { ArrowLeft, Clock, Users, ChefHat, Sparkles, RotateCcw, Timer } from "lucide-react"
import { CookingTimer } from "@/components/cooking-timer"

interface RecipeGridProps {
  onRecipeSelect: (recipe: Recipe) => void
  onBackToChat: () => void
  userName: string
  currentSession: ChatSession | null
}

export function RecipeGrid({ onRecipeSelect, onBackToChat, userName, currentSession }: RecipeGridProps) {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTimerOpen, setIsTimerOpen] = useState(false)

  const MAX_REGENERATIONS = 2

  useEffect(() => {
    loadCurrentRecipe()
  }, [currentSession?.id]) // Re-run when session changes

  const loadCurrentRecipe = async () => {
    try {
      // If we have a current session, always generate a fresh recipe based on the conversation
      if (currentSession && currentSession.messages.length > 1) {
        await generateNewRecipe()
      } else {
        // Fallback: load existing recipes if no current session (e.g., accessing directly)
        const savedRecipes = await storage.getRecipes()
        if (savedRecipes.length === 0) {
          // Generate initial recipe if none exist
          await generateNewRecipe()
        } else {
          const latestRecipe = savedRecipes[savedRecipes.length - 1]
          setCurrentRecipe(latestRecipe)
          // Get regeneration count from localStorage or default to 0
          const storedCount = localStorage.getItem(`regeneration-${latestRecipe.id}`)
          setRegenerationCount(storedCount ? Number.parseInt(storedCount) : 0)
        }
      }
    } catch (error) {
      console.error("Failed to load recipe:", error)
      setError("Failed to load recipe")
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewRecipe = async (isRegeneration = false) => {
    setIsGenerating(true)
    setError(null)

    try {
      const currentCount = isRegeneration ? regenerationCount + 1 : 0

      if (currentCount > MAX_REGENERATIONS) {
        setError("Maximum regeneration limit reached. Start a new conversation to generate more recipes.")
        return
      }

      const newRecipe = await generateRecipeFromChat(userName, currentSession, currentCount)

      // Save recipe to storage
      await storage.saveRecipe(newRecipe)

      setCurrentRecipe(newRecipe)
      setRegenerationCount(currentCount)

      localStorage.setItem(`regeneration-${newRecipe.id}`, currentCount.toString())
    } catch (error: any) {
      console.error("Failed to generate recipe:", error)
      if (error.message.includes("Maximum regeneration limit")) {
        setError("Maximum regeneration limit reached. Start a new conversation to generate more recipes.")
      } else {
        setError("Failed to generate recipe. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    generateNewRecipe(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading your recipe...</p>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {regenerationCount > 0 ? "Regenerating Your Recipe" : "Generating Your Recipe"}
            </h2>
            <p className="text-sm text-muted-foreground text-pretty">
              I'm creating a personalized Filipino recipe based on our conversation...
            </p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBackToChat}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Your Recipe</h1>
                <p className="text-xs text-muted-foreground">Personalized for {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTimerOpen(!isTimerOpen)}
                className={`gap-2 ${isTimerOpen ? "bg-green-50 border-green-600" : ""}`}
              >
                <Timer className="w-4 h-4" />
                <span className="hidden sm:inline">Timer</span>
              </Button>
              {regenerationCount < MAX_REGENERATIONS && currentRecipe && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="gap-2 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate ({MAX_REGENERATIONS - regenerationCount} left)
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Recipe Display */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {error ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onBackToChat}>Back to Chat</Button>
          </div>
        ) : !currentRecipe ? (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No recipe yet</h2>
            <p className="text-muted-foreground mb-4">Start chatting to generate your first recipe!</p>
            <Button onClick={onBackToChat}>Back to Chat</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
              onClick={() => onRecipeSelect(currentRecipe)}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border flex items-center justify-center">
                {currentRecipe.imageUrl ? (
                  <img
                    src={currentRecipe.imageUrl || "/placeholder.svg"}
                    alt={currentRecipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ChefHat className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">{currentRecipe.title}</p>
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">{currentRecipe.title}</CardTitle>
                <CardDescription className="text-base text-pretty">{currentRecipe.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentRecipe.cookingTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{currentRecipe.servings}</span>
                  </div>
                  <Badge variant="secondary">{currentRecipe.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRecipe.ingredients.slice(0, 5).map((ingredient, index) => (
                    <Badge key={index} variant="outline">
                      {ingredient}
                    </Badge>
                  ))}
                  {currentRecipe.ingredients.length > 5 && (
                    <Badge variant="outline">+{currentRecipe.ingredients.length - 5} more</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {regenerationCount >= MAX_REGENERATIONS && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-orange-800">Regeneration limit reached</p>
                      <p className="text-sm text-orange-600">Start a new conversation to generate more recipes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <CookingTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
    </div>
  )
}

async function generateRecipeFromChat(userName: string, currentSession: ChatSession | null, regenerationCount = 0): Promise<Recipe> {
  try {
    // Get chat history for context - use current session messages if available, fallback to storage
    const chatHistory = currentSession?.messages || await storage.getChatHistory()

    // Generate recipe first
    const recipeResponse = await fetch("/api/recipes/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatHistory,
        userName,
        regenerationCount,
      }),
    })

    if (!recipeResponse.ok) {
      const errorData = await recipeResponse.json()
      throw new Error(errorData.error || "Failed to generate recipe")
    }

    const recipeData = await recipeResponse.json()

    // Generate image in parallel (don't wait for it to complete recipe generation)
    const imagePromise = fetch("/api/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeName: recipeData.recipe.name,
        description: recipeData.recipe.description,
      }),
    }).then(response => response.json()).catch(error => {
      console.warn("Image generation failed:", error)
      return { imageUrl: "/placeholder.svg" } // Fallback
    })

    // Wait for image generation to complete
    const imageData = await imagePromise

    const recipe: Recipe = {
      id: recipeData.recipe.id,
      title: recipeData.recipe.name,
      description: recipeData.recipe.description,
      ingredients: recipeData.recipe.ingredients,
      instructions: recipeData.recipe.instructions,
      cookingTime: recipeData.recipe.cookingTime,
      servings: `${recipeData.recipe.servings} servings`,
      difficulty: recipeData.recipe.difficulty,
      createdAt: new Date().toISOString(),
      ...(recipeData.recipe.tips && { tips: recipeData.recipe.tips }),
      ...(recipeData.recipe.category && { category: recipeData.recipe.category }),
      ...(imageData.imageUrl && { imageUrl: imageData.imageUrl }),
    }

    return recipe
  } catch (error) {
    console.error("Recipe generation error:", error)
    throw error
  }
}
