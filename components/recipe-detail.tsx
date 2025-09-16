"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Clock, Users, ChefHat, CheckCircle2, Timer } from "lucide-react"
import { CookingTimer } from "@/components/cooking-timer"
import type { Recipe } from "@/lib/storage"

interface RecipeDetailProps {
  recipe: Recipe
  onBack: () => void
}

export function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())
  const [isTimerOpen, setIsTimerOpen] = useState(false)

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedSteps(newChecked)
  }

  const completionPercentage = Math.round((checkedSteps.size / recipe.instructions.length) * 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Always horizontal layout with timer in top right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-foreground truncate">{recipe.title}</h1>
                <p className="text-xs text-muted-foreground">Personalized for Ronan</p>
              </div>
            </div>
            
            {/* Timer always in top right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Progress Badge - Only show when there's progress */}
              {checkedSteps.size > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs hidden sm:flex">
                  <CheckCircle2 className="w-3 h-3" />
                  {completionPercentage}%
                </Badge>
              )}
              
              {/* Enhanced Timer Button - More visible on mobile */}
              <Button
                variant={isTimerOpen ? "default" : "outline"}
                size="sm"
                onClick={() => setIsTimerOpen(!isTimerOpen)}
                className={`gap-1.5 px-3 py-1.5 h-8 flex-shrink-0 transition-all duration-200 ${
                  isTimerOpen 
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                    : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden xs:inline">Timer</span>
              </Button>
            </div>
          </div>
          
          {/* Progress Badge on mobile - show below header */}
          {checkedSteps.size > 0 && (
            <div className="flex justify-center mt-2 sm:hidden">
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle2 className="w-3 h-3" />
                {completionPercentage}% Complete
              </Badge>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        {/* Recipe Hero */}
        <Card className="mb-6 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border flex items-center justify-center">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl || "/food-placeholder.png"}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg font-medium">{recipe.title}</p>
                <p className="text-sm">AI Generated Recipe</p>
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-balance">{recipe.title}</CardTitle>
            <CardDescription className="text-base text-pretty leading-relaxed">{recipe.description}</CardDescription>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{recipe.cookingTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}</span>
              </div>
              <Badge variant="secondary">{recipe.difficulty}</Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          {/* Ingredients */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Ingredients
                <Badge variant="outline" className="text-xs">
                  {checkedIngredients.size}/{recipe.ingredients.length}
                </Badge>
              </CardTitle>
              <CardDescription>Check off ingredients as you gather them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <label
                  key={index}
                  htmlFor={`ingredient-${index}`}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <Checkbox
                    id={`ingredient-${index}`}
                    checked={checkedIngredients.has(index)}
                    onCheckedChange={() => toggleIngredient(index)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span
                    className={`text-sm leading-relaxed flex-1 transition-all ${
                      checkedIngredients.has(index)
                        ? "line-through text-muted-foreground"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {ingredient}
                  </span>
                  {!checkedIngredients.has(index) && (
                    <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to check
                    </div>
                  )}
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cooking Instructions
                {completionPercentage > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {completionPercentage}%
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Click the step numbers to mark them as complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                  onClick={() => toggleStep(index)}
                >
                  <div className="flex-shrink-0 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStep(index)
                      }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        checkedSteps.has(index)
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-primary hover:bg-primary/10 group-hover:border-primary/80 group-hover:shadow-sm"
                      }`}
                    >
                      {checkedSteps.has(index) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm leading-relaxed transition-all ${
                        checkedSteps.has(index)
                          ? "line-through text-muted-foreground"
                          : "text-foreground group-hover:text-primary/90"
                      }`}
                    >
                      {instruction}
                    </p>
                    {!checkedSteps.has(index) && (
                      <div className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to mark as complete
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {checkedSteps.size === recipe.instructions.length && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                  <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium text-primary">Recipe Complete!</p>
                  <p className="text-sm text-muted-foreground">Enjoy your delicious {recipe.title}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recipe Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Recipe Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-medium">Cooking Time</p>
                <p className="text-sm text-muted-foreground">{recipe.cookingTime}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-medium">Servings</p>
                <p className="text-sm text-muted-foreground">{recipe.servings}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <ChefHat className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-medium">Difficulty</p>
                <p className="text-sm text-muted-foreground">{recipe.difficulty}</p>
              </div>
            </div>
            <Separator />
            <div className="text-center text-sm text-muted-foreground">
              <p>Recipe created on {new Date(recipe.createdAt).toLocaleDateString()}</p>
              <p className="mt-1">Generated by Lutong BahAI</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Cooking Timer */}
      <CookingTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
    </div>
  )
}
