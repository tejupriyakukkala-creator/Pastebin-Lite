"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface ExpirationSelectorProps {
  value: number | null;
  onChange: (val: number | null) => void;
}

export function ExpirationSelector({ value, onChange }: ExpirationSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>("never");
  const [customSeconds, setCustomSeconds] = useState<string>("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opt = e.target.value;
    setSelectedOption(opt);

    if (opt === "never") {
      onChange(null);
    } else if (opt === "custom") {
      const parsed = parseInt(customSeconds, 10);
      onChange(isNaN(parsed) || parsed < 1 ? null : parsed);
    } else {
      onChange(parseInt(opt, 10));
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomSeconds(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onChange(parsed);
    } else {
      onChange(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label
        htmlFor="expiration-select"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-main)",
        }}
      >
        <span className="icon-tile icon-tile-pink" style={{ width: 22, height: 22, borderRadius: 6 }}>
          <Clock size={13} />
        </span>
        Expiration (optional)
      </label>

      <select
        id="expiration-select"
        value={selectedOption}
        onChange={handleSelectChange}
        style={{
          height: 42,
          padding: "0 12px",
          background: "var(--color-input-bg)",
          border: "1px solid var(--color-input-border)",
          borderRadius: 8,
          fontSize: 14,
          color: "var(--color-text-main)",
          outline: "none",
        }}
      >
        <option value="never">Never expires</option>
        <option value="60">1 minute</option>
        <option value="600">10 minutes</option>
        <option value="3600">1 hour</option>
        <option value="86400">1 day</option>
        <option value="604800">7 days</option>
        <option value="custom">Custom (seconds)</option>
      </select>

      {selectedOption === "custom" && (
        <input
          type="number"
          min={1}
          max={315360000}
          step={1}
          placeholder="Enter seconds (e.g. 300)"
          value={customSeconds}
          onChange={handleCustomChange}
          style={{
            height: 38,
            padding: "0 12px",
            background: "var(--color-input-bg)",
            border: "1px solid var(--color-input-border)",
            borderRadius: 8,
            fontSize: 14,
            color: "var(--color-text-main)",
            outline: "none",
            marginTop: 4,
          }}
        />
      )}
    </div>
  );
}
