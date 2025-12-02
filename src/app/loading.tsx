export default function Loading() {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8"></div>
      
      {/* Hero Section Skeleton */}
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-12"></div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        ))}
      </div>

      {/* Faculty List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}