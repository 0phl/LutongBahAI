"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Clock, Play, Pause, RotateCcw, X } from "lucide-react"

interface CookingTimerProps {
  isOpen: boolean
  onClose: () => void
}

export function CookingTimer({ isOpen, onClose }: CookingTimerProps) {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/timer.mp3")
      audioRef.current.preload = "auto"
    }
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            if (audioRef.current) {
              audioRef.current.play().catch(() => {})
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds)
    }
    setIsRunning(true)
    setIsFinished(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setIsFinished(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`p-4 w-64 shadow-lg border-2 ${isFinished ? "border-red-500 bg-red-50" : "border-green-600"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">Cooking Timer</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
              }
              onClose()
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {timeLeft === 0 && !isRunning ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600">Minutes</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Number.parseInt(e.target.value) || 0))}
                  className="h-8"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600">Seconds</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0)))}
                  className="h-8"
                />
              </div>
            </div>
            <Button
              onClick={startTimer}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={minutes === 0 && seconds === 0}
            >
              <Play className="h-3 w-3 mr-1" />
              Start Timer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`text-center text-2xl font-mono font-bold ${isFinished ? "text-red-600" : "text-green-600"}`}
            >
              {formatTime(timeLeft)}
            </div>
            {isFinished && <div className="text-center text-sm font-medium text-red-600">Time's up! 🔔</div>}
            <div className="flex gap-2">
              {!isFinished && (
                <Button
                  onClick={isRunning ? pauseTimer : startTimer}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                >
                  {isRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                  {isRunning ? "Pause" : "Resume"}
                </Button>
              )}
              <Button onClick={resetTimer} variant="outline" size="sm" className="flex-1 bg-transparent">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
