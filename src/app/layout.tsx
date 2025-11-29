import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Footer from "@/components/Footer"; // ✅ ১. Footer ইমপোর্ট করা হলো

// ১. বডি ফন্ট
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

// ২. হেডিং ফন্ট
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});

export const metadata: Metadata = {
  title: "Faculty Review App",
  description: "Review your university faculty members anonymously",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Toaster position="bottom-right" toastOptions={{ 
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
              }
            }} />
            
            {/* ✅ Sticky Footer লেআউট স্ট্রাকচার */}
            <div className="flex flex-col min-h-screen">
              
              {/* মেইন কন্টেন্ট (ফ্লেক্স গ্রো দিয়ে বাকি জায়গা নিবে) */}
              <main className="flex-grow">
                {children}
              </main>

              {/* ফুটার সবার নিচে থাকবে */}
              <Footer />
            </div>

            {/* নোট: ThemeSwitcher এখান থেকে সরিয়ে দেওয়া হয়েছে কারণ এটি এখন হেডার বা হোম পেজে আছে */}
            
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}