'use client'

import { useAIChat } from '@/lib/ai/hooks'
import { useAuth } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useAIChat()

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
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              My App
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold">AI Chat</h1>
          <div className="mb-4 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {messages.length === 0 && (
              <p className="text-zinc-500 dark:text-zinc-400">
                Start a conversation by typing a message below.
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'ml-auto max-w-[80%] bg-blue-500 text-white'
                    : 'mr-auto max-w-[80%] bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'AI'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto max-w-[80%] rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                <div className="text-sm font-semibold mb-1">AI</div>
                <div className="text-zinc-500">Thinking...</div>
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-900 dark:text-red-200">
                Error: {error.message}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

