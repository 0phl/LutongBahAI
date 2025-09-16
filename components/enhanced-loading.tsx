"use client"

import React from "react"

interface EnhancedLoadingProps {
  message?: string
  showProgress?: boolean
  progressValue?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function EnhancedLoading({ 
  message = "Loading...", 
  showProgress = false,
  progressValue = 60,
  size = "md",
  className = ""
}: EnhancedLoadingProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32", 
    lg: "w-40 h-40"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Character Video Container */}
        <div className="relative mx-auto">
          <div className={`${sizeClasses[size]} mx-auto rounded-full overflow-hidden bg-primary/5 border-4 border-primary/20 shadow-lg`}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: "center center" }}
            >
              <source src="/garlicia.mp4" type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <div className="text-center text-primary">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              </div>
            </video>
          </div>
          
          {/* Animated Ring Around Video */}
          <div className={`absolute inset-0 ${sizeClasses[size]} mx-auto rounded-full border-2 border-primary/30 animate-pulse`}></div>
          
          {/* Floating Sparkles */}
          <div className="absolute -top-2 -right-2">
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          </div>
          <div className="absolute -top-1 -left-3">
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <div className="absolute -bottom-2 -left-2">
            <div className="w-2.5 h-2.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <div className="absolute -bottom-1 -right-3">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className={`${textSizes[size]} font-semibold text-foreground animate-pulse`}>
            {message}
          </h2>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-1000 ease-out animate-pulse" 
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
          )}
          
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground animate-pulse">
            Your AI chef is working on something delicious...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Specialized loading components for different use cases
export function RecipeGeneratingLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Character Video Container */}
        <div className="relative mx-auto">
          <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-primary/5 border-4 border-primary/20 shadow-lg">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: "center center" }}
            >
              <source src="/garlicia.mp4" type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <div className="text-center text-primary">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              </div>
            </video>
          </div>
          
          {/* Animated Ring Around Video */}
          <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full border-2 border-primary/30 animate-pulse"></div>
          
          {/* Floating Sparkles */}
          <div className="absolute -top-2 -right-2">
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          </div>
          <div className="absolute -top-1 -left-3">
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <div className="absolute -bottom-2 -left-2">
            <div className="w-2.5 h-2.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <div className="absolute -bottom-1 -right-3">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground animate-pulse">
            Generating Your Recipe
          </h2>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-1000 ease-out animate-pulse" 
              style={{ width: "75%" }}
            ></div>
          </div>
          
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground animate-pulse">
            I'm creating a personalized Filipino recipe based on our conversation...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Note: Other loading states use simple spinners as requested.
// Only recipe generation uses the enhanced video loading experience.
