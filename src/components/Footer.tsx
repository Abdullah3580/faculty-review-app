import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 justify-center md:justify-start">
              <span className="text-2xl">🎓</span> Faculty Review
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              &copy; {new Date().getFullYear()} UIU Faculty Review. Built for students.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Home
            </Link>
            <Link href="/compare" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Compare
            </Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              About Us
            </Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Privacy Policy
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}