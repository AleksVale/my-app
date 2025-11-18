'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export function useAIChat() {
  const [input, setInput] = useState('')

  const chat = useChat({
    id: 'ai-chat', // Optional: unique identifier for the chat session
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      chat.sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: input.trim() }]
      })
      setInput('')
    }
  }

  return {
    messages: chat.messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chat.status === 'streaming' || chat.status === 'submitted',
    error: chat.error,
  }
}
