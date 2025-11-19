import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                My App
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/chat"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Chat
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          {user ? (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
                Welcome back!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                You&apos;re signed in as {user.email}
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/chat"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Go to Chat
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
                Welcome to My App
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Get started by signing in to your account
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
