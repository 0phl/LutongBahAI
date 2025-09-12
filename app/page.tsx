"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ChatInterface } from "@/components/chat-interface"
import { RecipeGrid } from "@/components/recipe-grid"
import { RecipeDetail } from "@/components/recipe-detail"
import { ChatSidebar } from "@/components/chat-sidebar"
import { RecipeCollection } from "@/components/recipe-collection"
import { storage, type UserData, type Recipe, type ChatSession } from "@/lib/storage"
import type { AppState } from "@/lib/types"

export default function LutongBahAIApp() {
  const [appState, setAppState] = useState<AppState>("welcome")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessionsRefreshTrigger, setSessionsRefreshTrigger] = useState(0)

  // Initialize app and check for existing user
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storage.init()
        const existingUser = await storage.getUserData()

        if (existingUser) {
          setUserData(existingUser)
          setAppState("chat")
        }
      } catch (error) {
        console.error("Failed to initialize app:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleNameSubmit = async (name: string) => {
    const newUserData: UserData = {
      name,
      createdAt: new Date().toISOString(),
    }

    try {
      await storage.saveUserData(newUserData)
      setUserData(newUserData)
      setAppState("chat")
    } catch (error) {
      console.error("Failed to save user data:", error)
    }
  }

  const handleNewChat = async () => {
    // Save current session if it exists and has messages
    if (currentSession && currentSession.messages.length > 1) {
      try {
        await storage.saveChatSession(currentSession)
        setSessionsRefreshTrigger((prev) => prev + 1)
      } catch (error) {
        console.error("Failed to save current session:", error)
      }
    }

    setCurrentSession(null)
    setAppState("chat")
    setIsSidebarOpen(false)
  }

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session)
    setAppState("chat")
    setIsSidebarOpen(false)
  }

  const handleSessionUpdate = (session: ChatSession) => {
    setCurrentSession(session)
  }

  const handleRecipeGenerated = () => {
    setAppState("recipes")
  }

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setAppState("recipe-detail")
  }

  const handleBackToRecipes = () => {
    setSelectedRecipe(null)
    setAppState("recipes")
  }

  const handleBackToChat = () => {
    setAppState("chat")
  }

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleViewRecipeCollection = () => {
    setAppState("recipe-collection")
  }

  const handleBackToRecipeCollection = () => {
    setSelectedRecipe(null)
    setAppState("recipe-collection")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading Lutong BahAI...</p>
        </div>
      </div>
    )
  }

  const showSidebar = userData && appState !== "welcome"

  return (
    <div className="relative min-h-screen bg-background">
      {showSidebar && (
        <ChatSidebar
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          currentSessionId={currentSession?.id || null}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onViewRecipeCollection={handleViewRecipeCollection}
          userName={userData?.name || "Friend"}
          refreshTrigger={sessionsRefreshTrigger}
        />
      )}

      <div className={showSidebar ? "transition-all duration-300" : ""}>
        {(() => {
          switch (appState) {
            case "welcome":
              return <WelcomeScreen onNameSubmit={handleNameSubmit} />

            case "chat":
              return (
                <ChatInterface
                  userName={userData?.name || "Friend"}
                  onRecipeGenerated={handleRecipeGenerated}
                  currentSession={currentSession}
                  onSessionUpdate={handleSessionUpdate}
                  onNewChat={handleNewChat}
                  onSidebarToggle={handleSidebarToggle}
                  isSidebarOpen={isSidebarOpen}
                  onViewRecipeCollection={handleViewRecipeCollection}
                />
              )

            case "recipes":
              return (
                <RecipeGrid
                  onRecipeSelect={handleRecipeSelect}
                  onBackToChat={handleBackToChat}
                  userName={userData?.name || "Friend"}
                  currentSession={currentSession}
                />
              )

            case "recipe-collection":
              return (
                <RecipeCollection
                  onRecipeSelect={handleRecipeSelect}
                  onBackToChat={handleBackToChat}
                  userName={userData?.name || "Friend"}
                />
              )

            case "recipe-detail":
              return (
                <RecipeDetail
                  recipe={selectedRecipe!}
                  onBack={selectedRecipe?.id ? handleBackToRecipeCollection : handleBackToRecipes}
                />
              )

            default:
              return <WelcomeScreen onNameSubmit={handleNameSubmit} />
          }
        })()}
      </div>
    </div>
  )
}
