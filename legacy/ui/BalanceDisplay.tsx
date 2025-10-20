import React from "react";

interface BalanceDisplayProps {
  balance: number;
  onAddFunds?: () => void;
}

export function BalanceDisplay({ balance, onAddFunds }: BalanceDisplayProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{
        backgroundColor: "#0000004D",
        borderRadius: "999px",
      }}
    >
      <span className="text-base tracking-wider leading-tight">
        ${balance.toLocaleString()}
      </span>
      <button
        onClick={onAddFunds}
        className="w-6 h-6 flex items-center justify-center text-base hover:opacity-80 transition-opacity rounded"
        style={{ backgroundColor: "#2C5644" }}
        title="Add funds (coming soon)"
      >
        <span className="leading-none">+</span>
      </button>
    </div>
  );
}

