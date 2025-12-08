"use client";

// কোনো ইমপোর্ট লাগবে না

export default function LogoMaker() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 gap-8">
      
      {/* 📸 নীল বক্স শুরু (স্ক্রিনশট এরিয়া) */}
      <div className="relative flex flex-col items-center justify-center w-64 h-64 bg-indigo-700 rounded-2xl shadow-2xl border-[4px] border-gray-100">
        
        <div className="flex flex-col items-center justify-center">
          
          {/* গ্রাজুয়েশন ক্যাপ (শার্প এবং মডার্ন SVG) */}
          <div className="mb-1 drop-shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="80" 
              height="80" 
              fill="black" // কালো রঙের ক্যাপ
            >
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7l-11-5zM3.18 8L12 4l8.82 4-8.82 4L3.18 8zM12 14l-7.5-3.41v4.18l7.5 3.41 7.5-3.41v-4.18L12 14z"/>
            </svg>
          </div>

          {/* FR লেখা (স্ট্রং এবং বোল্ড ফন্ট) */}
          <h1 className="text-white font-black text-7xl tracking-tighter drop-shadow-sm" style={{ fontFamily: 'sans-serif' }}>
            FR
          </h1>
          
          {/* ছোট ট্যাগলাইন (অপশনাল, প্রফেশনাল লুকের জন্য) */}
          <p className="text-indigo-200 text-xs font-medium tracking-widest uppercase mt-2">
            Faculty Review
          </p>

        </div>

      </div>
      {/* 📸 নীল বক্স শেষ */}

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-800">☝️ এটি একটি প্রফেশনাল ও মডার্ন ডিজাইন।</p>
        <p className="text-sm text-gray-600">পছন্দ হলে এটির স্ক্রিনশট নিন।</p>
      </div>
    </div>
  );
}