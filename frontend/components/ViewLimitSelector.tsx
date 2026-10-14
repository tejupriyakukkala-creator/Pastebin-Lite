"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

interface ViewLimitSelectorProps {
  value: number | null;
  onChange: (val: number | null) => void;
}

export function ViewLimitSelector({ value, onChange }: ViewLimitSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>("unlimited");
  const [customViews, setCustomViews] = useState<string>("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opt = e.target.value;
    setSelectedOption(opt);

    if (opt === "unlimited") {
      onChange(null);
    } else if (opt === "custom") {
      const parsed = parseInt(customViews, 10);
      onChange(isNaN(parsed) || parsed < 1 ? null : parsed);
    } else {
      onChange(parseInt(opt, 10));
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomViews(val);
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
        htmlFor="view-limit-select"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-main)",
        }}
      >
        <span className="icon-tile icon-tile-green" style={{ width: 22, height: 22, borderRadius: 6 }}>
          <Eye size={13} />
        </span>
        View Limit (optional)
      </label>

      <select
        id="view-limit-select"
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
        <option value="unlimited">Unlimited views</option>
        <option value="1">1 view (burn after reading)</option>
        <option value="5">5 views</option>
        <option value="10">10 views</option>
        <option value="25">25 views</option>
        <option value="custom">Custom</option>
      </select>

      {selectedOption === "custom" && (
        <input
          type="number"
          min={1}
          max={1000000}
          step={1}
          placeholder="Enter max views (e.g. 3)"
          value={customViews}
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
