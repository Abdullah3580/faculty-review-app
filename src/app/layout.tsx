// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher"; // ১. বাটন ইমপোর্ট

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
            
            {/* ২. পেজের কন্টেন্ট */}
            {children}

            {/* ৩. বাটনটি এখানে বসানো হলো (সবার উপরে ভাসবে) */}
            <ThemeSwitcher />
            
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}