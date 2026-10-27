import React from "react";

interface BackgroundPlusProps {
  className?: string;
  plusColor?: string;
  plusSize?: number;
  fade?: boolean;
}

export const BackgroundPlus: React.FC<BackgroundPlusProps> = ({
  className = "",
  plusColor = "#3b82f6",
  plusSize = 40,
  fade = true,
}) => {
  const patternId = `plus-pattern-${plusSize}-${plusColor.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        maskImage: fade
          ? "radial-gradient(circle at center, black 40%, transparent 85%)"
          : undefined,
        WebkitMaskImage: fade
          ? "radial-gradient(circle at center, black 40%, transparent 85%)"
          : undefined,
      }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={patternId}
            width={plusSize}
            height={plusSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${plusSize / 2 - 4} ${plusSize / 2} H ${plusSize / 2 + 4} M ${plusSize / 2} ${plusSize / 2 - 4} V ${plusSize / 2 + 4}`}
              stroke={plusColor}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

export default BackgroundPlus;
