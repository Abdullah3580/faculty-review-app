"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number; // কতক্ষণ পর অ্যানিমেশন শুরু হবে
  className?: string;
}

export default function FadeIn({ children, delay = 0, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // শুরুতে একটু নিচে এবং অদৃশ্য থাকবে
      whileInView={{ opacity: 1, y: 0 }} // স্ক্রিনে আসলে ভেসে উঠবে
      viewport={{ once: true }} // একবারই এনিমেট হবে
      transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}