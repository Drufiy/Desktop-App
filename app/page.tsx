"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Terminal, Send, Cpu, Wifi, Settings, Power, Menu } from "lucide-react"
import { ThreadSidebar } from "@/components/ThreadSidebar"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  formattedTime?: string
  commands?: string[]
  commandOutput?: string[]
}

export default function GlitchApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isClient, setIsClient] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Helper function to add auth header to fetch requests
  const apiFetch = (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {})
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return fetch(url, { ...options, headers })
  }

  // Login handler
  const loginUser = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("Please enter email and password")
      return
    }

    setIsLoggingIn(true)
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data = await response.json()
      const accessToken = data.access_token || data.token
      setToken(accessToken)
      sessionStorage.setItem("glitch_token", accessToken)
      setLoginEmail("")
      setLoginPassword("")
    } catch (error) {
      alert(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLoginKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      loginUser()
    }
  }

  // Initialize messages on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    const savedToken = sessionStorage.getItem("glitch_token")
    if (savedToken) {
      setToken(savedToken)
    }
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          type: "ai",
          content:
            "Hello! I'm Glitch, your AI troubleshooting assistant. Describe any Windows or development issue you're experiencing and I'll provide the commands to fix it.",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load threads on mount or when token changes
  useEffect(() => {
    if (token) {
      loadThreads()
    }
  }, [token])

  // Load messages when thread changes
  useEffect(() => {
    if (threadId) {
      loadThreadMessages(threadId)
    } else if (isClient && messages.length === 1) {
      // Clear messages if no thread selected (only if we're the initial message)
      setMessages([
        {
          id: "1",
          type: "ai",
          content:
            "Hello! I'm Glitch, your AI troubleshooting assistant. Describe any Windows or development issue you're experiencing and I'll provide the commands to fix it.",
          timestamp: new Date(),
        },
      ])
    }
  }, [threadId, isClient])

  const loadThreads = async () => {
    try {
      const response = await apiFetch("http://localhost:8080/threads")
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
      }
    } catch (error) {
      console.error("Failed to load threads:", error)
    }
  }

  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await apiFetch(`http://localhost:8080/threads/${threadId}/messages`)
      if (response.ok) {
        const history = await response.json()
        // Convert history to messages
        const convertedMessages: Message[] = history.map((entry: any, index: number) => {
          const isUser = entry.message.startsWith("User:")
          return {
            id: `msg-${index}`,
            type: isUser ? "user" : "ai",
            content: isUser ? entry.message.replace("User: ", "") : entry.message.replace("Assistant: ", ""),
            timestamp: new Date(entry.timestamp),
            formattedTime: new Date(entry.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
            commands: entry.command ? [entry.command] : [],
          }
        })

        if (convertedMessages.length > 0) {
          setMessages(convertedMessages)
        } else {
          setMessages([
            {
              id: "1",
              type: "ai",
              content:
                "Hello! I'm Glitch, your AI troubleshooting assistant. Describe any Windows or development issue you're experiencing and I'll provide the commands to fix it.",
              timestamp: new Date(),
            },
          ])
        }
      }
    } catch (error) {
      console.error("Failed to load thread messages:", error)
    }
  }

  const createNewThread = async () => {
    try {
      const response = await apiFetch("http://localhost:8080/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      })

      if (response.ok) {
        const thread = await response.json()
        setThreads((prev) => [thread, ...prev])
        setThreadId(thread.id)
        setMessages([
          {
            id: "1",
            type: "ai",
            content:
              "Hello! I'm Glitch, your AI troubleshooting assistant. Describe any Windows or development issue you're experiencing and I'll provide the commands to fix it.",
            timestamp: new Date(),
          },
        ])
        setSidebarOpen(false)
      }
    } catch (error) {
      console.error("Failed to create thread:", error)
    }
  }

  const deleteThread = async (threadIdToDelete: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return

    try {
      const response = await apiFetch(`http://localhost:8080/threads/${threadIdToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== threadIdToDelete))
        if (threadId === threadIdToDelete) {
          setThreadId(null)
          setMessages([
            {
              id: "1",
              type: "ai",
              content:
                "Hello! I'm Glitch, your AI troubleshooting assistant. Describe any Windows or development issue you're experiencing and I'll provide the commands to fix it.",
              timestamp: new Date(),
            },
          ])
        }
      }
    } catch (error) {
      console.error("Failed to delete thread:", error)
    }
  }

  const selectThread = (id: string) => {
    setThreadId(id)
    setSidebarOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      formattedTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    }
    

    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput("")
    setIsProcessing(true)

    // Create thread if none exists
    let currentThreadId = threadId
    if (!currentThreadId) {
      try {
        const createResponse = await apiFetch("http://localhost:8080/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: userInput.substring(0, 50) }),
        })
        if (createResponse.ok) {
          const newThread = await createResponse.json()
          currentThreadId = newThread.id
          setThreadId(currentThreadId)
          setThreads((prev) => [newThread, ...prev])
        }
      } catch (error) {
        console.error("Failed to create thread:", error)
      }
    }

    try {
      // Call the backend API
      const response = await apiFetch('http://localhost:8080/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          problem: userInput,
          thread_id: currentThreadId,
          command_output: null
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Update thread ID if provided
      if (data.thread_id) {
        setThreadId(data.thread_id)
      }
      
      // Reload threads to update titles
      loadThreads()

      // Process backend response: extract command outputs and status if embedded
      const rawMessage: string = data.message || ""

      // Try to extract Output: ... (take the last occurrence if present)
      const outputRegex = /Output:\s*([\s\S]*)$/i
      const outputs: string[] = []
      let cleanedMessage = rawMessage
      const outMatch = rawMessage.match(outputRegex)
      if (outMatch && outMatch[1]) {
        const outText = outMatch[1].trim()
        if (outText) outputs.push(outText)
        // Remove the Output: ... portion from the cleaned message
        cleanedMessage = rawMessage.slice(0, outMatch.index ?? 0).replace(/\s+$/g, "")
      }

      // Remove status tokens and generic 'Command executed' phrases from the AI text
      cleanedMessage = cleanedMessage
        .replace(/\[SUCCESS\]|\[FAILURE\]/gi, "")
        .replace(/Command executed[:\.]*\s*/gi, "")
        .trim()

      // Determine commands
      const commands = data.command && data.next_step === "command" ? [data.command] : []

      // First add the AI analysis message (cleaned of embedded outputs)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: cleanedMessage || "I've analyzed your request.",
        timestamp: new Date(),
        formattedTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      }
      setMessages((prev) => [...prev, aiMessage])

      // If there's a command, add a dedicated command message after the AI analysis (with any outputs)
      if (commands.length > 0) {
        const statusMatch = rawMessage.match(/\[(SUCCESS|FAILURE)\]/i)
        const status = statusMatch ? statusMatch[1].toUpperCase() : undefined
        const commandContent = status ? `Command ${status}` : "Executing command..."

        const commandMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: commandContent,
          timestamp: new Date(),
          formattedTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
          commands: commands,
          commandOutput: outputs,
        }
        setMessages((prev) => [...prev, commandMessage])
      }
    } catch (error) {
      console.error('Error calling API:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to backend. Make sure the server is running on http://localhost:8080'}`,
        timestamp: new Date(),
        formattedTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const executeCommand = async (command: string) => {
    // Commands are auto-executed by the backend
    console.log(`Command executed: ${command}`)
  }

  return (
    <>
      {/* Login Screen */}
      {!token && (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>

          <Card className="relative w-full max-w-md bg-black/80 border-amber-500/30 backdrop-blur-xl p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold ml-3 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                Glitch
              </h1>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-center text-sm mb-6">
                AI-Powered Troubleshooting Assistant
              </p>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email</label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyPress={handleLoginKeyPress}
                  placeholder="admin@example.com"
                  className="bg-gray-900/50 border-amber-500/30 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  disabled={isLoggingIn}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Password</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={handleLoginKeyPress}
                  placeholder="••••••••"
                  className="bg-gray-900/50 border-amber-500/30 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  disabled={isLoggingIn}
                />
              </div>

              <Button
                onClick={loginUser}
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Chat App */}
      {token && (
    <div className="min-h-screen bg-black text-white overflow-hidden flex">
      {/* Thread Sidebar */}
      <ThreadSidebar
        threads={threads}
        currentThreadId={threadId}
        onSelectThread={selectThread}
        onNewThread={createNewThread}
        onDeleteThread={deleteThread}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Background Gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-amber-500/20 bg-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-400 hover:text-white hover:bg-amber-500/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  Glitch
                </h1>
                <p className="text-xs text-gray-400">AI Troubleshooting Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-amber-500/10">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-red-500/10"
                onClick={() => {
                  setToken(null)
                  sessionStorage.removeItem("glitch_token")
                }}
              >
                <Power className="w-4 h-4" />
              </Button>
              {/* single Power button above handles sign-out */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                <Card
                  className={`p-4 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30"
                      : "bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50"
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-start space-x-3">
                    {message.type === "ai" && (
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{message.content}</p>
                      {message.commands && message.commands.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-amber-400 text-sm font-medium">Command executed:</p>
                          {message.commands.map((command, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-green-500/30"
                            >
                              <code className="text-green-400 font-mono text-sm flex-1 break-all">{command}</code>
                              <span className="ml-3 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                                Executed
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                        {message.commandOutput && message.commandOutput.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-blue-400 text-sm font-medium">Output:</p>
                            {message.commandOutput.map((output, index) => (
                              <div
                                key={index}
                                className="bg-black/50 rounded-lg p-3 border border-blue-500/30"
                              >
                                <code className="text-blue-200 font-mono text-sm break-all">{output}</code>
                              </div>
                            ))}
                          </div>
                        )}
                      <p className="text-xs text-gray-500 mt-2">{message.formattedTime}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <Card className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-black animate-pulse" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-amber-500/20 bg-black/50 backdrop-blur-xl p-6">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your Windows issue... (e.g., 'WiFi not working', 'Computer running slow')"
                className="bg-gray-900/50 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500/20 pr-12"
                disabled={isProcessing}
              />
              <Wifi className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <Button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by AI • Commands will be executed with administrator privileges
          </p>
        </div>
        </div>
      </div>
    </div>
      )}
    </>
  )
}
