'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

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
      console.log('📤 Enviando mensagem:', input.trim())
      // Follow the documentation pattern
      sendMessage({ text: input.trim() })
      setInput('')
    }
  }

  // Debug logs
  if (typeof window !== 'undefined') {
    console.log('🎯 useAIChat status:', status)
    console.log('🎯 useAIChat messages count:', messages.length)
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
export function useAgentChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
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
      console.log('🤖 Sending to agent-chat API...')
      
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          threadId: threadId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Agent response received')

      // Store thread ID for conversation continuity
      if (data.threadId && !threadId) {
        setThreadId(data.threadId)
        console.log('🧵 Thread ID stored:', data.threadId)
      }

      // Add assistant message
      const assistantMessage = {
        id: data.id || `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.content,
        parts: [{ type: 'text', text: data.content }],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Agent chat error:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    threadId,
  }
}
