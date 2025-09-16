"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { storage, type Recipe } from "@/lib/storage"
import { ArrowLeft, Clock, Users, ChefHat, Search, Calendar, Trash2 } from "lucide-react"

interface RecipeCollectionProps {
  onRecipeSelect: (recipe: Recipe) => void
  onBackToChat: () => void
  userName: string
}

export function RecipeCollection({ onRecipeSelect, onBackToChat, userName }: RecipeCollectionProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    // Filter recipes based on search query
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes)
    } else {
      const filtered = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredRecipes(filtered)
    }
  }, [searchQuery, recipes])

  const loadRecipes = async () => {
    try {
      const savedRecipes = await storage.getRecipes()
      setRecipes(savedRecipes)
      setFilteredRecipes(savedRecipes)
    } catch (error) {
      console.error("Failed to load recipes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRecipe = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setDeleteRecipeId(recipeId)
  }

  const confirmDeleteRecipe = async () => {
    if (!deleteRecipeId) return
    try {
      await storage.deleteRecipe(deleteRecipeId)
      const updatedRecipes = recipes.filter((recipe) => recipe.id !== deleteRecipeId)
      setRecipes(updatedRecipes)
      setFilteredRecipes(
        updatedRecipes.filter(
          (recipe) =>
            searchQuery.trim() === "" ||
            recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
      )
    } catch (error) {
      console.error("Failed to delete recipe:", error)
    } finally {
      setDeleteRecipeId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading your recipe collection...</p>
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
                <h1 className="text-xl font-bold text-foreground">My Recipe Collection</h1>
                <p className="text-xs text-muted-foreground">{recipes.length} saved recipes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{searchQuery ? "No recipes found" : "No recipes yet"}</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Start chatting to generate your first recipe!"}
            </p>
            <Button onClick={onBackToChat}>Back to Chat</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
                onClick={() => onRecipeSelect(recipe)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border flex items-center justify-center relative">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl || "/food-placeholder.png"}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ChefHat className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">{recipe.title}</p>
                    </div>
                  )}
                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-8 h-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteRecipe(recipe.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{recipe.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{recipe.cookingTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{recipe.servings}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {recipe.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!deleteRecipeId} onOpenChange={() => setDeleteRecipeId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg font-medium text-foreground">Delete Recipe</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              This action cannot be undone. This recipe will be permanently removed from your collection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button onClick={confirmDeleteRecipe} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              Delete Recipe
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteRecipeId(null)}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
