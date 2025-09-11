"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { storage, type ChatSession } from "@/lib/storage"
import { X, Plus, MessageSquare, Trash2, ChefHat } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentSessionId: string | null
  onSessionSelect: (session: ChatSession) => void
  onNewChat: () => void
  onViewRecipeCollection?: () => void
  userName: string
  refreshTrigger?: number
}

export function ChatSidebar({
  isOpen,
  onToggle,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onViewRecipeCollection,
  userName,
  refreshTrigger = 0,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
  const isMobile = useMobile()

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadSessions()
    }
  }, [refreshTrigger])

  const loadSessions = async () => {
    try {
      const chatSessions = await storage.getChatSessions()
      setSessions(chatSessions)
    } catch (error) {
      console.error("Failed to load chat sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteSessionId(sessionId)
  }

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return

    try {
      await storage.deleteChatSession(deleteSessionId)
      setSessions((prev) => prev.filter((s) => s.id !== deleteSessionId))

      // If deleting current session, start new chat
      if (deleteSessionId === currentSessionId) {
        onNewChat()
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
    } finally {
      setDeleteSessionId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-background border-r border-border z-[80]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-80 md:w-72
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm">Chat History</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="p-4 border-b border-border space-y-2">
          <Button onClick={onNewChat} className="w-full justify-start gap-2 bg-transparent" variant="outline">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
          {onViewRecipeCollection && (
            <Button
              onClick={onViewRecipeCollection}
              className="w-full justify-start gap-2 bg-transparent"
              variant="outline"
            >
              <ChefHat className="w-4 h-4" />
              Recipe Collection
            </Button>
          )}
        </div>

        {/* Chat Sessions */}
        <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history yet</p>
                <p className="text-xs">Start a conversation with Lutong BahAI!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group relative p-3 rounded-lg cursor-pointer transition-colors
                      ${
                        session.id === currentSessionId ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                      }
                    `}
                    onClick={() => onSessionSelect(session)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{session.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(session.updatedAt)}</p>
                        <p className="text-xs text-muted-foreground">{session.messages.length} messages</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 text-muted-foreground hover:text-destructive transition-opacity ${
                          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={(e) => handleDeleteSession(session.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium truncate">{userName}</span>
          </div>
        </div>
      </div>

      <Dialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg font-medium text-foreground">Delete Chat</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              This action cannot be undone. All messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button
              onClick={confirmDeleteSession}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Delete Chat
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteSessionId(null)}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
