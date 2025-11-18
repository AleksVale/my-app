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
