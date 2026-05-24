"use client";

import { useState, useEffect } from "react";

interface NumberInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
}

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  className,
  placeholder,
}: NumberInputProps) {
  const [display, setDisplay] = useState(String(value));

  // Sync display when the external value changes (e.g. adjust +/- buttons)
  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow empty string so the user can fully clear the field
    setDisplay(raw);

    if (raw === "") return;

    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;

    // Only propagate when valid and within bounds
    const aboveMin = min === undefined || parsed >= min;
    const belowMax = max === undefined || parsed <= max;
    if (aboveMin && belowMax) {
      onChange(parsed);
    }
  }

  function handleBlur() {
    const parsed = parseInt(display, 10);
    const isValid =
      !isNaN(parsed) &&
      (min === undefined || parsed >= min) &&
      (max === undefined || parsed <= max);

    if (!isValid) {
      // Reset display to current valid value from props
      setDisplay(String(value));
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
}
