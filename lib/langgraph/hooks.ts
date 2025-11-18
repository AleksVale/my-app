import { useState, useEffect } from 'react'
import { Conversation } from './persistence'
import { BaseMessage } from '@langchain/core/messages'

// Client-side message format
export interface ClientMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parts: Array<{ type: string; text?: string }>
  timestamp?: string
}

export interface ConversationWithMessages extends Conversation {
  messages: ClientMessage[]
}

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ConversationWithMessages | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user conversations via API
  const loadConversations = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await fetch('/api/conversations')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
      console.error('Load conversations error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load a specific conversation with messages via API
  const loadConversation = async (conversationId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/conversations/${conversationId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const { conversation, messages } = data

      setCurrentConversation({
        ...conversation,
        messages: messages || []
      })

      // Update conversations list if this conversation wasn't in it
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversationId)
        if (!exists) {
          return [conversation, ...prev]
        }
        return prev
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation')
      console.error('Load conversation error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Start a new conversation
  const startNewConversation = async () => {
    try {
      setLoading(true)
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          title: 'New Conversation'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const conversation = data.conversation

      setCurrentConversation({
        ...conversation,
        messages: []
      })

      // Add to conversations list
      setConversations(prev => [conversation, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      console.error('Start new conversation error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update conversation title
  const updateConversationTitle = (conversationId: string, title: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, title } : conv
    ))

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => prev ? { ...prev, title } : null)
    }
  }

  // Add messages to current conversation
  const addMessagesToCurrent = (messages: ClientMessage[]) => {
    if (currentConversation) {
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, ...messages],
        updated_at: new Date().toISOString()
      } : null)
    }
  }

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      loadConversations()
    }
  }, [userId])

  return {
    conversations,
    currentConversation,
    loading,
    error,
    loadConversations,
    loadConversation,
    startNewConversation,
    updateConversationTitle,
    addMessagesToCurrent,
    refreshConversations: loadConversations
  }
}
