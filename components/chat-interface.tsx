"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { storage, type ChatMessage, type ChatSession } from "@/lib/storage"
import { Send, ChefHat, Sparkles, Menu } from "lucide-react"

interface ChatInterfaceProps {
  userName: string
  onRecipeGenerated: () => void
  currentSession: ChatSession | null
  onSessionUpdate: (session: ChatSession) => void
  onNewChat: () => void
  onSidebarToggle: () => void
  isSidebarOpen: boolean
  onViewRecipeCollection?: () => void
}

export function ChatInterface({
  userName,
  onRecipeGenerated,
  currentSession,
  onSessionUpdate,
  onNewChat,
  onSidebarToggle,
  isSidebarOpen,
  onViewRecipeCollection,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showGenerateButton, setShowGenerateButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const MAX_CHARACTERS = 1000

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        if (currentSession) {
          setMessages(currentSession.messages)
          const hasEnoughContext = currentSession.messages.length >= 4
          setShowGenerateButton(hasEnoughContext)
        } else {
          // Only show welcome message without creating a session
          // Session will be created when user sends their first message
          const welcomeMessage: ChatMessage = {
            id: "welcome",
            role: "assistant",
            content: `Hi ${userName}! I'm your Filipino recipe assistant. Tell me what ingredients you have, what you're craving, or any dietary preferences, and I'll help you discover the perfect Filipino dish to cook today!`,
            timestamp: new Date().toISOString(),
          }
          setMessages([welcomeMessage])
          // Ensure CTA from previous session does not persist
          setShowGenerateButton(false)
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
      }
    }

    loadChatHistory()
  }, [userName, currentSession, onSessionUpdate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateSmartTitle = (userMessage: string): string => {
    const cleanMessage = userMessage
      .toLowerCase()
      .replace(/^(i want to|i would like to|can you|please|help me|i need|i have|tell me about)/g, "")
      .replace(/\b(cook|make|prepare|recipe for|how to)\b/g, "")
      .trim()

    const foodKeywords = [
      "adobo",
      "sinigang",
      "lumpia",
      "pansit",
      "lechon",
      "kare-kare",
      "bistek",
      "menudo",
      "rice",
      "chicken",
      "pork",
      "beef",
      "fish",
      "vegetables",
      "noodles",
      "soup",
    ]

    const foundKeywords = foodKeywords.filter((keyword) => cleanMessage.includes(keyword))

    if (foundKeywords.length > 0) {
      const mainKeyword = foundKeywords[0]
      return `${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} Recipe`
    }

    const words = cleanMessage.split(" ").filter((word) => word.length > 2)
    if (words.length > 0) {
      const firstTwoWords = words.slice(0, 2).join(" ")
      return firstTwoWords.charAt(0).toUpperCase() + firstTwoWords.slice(1)
    }

    return userMessage.slice(0, 20) + (userMessage.length > 20 ? "..." : "")
  }

  const updateSession = async (newMessages: ChatMessage[]) => {
    if (!currentSession) {
      // Create new session when none exists
      const firstUserMessage = newMessages.find((m) => m.role === "user")
      const title = firstUserMessage ? generateSmartTitle(firstUserMessage.content) : "New Chat"
      
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title,
        messages: newMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await storage.saveChatSession(newSession)
      onSessionUpdate(newSession)
      return
    }

    let title = currentSession.title
    if (title === "New Chat" && newMessages.length >= 2) {
      const firstUserMessage = newMessages.find((m) => m.role === "user")
      if (firstUserMessage) {
        title = generateSmartTitle(firstUserMessage.content)
      }
    }

    const updatedSession: ChatSession = {
      ...currentSession,
      title,
      messages: newMessages,
      updatedAt: new Date().toISOString(),
    }

    await storage.saveChatSession(updatedSession)
    onSessionUpdate(updatedSession)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setCharacterCount(0)
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(inputValue.trim(), messages, userName)

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      await updateSession(finalMessages)

      if (aiResponse.shouldShowGenerateButton) {
        setShowGenerateButton(true)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again!",
        timestamp: new Date().toISOString(),
      }
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      await updateSession(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARACTERS) {
      setInputValue(value)
      setCharacterCount(value.length)
    }
  }

  const handleGenerateRecipe = () => {
    onRecipeGenerated()
  }

  const hasUserMessages = messages.some((message) => message.role === "user")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onSidebarToggle} className="h-8 w-8 p-0 md:flex">
                <Menu className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Lutong BahAI Chat</h1>
                <p className="text-xs text-muted-foreground">
                  {currentSession?.title === "New Chat"
                    ? `Chatting with ${userName}`
                    : currentSession?.title || `Chatting with ${userName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onViewRecipeCollection && (
                <Button variant="outline" size="sm" onClick={onViewRecipeCollection} className="gap-2 bg-transparent">
                  <ChefHat className="w-4 h-4" />
                  <span className="hidden sm:inline">Recipes</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onNewChat}
                disabled={!hasUserMessages}
                className={!hasUserMessages ? "opacity-50 cursor-not-allowed" : ""}
              >
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">{new Date(message.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {showGenerateButton && (
        <div className="container mx-auto px-4 pb-4 max-w-4xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Ready to cook?</p>
                    <p className="text-xs text-muted-foreground">Generate your personalized Filipino recipe</p>
                  </div>
                </div>
                <Button onClick={handleGenerateRecipe} className="gap-2">
                  <ChefHat className="w-4 h-4" />
                  Generate Recipe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="space-y-2">
            <div className="flex justify-end items-center text-xs text-muted-foreground">
              <span className={characterCount > MAX_CHARACTERS * 0.9 ? "text-orange-500" : ""}>
                {characterCount}/{MAX_CHARACTERS}
              </span>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe what you want to cook"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || characterCount > MAX_CHARACTERS}
                size="icon"
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function generateAIResponse(
  userInput: string,
  chatHistory: ChatMessage[],
  userName: string,
): Promise<{ content: string; shouldShowGenerateButton: boolean }> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userInput,
        chatHistory,
        userName,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get AI response")
    }

    const data = await response.json()
    return {
      content: data.content,
      shouldShowGenerateButton: data.shouldShowGenerateButton,
    }
  } catch (error) {
    console.error("AI response error:", error)
    return {
      content: "Sorry, I'm having trouble responding right now. Please try again!",
      shouldShowGenerateButton: false,
    }
  }
}
