import React from "react";
import { motion } from "framer-motion";

interface MessageDisplayProps {
  message: string;
  type?: "info" | "error";
}

export function MessageDisplay({ message, type = "info" }: MessageDisplayProps) {
  const styles =
    type === "error"
      ? "text-red-400 bg-red-900/30"
      : "text-white bg-black/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`text-sm px-4 py-2 rounded-lg ${styles}`}
    >
      {message}
    </motion.div>
  );
}

