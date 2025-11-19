'use client'

import { useAgentChat } from '@/lib/ai/hooks'
import { useConversations, ClientMessage } from '@/lib/langgraph/hooks'
import { useAuth } from '@/lib/supabase/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { SignOutButton } from '@/components/SignOutButton'
import { ConversationSidebar } from '@/components/ConversationSidebar'
import ReactMarkdown from 'react-markdown'
import { BaseMessage } from '@langchain/core/messages'
import { ChatSkeleton } from '@/components/ChatSkeleton'

// Component to render message content with markdown support using react-markdown
function MessageContent({ content, role }: { content: string; role: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const isCodeBlock = className && className.includes('language-')
          return isCodeBlock ? (
            <pre
              className={`my-2 overflow-x-auto rounded-md bg-gray-100 p-3 font-mono text-sm dark:bg-gray-800 ${
                role === 'user'
                  ? 'border border-blue-400/30 bg-blue-500/10'
                  : ''
              }`}
            >
              <code className={className}>{children}</code>
            </pre>
          ) : (
            <code
              className={`${
                role === 'user'
                  ? 'border border-blue-400/30 bg-blue-500/20 text-blue-100'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              } rounded px-2 py-1 font-mono text-sm`}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
        },
        ul({ children }) {
          return (
            <ul className="mb-3 ml-4 list-inside list-disc space-y-1">
              {children}
            </ul>
          )
        },
        ol({ children }) {
          return (
            <ol className="mb-3 ml-4 list-inside list-decimal space-y-1">
              {children}
            </ol>
          )
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>
        },
        blockquote({ children }) {
          return (
            <blockquote
              className={`my-3 border-l-4 pl-4 italic ${
                role === 'user'
                  ? 'border-blue-400 bg-blue-500/5'
                  : 'border-gray-400 bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50'
              }`}
            >
              {children}
            </blockquote>
          )
        },
        h1({ children }) {
          return (
            <h1 className="mt-4 mb-3 text-xl font-bold first:mt-0">
              {children}
            </h1>
          )
        },
        h2({ children }) {
          return (
            <h2 className="mt-3 mb-2 text-lg font-bold first:mt-0">
              {children}
            </h2>
          )
        },
        h3({ children }) {
          return (
            <h3 className="mt-3 mb-2 text-base font-semibold first:mt-0">
              {children}
            </h3>
          )
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        em({ children }) {
          return <em className="italic">{children}</em>
        },
        hr() {
          return (
            <hr
              className={`my-4 border-t ${
                role === 'user'
                  ? 'border-blue-400/30'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
          )
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              className={`${
                role === 'user'
                  ? 'text-blue-200 hover:text-blue-100'
                  : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              } underline transition-colors hover:no-underline`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

import { Suspense } from 'react'

function ChatContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  // Conversation management
  const {
    conversations,
    currentConversation,
    loadConversation,
    startNewConversation,
    addMessagesToCurrent,
    loading: conversationsLoading,
  } = useConversations(user?.id || null)

  // Always use agent mode
  const agentChat = useAgentChat(currentConversation?.thread_id)

  // Use agent chat
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    agentChat

  // Get URL search parameters
  const searchParams = useSearchParams()

  // Function to scroll to bottom with smooth behavior
  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    requestAnimationFrame(() => {
      // The scrollable container is the parent of the parent of .chat-messages
      const chatMessages = document.querySelector('.chat-messages')
      const scrollableContainer = chatMessages?.parentElement
        ?.parentElement as HTMLElement

      if (scrollableContainer) {
        scrollableContainer.scrollTo({
          top: scrollableContainer.scrollHeight,
          behavior,
        })
      } else {
        console.log('Scrollable container not found for smooth scroll')
      }
    })
  }

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation) {
        setIsSwitching(true)
        try {
          await loadConversation(conversationId)

          // Always use agent mode - clear messages and set threadId
          const { setThreadId, clearMessages } = agentChat
          if (clearMessages) {
            clearMessages()
          }
          if (setThreadId) {
            setThreadId(conversation.thread_id)
          }

          // Update URL to persist conversation ID
          router.replace(`/chat?id=${conversationId}`, { scroll: false })

          // Scroll to bottom after conversation is loaded
          const scrollToBottom = () => {
            // The scrollable container is the parent of the parent of .chat-messages
            const chatMessages = document.querySelector('.chat-messages')
            const scrollableContainer = chatMessages?.parentElement
              ?.parentElement as HTMLElement

            if (scrollableContainer) {
              console.log(
                'Scrolling to bottom, scrollHeight:',
                scrollableContainer.scrollHeight
              )
              scrollableContainer.scrollTop = scrollableContainer.scrollHeight
            } else {
              console.log('Scrollable container not found')
            }
          }

          // Try scrolling multiple times with increasing delays
          setTimeout(scrollToBottom, 100)
          setTimeout(scrollToBottom, 200)
          setTimeout(scrollToBottom, 500)
        } finally {
          setIsSwitching(false)
        }
      }
    },
    [conversations, loadConversation, agentChat, router]
  )

  // Handle new conversation
  const handleNewConversation = () => {
    // Always create conversations in agent mode
    startNewConversation('agent')

    // Clear threadId and messages for agent chat when starting new conversation
    const { setThreadId, clearMessages } = agentChat
    if (clearMessages) {
      clearMessages()
    }
    if (setThreadId) {
      setThreadId(null)
    }

    // Clear conversation ID from URL
    router.replace('/chat', { scroll: false })
  }

  // Get current messages - prefer conversation messages, fallback to hook messages
  const displayMessages = currentConversation?.messages || messages

  // Update agent chat threadId when conversation changes
  useEffect(() => {
    if (currentConversation) {
      const { setThreadId } = agentChat
      if (setThreadId) {
        setThreadId(currentConversation.thread_id)
      }
    }
  }, [currentConversation, agentChat])

  // Add new agent chat messages to current conversation
  useEffect(() => {
    if (currentConversation && agentChat.messages.length > 0) {
      // Only add messages that aren't already in the conversation
      const existingMessageIds = new Set(
        currentConversation.messages.map((m) => m.id)
      )
      const newMessages = agentChat.messages.filter(
        (m) => !existingMessageIds.has(m.id)
      )

      if (newMessages.length > 0) {
        addMessagesToCurrent(newMessages)
      }
    }
  }, [currentConversation, agentChat.messages, addMessagesToCurrent])

  // Scroll to bottom when display messages change or during loading (streaming)
  useEffect(() => {
    if (displayMessages.length > 0) {
      scrollToBottom()
    }
  }, [displayMessages, isLoading])

  // Load conversation from URL on mount (after conversations are loaded)
  useEffect(() => {
    const conversationId = searchParams.get('id')
    if (
      conversationId &&
      conversations.length > 0 &&
      !currentConversation &&
      user?.id
    ) {
      // Only load if we have conversations loaded, no current conversation, and user is authenticated
      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation) {
        handleConversationSelect(conversationId)
      } else {
        // If conversation not found, remove invalid ID from URL
        router.replace('/chat', { scroll: false })
      }
    }
  }, [
    conversations,
    currentConversation,
    user?.id,
    searchParams,
    handleConversationSelect,
    router,
  ])

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        loading={conversationsLoading}
      />

      {/* Main Chat Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentConversation?.title || 'New Chat'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Agent Mode Indicator */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1 dark:bg-blue-900/30">
              <svg
                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Agent Mode
              </span>
            </div>

            <span className="hidden text-sm text-gray-600 sm:block dark:text-gray-400">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-4xl">
            <div className="chat-messages space-y-6">
              {conversationsLoading || isSwitching ? (
                <ChatSkeleton />
              ) : displayMessages.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Agent Mode Active
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Agent mode uses specialized AI agents for weather, news, and
                    general queries. Try asking about weather or news!
                  </p>
                </div>
              ) : (
                displayMessages.map((message, index) => {
                  // Handle both UIMessage format and BaseMessage format
                  const isUIMessage = 'parts' in message

                  let textContent = ''
                  let messageRole: 'user' | 'assistant' | 'system' = 'user'

                  if (isUIMessage) {
                    // Handle UIMessage format
                    const uiMessage = message as ClientMessage
                    textContent =
                      uiMessage.parts?.find((part) => part.type === 'text')
                        ?.text || ''
                    messageRole = uiMessage.role
                  } else {
                    // Handle BaseMessage format
                    const baseMessage = message as BaseMessage
                    if (typeof baseMessage.content === 'string') {
                      textContent = baseMessage.content
                    } else if (Array.isArray(baseMessage.content)) {
                      textContent = baseMessage.content
                        .filter(
                          (part: unknown) =>
                            typeof part === 'object' &&
                            part !== null &&
                            'type' in part &&
                            part.type === 'text'
                        )
                        .map((part: unknown) => {
                          const textPart = part as { text?: string }
                          return textPart.text || ''
                        })
                        .join('')
                    } else {
                      textContent = JSON.stringify(baseMessage.content)
                    }
                    messageRole =
                      baseMessage._getType() === 'human' ? 'user' : 'assistant'
                  }

                  return (
                    <div
                      key={isUIMessage ? message.id : `msg-${index}`}
                      className={`rounded-lg p-4 ${
                        messageRole === 'user'
                          ? 'ml-auto max-w-[80%] bg-blue-600 text-white shadow-lg'
                          : 'mr-auto max-w-[80%] border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="mb-2 text-xs font-medium opacity-75">
                        {messageRole === 'user' ? 'You' : 'AI Assistant'}
                      </div>
                      <div className="message-content">
                        <MessageContent
                          content={textContent}
                          role={messageRole}
                        />
                      </div>
                    </div>
                  )
                })
              )}
              {isLoading && (
                <div className="mr-auto max-w-[80%] rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                  <div className="mb-2 text-sm font-semibold">AI</div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-100 p-4 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
                  <div className="font-medium">Error</div>
                  <div className="mt-1 text-sm">{error.message}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-4xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about weather, news, or anything else..."
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Sending...
                  </div>
                ) : (
                  'Send'
                )}
              </button>
            </form>
            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send • Agent mode with weather & news capabilities
              • Powered by LangGraph
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-lg text-gray-600 dark:text-gray-400">
              Loading chat...
            </div>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
