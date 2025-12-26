"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function SessionGuard() {
  const { data: session } = useSession();
  const toastShown = useRef(false); 

  useEffect(() => {
    // @ts-ignore
    if (session?.error === "UserDeleted" && !toastShown.current) {
      toastShown.current = true;

      toast.error("Your account has been deleted. Logging out...", {
        duration: 4000,
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
          background: '#fff',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#FFFAEE',
        },
      });

      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/login" }); 
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [session]);

  return null;
}