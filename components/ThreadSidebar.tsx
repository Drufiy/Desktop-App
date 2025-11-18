"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, MessageSquare, Trash2, X } from "lucide-react"

interface Thread {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ThreadSidebarProps {
  threads: Thread[]
  currentThreadId: string | null
  onSelectThread: (threadId: string) => void
  onNewThread: () => void
  onDeleteThread: (threadId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function ThreadSidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  isOpen,
  onClose,
}: ThreadSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-amber-500/20 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Chats</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={onNewThread}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-2">
          {threads.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No chats yet</p>
              <p className="text-sm mt-1">Create a new chat to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <Card
                  key={thread.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    currentThreadId === thread.id
                      ? "bg-amber-500/20 border-amber-500/50"
                      : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800"
                  }`}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {thread.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(thread.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteThread(thread.id)
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
