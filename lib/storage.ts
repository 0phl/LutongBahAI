// IndexedDB storage for recipe history and user data
interface UserData {
  name: string
  createdAt: string
}

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cookingTime: string
  servings: string
  difficulty: string
  imageUrl?: string
  createdAt: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

class KusAInaStorage {
  private dbName = "kusaina-db"
  private version = 2 // Incremented version for new chat sessions store
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores
        if (!db.objectStoreNames.contains("userData")) {
          db.createObjectStore("userData", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("recipes")) {
          const recipeStore = db.createObjectStore("recipes", { keyPath: "id" })
          recipeStore.createIndex("createdAt", "createdAt", { unique: false })
        }

        if (!db.objectStoreNames.contains("chatHistory")) {
          const chatStore = db.createObjectStore("chatHistory", { keyPath: "id" })
          chatStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("chatSessions")) {
          const sessionStore = db.createObjectStore("chatSessions", { keyPath: "id" })
          sessionStore.createIndex("updatedAt", "updatedAt", { unique: false })
        }
      }
    })
  }

  async saveUserData(userData: UserData): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["userData"], "readwrite")
      const store = transaction.objectStore("userData")
      const request = store.put({ id: "current-user", ...userData })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getUserData(): Promise<UserData | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["userData"], "readonly")
      const store = transaction.objectStore("userData")
      const request = store.get("current-user")

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async saveRecipe(recipe: Recipe): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["recipes"], "readwrite")
      const store = transaction.objectStore("recipes")
      const request = store.put(recipe)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getRecipes(): Promise<Recipe[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["recipes"], "readonly")
      const store = transaction.objectStore("recipes")
      const index = store.index("createdAt")
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result.reverse()) // Most recent first
    })
  }

  async deleteRecipe(recipeId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["recipes"], "readwrite")
      const store = transaction.objectStore("recipes")
      const request = store.delete(recipeId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async saveChatMessage(message: ChatMessage): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatHistory"], "readwrite")
      const store = transaction.objectStore("chatHistory")
      const request = store.put(message)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatHistory"], "readonly")
      const store = transaction.objectStore("chatHistory")
      const index = store.index("timestamp")
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async clearChatHistory(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatHistory"], "readwrite")
      const store = transaction.objectStore("chatHistory")
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async saveChatSession(session: ChatSession): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatSessions"], "readwrite")
      const store = transaction.objectStore("chatSessions")
      const request = store.put(session)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getChatSessions(): Promise<ChatSession[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatSessions"], "readonly")
      const store = transaction.objectStore("chatSessions")
      const index = store.index("updatedAt")
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result.reverse()) // Most recent first
    })
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatSessions"], "readwrite")
      const store = transaction.objectStore("chatSessions")
      const request = store.delete(sessionId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["chatSessions"], "readonly")
      const store = transaction.objectStore("chatSessions")
      const request = store.get(sessionId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }
}

export const storage = new KusAInaStorage()
export type { UserData, Recipe, ChatMessage, ChatSession }
