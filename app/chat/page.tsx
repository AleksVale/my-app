'use client'

import { useAIChat } from '@/lib/ai/hooks'
import { useAuth } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'
// Simple markdown-like text renderer (install react-markdown later for full support)
function MessageContent({ content, role }: { content: string; role: string }) {
  // Basic text formatting - replace with react-markdown when installed
  const formatText = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Basic formatting
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
        line = line.replace(/`(.*?)`/g, '<code>$1</code>')

        // Handle lists
        if (line.match(/^[-*]\s/)) {
          return `<li>${line.substring(2)}</li>`
        }
        if (line.match(/^\d+\.\s/)) {
          const num = line.match(/^\d+/)?.[0] || ''
          return `<li value="${num}">${line.substring(num.length + 2)}</li>`
        }

        return line ? `<p>${line}</p>` : '<br/>'
      })
      .join('')
  }

  return (
    <div
      className={`text-sm leading-relaxed ${
        role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
      }`}
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  )
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useAIChat()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }
  }, [messages])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <nav className="fixed top-0 left-0 right-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
            >
              My App
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="chat-messages space-y-6">
            {messages.length === 0 && (
              <p className="text-zinc-500 dark:text-zinc-400">
                Start a conversation by typing a message below.
              </p>
            )}
            {messages.map((message) => {
              // Get text content from parts
              const textContent = message.parts?.find(part => part.type === 'text')?.text || ''

              return (
                <div
                  key={message.id}
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'ml-auto max-w-[80%] bg-blue-600 text-white shadow-lg'
                      : 'mr-auto max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                  }`}
                >
                  <div className="text-xs font-medium mb-2 opacity-75">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="message-content">
                    <MessageContent content={textContent} role={message.role} />
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="mr-auto max-w-[80%] rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                <div className="text-sm font-semibold mb-1">AI</div>
                <div className="text-zinc-500">Thinking...</div>
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
                <div className="font-medium">Error</div>
                <div className="text-sm mt-1">{error.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                'Send'
              )}
            </button>
          </form>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • AI responses may contain markdown formatting
          </div>
        </div>
      </div>
    </div>
  )
}

