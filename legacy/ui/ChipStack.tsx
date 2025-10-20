import React from "react";
import Image from "next/image";
import { getUIImage } from "@/lib/utils/assets";

interface ChipStackProps {
  chips: number[];
}

export function ChipStack({ chips }: ChipStackProps) {
  if (chips.length === 0) {
    return (
      <div className="flex gap-0 justify-center items-end min-h-[55px]">
        <div className="text-gray-400 text-sm">Place your bet</div>
      </div>
    );
  }

  return (
    <div className="flex gap-0 justify-center items-end min-h-[55px]">
      {chips.map((chipValue, i) => (
        <div
          key={`${chipValue}-${i}`}
          className="relative"
          style={{ marginLeft: i > 0 ? "-20px" : "0" }}
        >
          <Image
            src={getUIImage(`chip-${chipValue}`)}
            alt={`$${chipValue} chip`}
            width={55}
            height={55}
            className="pixelated drop-shadow-lg"
          />
        </div>
      ))}
    </div>
  );
}

