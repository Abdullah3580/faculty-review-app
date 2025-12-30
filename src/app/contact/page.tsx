"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Mail, MessageSquare, MapPin, Send, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string | null>(null); // 'email', 'chat', 'location'
  
  // ফর্ম ডাটা (ইমেইল অটোমেটিক যাবে, তাই ইনপুট দরকার নেই)
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTab = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(null); // আবার ক্লিক করলে বন্ধ হবে
    } else {
      setActiveTab(tab);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          userName: session.user.name || "Student",
          subject,
          message,
        }),
      });

      if (res.ok) {
        toast.success("Message sent successfully!");
        setSubject("");
        setMessage("");
        setActiveTab(null); // সফল হলে ট্যাব বন্ধ করে দিবে
      } else {
        toast.error("Failed to send message. Try again.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 pb-20 px-4">
      
      {/* হেডার */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Help Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select an option below to connect with us.
        </p>
      </div>

      {/* মেইন কার্ড কন্টেইনার */}
      <div className="max-w-xl mx-auto space-y-4">
        
        {/* অপশন ১: ইমেইল (বাটন ও ফর্ম) */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border transition-all duration-300 overflow-hidden ${activeTab === 'email' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-800'}`}>
          <button 
            onClick={() => toggleTab('email')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                <Mail size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Email Support</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Report reviews, bugs, or feedback</p>
              </div>
            </div>
            {activeTab === 'email' ? <ChevronUp className="text-indigo-500" /> : <ChevronDown className="text-gray-400" />}
          </button>

          {/* ইমেইল ফর্ম (লুকানো অংশ) */}
          {activeTab === 'email' && (
            <div className="px-6 pb-8 pt-2 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
              
              {!session ? (
                <div className="text-center py-6 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle />
                  <p>You need to login to send a message.</p>
                  <Link href="/login" className="text-indigo-600 underline font-bold">Login Here</Link>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4 animate-fadeIn">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Sending as: <span className="font-bold text-gray-800 dark:text-gray-200">{session.user?.email}</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <select 
                      required
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-indigo-500"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option value="">Select a topic...</option>
                      <option value="Report Review">🚩 Report a Review</option>
                      <option value="Bug Report">🐛 Report a Bug</option>
                      <option value="Suggestion">💡 Feature Suggestion</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Message</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-indigo-500"
                      placeholder="Write your details here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : <>Send Email <Send size={18} /></>}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* অপশন ২: লাইভ চ্যাট */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <button 
                onClick={() => toggleTab('chat')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
                <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                    <MessageSquare size={24} />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Live Chat</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Talk to an admin directly</p>
                </div>
                </div>
                {activeTab === 'chat' ? <ChevronUp className="text-purple-500" /> : <ChevronDown className="text-gray-400" />}
            </button>
            
            {activeTab === 'chat' && (
                <div className="p-8 bg-purple-50 dark:bg-purple-900/10 border-t border-purple-100 text-center flex flex-col items-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
                    Available: 10 AM - 6 PM
                </p>
                
                {/* WhatsApp Button Corrected */}
                <a 
                    href="https://wa.me/8801317190020" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                    <MessageSquare size={20} />
                    Chat on WhatsApp
                </a>
                </div>
            )}
            </div>

        {/* অপশন ৩: লোকেশন */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
           <button 
            onClick={() => toggleTab('location')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <MapPin size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Our Office</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Visit us on campus</p>
              </div>
            </div>
            {activeTab === 'location' ? <ChevronUp className="text-green-500" /> : <ChevronDown className="text-gray-400" />}
          </button>
          
          {activeTab === 'location' && (
            <div className="p-6 bg-green-50 dark:bg-green-900/10 border-t border-green-100 text-center">
              <p className="text-sm text-gray-500">University Campus,UIU</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}