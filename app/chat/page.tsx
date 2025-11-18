'use client'

import { useAIChat } from '@/lib/ai/hooks'
import { useAuth } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'
import ReactMarkdown from 'react-markdown'

// Component to render message content with markdown support using react-markdown
function MessageContent({ content, role }: { content: string; role: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const isCodeBlock = className && className.includes('language-')
          return isCodeBlock ? (
            <pre className={`bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2 overflow-x-auto text-sm font-mono ${
              role === 'user' ? 'bg-blue-500/10 border border-blue-400/30' : ''
            }`}>
              <code className={className}>
                {children}
              </code>
            </pre>
          ) : (
            <code
              className={`${
                role === 'user'
                  ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } px-2 py-1 rounded text-sm font-mono`}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>
        },
        blockquote({ children }) {
          return (
            <blockquote className={`border-l-4 pl-4 italic my-3 ${
              role === 'user'
                ? 'border-blue-400 bg-blue-500/5'
                : 'border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50'
            }`}>
              {children}
            </blockquote>
          )
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        em({ children }) {
          return <em className="italic">{children}</em>
        },
        hr() {
          return <hr className={`my-4 border-t ${
            role === 'user' ? 'border-blue-400/30' : 'border-gray-300 dark:border-gray-600'
          }`} />
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              className={`${
                role === 'user'
                  ? 'text-blue-200 hover:text-blue-100'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
              } underline hover:no-underline transition-colors`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
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

