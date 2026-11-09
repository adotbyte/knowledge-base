export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

export function NoteSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <SkeletonBlock className="h-6 w-1/2" />
        <SkeletonBlock className="h-6 w-6 rounded-full" />
      </div>
      <SkeletonBlock className="mb-2 h-4 w-full" />
      <SkeletonBlock className="mb-2 h-4 w-5/6" />
      <SkeletonBlock className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-6 w-16" />
        <SkeletonBlock className="h-6 w-16" />
      </div>
    </div>
  );
}

export function NoteListSkeleton() {
  return (
    <div className="space-y-4">
      <NoteSkeleton />
      <NoteSkeleton />
      <NoteSkeleton />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <SkeletonBlock className="mb-4 h-6 w-1/3" />
      <SkeletonBlock className="mb-2 h-4 w-1/4" />
      <SkeletonBlock className="mb-4 h-10 w-full" />
      <SkeletonBlock className="mb-2 h-4 w-1/4" />
      <SkeletonBlock className="mb-4 h-32 w-full" />
      <SkeletonBlock className="h-10 w-full" />
    </div>
  );
}
