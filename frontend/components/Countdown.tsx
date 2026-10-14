"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDateIso: string;
}

export function Countdown({ targetDateIso }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const target = new Date(targetDateIso).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(`in ${parts.join(" ")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateIso]);

  if (!timeLeft) {
    return null;
  }

  return (
    <span
      style={{
        fontWeight: 600,
        color: timeLeft === "Expired" ? "var(--color-danger)" : "inherit",
      }}
    >
      {timeLeft}
    </span>
  );
}
