"use client";
import { useEffect, useState } from "react";

const LINES = [
  "잠자는 한국 R&D 특허를 찾아보세요",
  "곧 유지비 만기인 매물을 발굴해보세요",
  "기술이 필요한 기업과 매칭해보세요",
];

export function RotatingText() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % LINES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="relative h-7 overflow-hidden text-sm font-medium text-ink-500 sm:h-8 sm:text-base">
      {LINES.map((line, i) => (
        <p
          key={line}
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            transform: `translateY(${(i - idx) * 100}%)`,
            opacity: i === idx ? 1 : 0,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
