import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getUIImage } from "@/lib/utils/assets";

interface ChipButtonProps {
  value: number;
  onClick: () => void;
  disabled?: boolean;
}

export function ChipButton({ value, onClick, disabled = false }: ChipButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.15, rotate: 5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Bet $${value}`}
    >
      <Image
        src={getUIImage(`chip-${value}`)}
        alt={`$${value} chip`}
        width={50}
        height={50}
        className="pixelated"
      />
    </motion.button>
  );
}

