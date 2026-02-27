"use client";

import { useEffect, useRef, useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ placeholder = "Search...", value = "", onChange }: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Only trigger debounce when the typed value changes, not on every parent re-render
  useEffect(() => {
    const t = setTimeout(() => onChangeRef.current(local), 300);
    return () => clearTimeout(t);
  }, [local]);

  useEffect(() => { setLocal(value); }, [value]);

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      />
    </div>
  );
}
