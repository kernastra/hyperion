'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg dark:bg-night-black font-inter transition-colors p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600 text-center transition-colors">
        <h1 className="text-xl sm:text-2xl font-bold text-text-dark dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-text-muted dark:text-gray-300 text-sm lg:text-base mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
