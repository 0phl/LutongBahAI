"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeScreenProps {
  onNameSubmit: (name: string) => void
}

export function WelcomeScreen({ onNameSubmit }: WelcomeScreenProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for UX
    onNameSubmit(name.trim())
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bokeh effect background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-emerald-300/40 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-300/35 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-10 w-36 h-36 bg-teal-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-green-400/25 rounded-full blur-lg animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/90 border-green-100 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-0">
              <img 
                src="/txtlogo.svg" 
                alt="Lutong BahAI" 
                className="h-16 w-auto"
              />
              <img 
                src="/character-logo.svg" 
                alt="Lutong BahAI" 
                className="h-20 w-auto -ml-2"
              />
            </div>
            <p className="text-sm text-muted-foreground">Your AI Filipino Recipe Buddy</p>
          </div>
          <CardTitle className="text-xl text-balance">Welcome to your personal cookbook!</CardTitle>
          <CardDescription className="text-pretty">
            I'm here to help you discover amazing Filipino recipes based on what you have in your kitchen. Tell me your name, and I’ll help you cook up something delicious!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                What can I call you?
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name or nickname..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Getting ready..." : "Let's cook together!"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
