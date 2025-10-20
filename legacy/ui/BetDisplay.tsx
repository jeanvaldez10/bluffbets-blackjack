import React from "react";

interface BetDisplayProps {
  amount: number;
}

export function BetDisplay({ amount }: BetDisplayProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 mb-3 inline-flex"
      style={{
        backgroundColor: "#0000004D",
        borderRadius: "999px",
      }}
    >
      <span className="text-base tracking-wider leading-tight">
        BET: ${amount || 0}
      </span>
    </div>
  );
}

