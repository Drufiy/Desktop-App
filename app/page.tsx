"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Terminal, Send, Cpu, Wifi, Settings, Power } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  formattedTime?: string
  commands?: string[]
}

export default function DrufiyApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm Drufiy, your AI Windows troubleshooting assistant. Describe any issue you're experiencing and I'll provide the commands to fix it.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    setInput("")
    setIsProcessing(true)

    // TODO: Integrate with AI API
    // const response = await fetch('/api/troubleshoot', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message: input })
    // })
    // const data = await response.json()

    // Simulate AI response with commands
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I've analyzed your issue. Here are the Windows commands to resolve it:",
        timestamp: new Date(),
        formattedTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        commands: [
          "ipconfig /release",
          "ipconfig /flushdns",
          "ipconfig /renew",
          "netsh winsock reset",
          "netsh int ip reset",
        ],
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsProcessing(false)
    }, 2000)
  }

  const executeCommand = (command: string) => {
    // TODO: Integrate with command execution system
    console.log(`Executing command: ${command}`)
    // This would interface with the desktop app's command execution module
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-amber-500/20 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                Drufiy
              </h1>
              <p className="text-xs text-gray-400">AI Windows Troubleshooter</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-amber-500/10">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-amber-500/10">
              <Power className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)]">
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
                      {message.commands && (
                        <div className="mt-4 space-y-2">
                          <p className="text-amber-400 text-sm font-medium">Commands to execute:</p>
                          {message.commands.map((command, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-amber-500/20"
                            >
                              <code className="text-green-400 font-mono text-sm flex-1">{command}</code>
                              <Button
                                size="sm"
                                onClick={() => executeCommand(command)}
                                className="ml-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
                              >
                                Execute
                              </Button>
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
  )
}
