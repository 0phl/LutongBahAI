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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Lutong BahAI</h1>
            <p className="text-sm text-muted-foreground">Your AI Filipino Recipe Buddy</p>
          </div>
          <CardTitle className="text-xl text-balance">Welcome to your personal cookbook!</CardTitle>
          <CardDescription className="text-pretty">
            I'm here to help you discover amazing Filipino recipes based on what you have in your kitchen. Let's start
            by getting to know each other.
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
