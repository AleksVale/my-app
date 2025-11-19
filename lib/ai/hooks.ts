'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { ClientMessage } from '../langgraph/hooks'

export function useAIChat() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, status, error } = useChat({
    // useChat automatically calls /api/chat
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      // Follow the documentation pattern
      sendMessage({ text: input.trim() })
      setInput('')
    }
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: status === 'submitted' || status === 'streaming',
    error,
  }
}

/**
 * Hook for agent-powered chat with LangGraph
 */
export function useAgentChat(initialThreadId?: string | null) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId || null
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ClientMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      parts: [{ type: 'text', text: input.trim() }],
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          threadId: threadId,
        }),
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        throw new Error(
          errorData.error || errorData.details || `HTTP ${response.status}`
        )
      }

      const data = await response.json()

      // Store thread ID for conversation continuity
      if (data.threadId && !threadId) {
        setThreadId(data.threadId)
      }

      // Add assistant message
      const assistantMessage: ClientMessage = {
        id: data.id || `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.content,
        parts: [{ type: 'text', text: data.content }],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setInput('')
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    threadId,
    setThreadId,
    clearMessages,
  }
}
