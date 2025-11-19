import React from 'react'

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse p-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-1 w-full rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
