"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage, type Recipe, type ChatSession } from "@/lib/storage"
import { ArrowLeft, Clock, Users, ChefHat, Sparkles, RotateCcw } from "lucide-react"
import { RecipeGeneratingLoader, EnhancedLoading } from "@/components/enhanced-loading"

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
  const [hasGeneratedForSession, setHasGeneratedForSession] = useState<string | null>(null)
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)
  
  // Use refs to prevent race conditions and duplicate operations
  const loadingLockRef = useRef(false)
  const generatingLockRef = useRef(false)
  const processedSessionRef = useRef<string | null>(null)

  const MAX_REGENERATIONS = 2

  useEffect(() => {
    // Prevent multiple simultaneous loads and duplicate processing for the same session
    const sessionId = currentSession?.id || 'no-session'
    if (!loadingLockRef.current && processedSessionRef.current !== sessionId) {
      processedSessionRef.current = sessionId
      loadCurrentRecipe()
    }
  }, [currentSession?.id]) // Only depend on session ID to prevent infinite loops

  const loadCurrentRecipe = async () => {
    // Double-check with ref-based lock to prevent race conditions
    if (loadingLockRef.current || isLoadingRecipe) {
      console.log("RecipeGrid: Load already in progress, skipping")
      return
    }
    
    loadingLockRef.current = true
    setIsLoadingRecipe(true)
    console.log("RecipeGrid: Loading recipe for session:", currentSession?.id, "Messages:", currentSession?.messages.length)
    
    try {
      // If we have a current session, check if we've already generated a recipe for this session
      if (currentSession && currentSession.messages.length > 1) {
        // Check localStorage for persistent tracking to prevent duplicates across component re-mounts
        const sessionGeneratedKey = `session-generated-${currentSession.id}`
        const hasGeneratedPersistent = localStorage.getItem(sessionGeneratedKey)
        
        // Only generate if we haven't generated for this session yet (both in state and localStorage)
        if (hasGeneratedForSession !== currentSession.id && !hasGeneratedPersistent) {
          setHasGeneratedForSession(currentSession.id)
          localStorage.setItem(sessionGeneratedKey, 'true')
          await generateNewRecipe()
        } else if (hasGeneratedPersistent) {
          // If we've already generated for this session, just load the existing recipe
          const savedRecipes = await storage.getRecipes()
          const sessionRecipe = savedRecipes.find(recipe => 
            recipe.createdAt && new Date(recipe.createdAt).getTime() > (currentSession.createdAt ? new Date(currentSession.createdAt).getTime() : 0)
          )
          if (sessionRecipe) {
            setCurrentRecipe(sessionRecipe)
            const storedCount = localStorage.getItem(`regeneration-${sessionRecipe.id}`)
            setRegenerationCount(storedCount ? Number.parseInt(storedCount) : 0)
          } else {
            // Generate new recipe if no session-specific recipe found
            await generateNewRecipe()
          }
        }
      } else {
        // If no current session or session has minimal messages, generate a new recipe
        // This handles cases where user clicks "Generate Recipe" from a new chat
        await generateNewRecipe()
      }
    } catch (error) {
      console.error("Failed to load recipe:", error)
      setError("Failed to load recipe")
    } finally {
      setIsLoading(false)
      setIsLoadingRecipe(false)
      loadingLockRef.current = false
    }
  }

  const generateNewRecipe = async (isRegeneration = false) => {
    // Prevent duplicate generation with both state and ref checks
    if (generatingLockRef.current || isGenerating) {
      console.warn("Recipe generation already in progress, skipping duplicate request")
      return
    }

    console.log("RecipeGrid: Starting recipe generation. Regeneration:", isRegeneration, "Session:", currentSession?.id)
    generatingLockRef.current = true
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
      generatingLockRef.current = false
    }
  }

  const handleRegenerate = () => {
    // Allow regeneration by not changing the session flag
    generateNewRecipe(true)
  }

  // Reset session tracking when currentSession becomes null (new chat started)
  useEffect(() => {
    if (!currentSession) {
      setHasGeneratedForSession(null)
      processedSessionRef.current = null
      // Clean up old session generation flags (keep only last 10)
      cleanupOldSessionFlags()
    }
  }, [currentSession])

  const cleanupOldSessionFlags = () => {
    try {
      const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('session-generated-'))
      if (sessionKeys.length > 10) {
        // Sort by timestamp (assuming session IDs contain timestamps) and remove oldest
        sessionKeys.sort().slice(0, sessionKeys.length - 10).forEach(key => {
          localStorage.removeItem(key)
        })
      }
    } catch (error) {
      console.warn("Failed to cleanup old session flags:", error)
    }
  }

  if (isLoading) {
    return (
      <EnhancedLoading
        message="Loading your recipe..."
        size="md"
      />
    )
  }

  if (isGenerating) {
    return (
      <RecipeGeneratingLoader />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile: Stack layout, Desktop: Side by side */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBackToChat} className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-foreground truncate">Your Recipe</h1>
                <p className="text-xs text-muted-foreground">Personalized for {userName}</p>
              </div>
            </div>
            
            {/* Actions - Only Regenerate button */}
            {regenerationCount < MAX_REGENERATIONS && currentRecipe && (
              <div className="flex justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="gap-2 bg-transparent w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate ({MAX_REGENERATIONS - regenerationCount} left)
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Recipe Display */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
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
    </div>
  )
}

async function generateRecipeFromChat(userName: string, currentSession: ChatSession | null, regenerationCount = 0): Promise<Recipe> {
  try {
    // Get chat history for context - prioritize current session messages
    let chatHistory = currentSession?.messages || []
    
    // If no current session messages, this might be an error state
    // Log this for debugging and provide a fallback
    if (chatHistory.length === 0) {
      console.warn("No current session messages found for recipe generation. This might indicate a session management issue.")
      
      // Try to get the most recent chat sessions to find recent conversation
      const sessions = await storage.getChatSessions()
      if (sessions.length > 0) {
        // Use the most recent session's messages
        const mostRecentSession = sessions[0] // Sessions are ordered by updatedAt desc
        chatHistory = mostRecentSession.messages
        console.log("Using most recent session messages as fallback:", mostRecentSession.id)
      } else {
        // Last resort: use old chat history storage
        const allChatHistory = await storage.getChatHistory()
        chatHistory = allChatHistory.slice(-10) // Get last 10 messages
        console.log("Using legacy chat history as fallback")
      }
    }

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
      id: `${recipeData.recipe.id}-${Date.now()}`, // Ensure unique ID by adding timestamp
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
