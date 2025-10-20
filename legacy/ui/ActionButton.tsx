import React from "react";
import { motion } from "framer-motion";

type ButtonVariant = "green" | "red" | "blue" | "orange" | "gray";

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  green: "bg-green-500 hover:bg-green-600 active:bg-green-700",
  red: "bg-red-500 hover:bg-red-600 active:bg-red-700",
  blue: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
  orange: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
  gray: "bg-gray-600 hover:bg-gray-700 active:bg-gray-800",
};

export function ActionButton({
  onClick,
  disabled = false,
  variant = "gray",
  children,
}: ActionButtonProps) {
  const baseStyles =
    "px-10 py-4 rounded-xl text-xl font-bold tracking-wider shadow-[0_4px_0_0_rgba(0,0,0,0.3)] transition-colors duration-100 cursor-pointer";
  const disabledStyles =
    "disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={
        !disabled
          ? { scale: 0.98, y: 4, boxShadow: "0 0 0 0 rgba(0,0,0,0.3)" }
          : {}
      }
      transition={{ duration: 0.1 }}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles}`}
    >
      {children}
    </motion.button>
  );
}

