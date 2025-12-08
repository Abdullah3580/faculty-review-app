export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 mb-16">
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[2.5rem] h-[400px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 flex flex-col items-center justify-center animate-pulse">
          
          <div className="h-6 w-64 bg-gray-100 dark:bg-gray-800 rounded-full mb-6"></div>
          
          <div className="h-12 w-3/4 md:w-1/2 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
          <div className="h-12 w-2/3 md:w-1/3 bg-gray-200 dark:bg-gray-800 rounded-full mb-8"></div>
          
          <div className="w-full max-w-2xl h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between animate-pulse">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="h-8 w-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative animate-pulse">
              
              <div className="absolute top-6 right-6 h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-full"></div>

              <div className="mb-6 pr-24">
                <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
                <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4"></div>
                
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl mb-6">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>

              <div className="space-y-3">
                <div className="h-24 bg-gray-50 dark:bg-gray-800/30 rounded-2xl w-full border border-gray-100 dark:border-gray-800"></div>
                <div className="h-24 bg-gray-50 dark:bg-gray-800/30 rounded-2xl w-full border border-gray-100 dark:border-gray-800 opacity-60"></div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}