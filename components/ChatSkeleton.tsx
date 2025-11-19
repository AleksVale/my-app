import React from 'react'

export function ChatSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* AI Message Skeleton */}
      <div className="mr-auto max-w-[80%] rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-[90%] rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-[95%] rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* User Message Skeleton */}
      <div className="ml-auto max-w-[80%] rounded-lg bg-blue-600/50 p-4 shadow-lg">
        <div className="mb-2 h-3 w-16 rounded bg-white/20"></div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-white/20"></div>
          <div className="h-4 w-[85%] rounded bg-white/20"></div>
        </div>
      </div>

      {/* AI Message Skeleton */}
      <div className="mr-auto max-w-[80%] rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-[92%] rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-[88%] rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-[60%] rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* User Message Skeleton */}
      <div className="ml-auto max-w-[80%] rounded-lg bg-blue-600/50 p-4 shadow-lg">
        <div className="mb-2 h-3 w-16 rounded bg-white/20"></div>
        <div className="space-y-2">
          <div className="h-4 w-[95%] rounded bg-white/20"></div>
        </div>
      </div>
    </div>
  )
}
