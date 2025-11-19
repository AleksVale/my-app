'use client'

import { useState } from 'react'
import { Conversation } from '@/lib/langgraph/persistence'

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  loading?: boolean
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
  loading = false,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.thread_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 h-full border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${isCollapsed ? 'w-16' : 'w-80'} `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform dark:text-gray-400 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          {!isCollapsed ? (
            <button
              onClick={onNewConversation}
              className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Chat
            </button>
          ) : (
            <button
              onClick={onNewConversation}
              className="flex w-full justify-center rounded-lg bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
              title="New Chat"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="relative">
              <svg
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              {!isCollapsed && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading conversations...
                </p>
              )}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              {!isCollapsed ? (
                <div>
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No conversations yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Start a new chat to begin
                  </p>
                </div>
              ) : (
                <svg
                  className="mx-auto h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`mb-1 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    currentConversationId === conversation.id
                      ? 'border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  } `}
                  title={
                    isCollapsed ? conversation.title || 'Untitled' : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        currentConversationId === conversation.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            currentConversationId === conversation.id
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {conversation.title || 'Untitled Conversation'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile (when sidebar is expanded) */}
      {!isCollapsed && (
        <div
          className="bg-opacity-50 fixed inset-0 z-10 bg-black lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
    </>
  )
}
