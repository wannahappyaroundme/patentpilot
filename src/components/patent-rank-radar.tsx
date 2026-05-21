"use client";
import { useId, useState } from "react";
import type { PatentRankBreakdown } from "@/lib/patent-rank";
import { AXIS_META } from "@/lib/patent-rank";

interface Props {
  scores: PatentRankBreakdown;
  size?: number;
}

const AXES: Array<keyof Omit<PatentRankBreakdown, "overall">> = [
  "inv",
  "imp",
  "mkt",
  "net",
  "com",
];

export function PatentRankRadar({ scores, size = 280 }: Props) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 44;
  const labelRadius = radius + 22;

  // 5각형 꼭지점 계산 (12시 시작, 시계방향)
  const points = AXES.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const value = scores[axis] / 100;
    return {
      axis,
      angle,
      x: cx + Math.cos(angle) * radius * value,
      y: cy + Math.sin(angle) * radius * value,
      labelX: cx + Math.cos(angle) * labelRadius,
      labelY: cy + Math.sin(angle) * labelRadius,
      vertexX: cx + Math.cos(angle) * radius,
      vertexY: cy + Math.sin(angle) * radius,
      value: scores[axis],
    };
  });

  // 배경 펜타곤 (4단계 grid)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  function pentagonPath(scale: number): string {
    return (
      AXES.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius * scale;
        const y = cy + Math.sin(angle) * radius * scale;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      }).join(" ") + " Z"
    );
  }

  const valuePath =
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ") + " Z";

  return (
    <div className="relative">
      <svg width={size} height={size} role="img" aria-label="PatentRank 5축 점수">
        <defs>
          <radialGradient id={`grad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#006EFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#006EFF" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* 배경 grid */}
        {gridLevels.map((s) => (
          <path
            key={s}
            d={pentagonPath(s)}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={s === 1 ? 1.5 : 1}
          />
        ))}

        {/* 축 라인 */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.vertexX}
            y2={p.vertexY}
            stroke="#E2E8F0"
            strokeWidth={1}
          />
        ))}

        {/* 값 영역 */}
        <path
          d={valuePath}
          fill={`url(#grad-${id})`}
          stroke="#006EFF"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* 값 점 */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 4}
              fill="#006EFF"
              stroke="white"
              strokeWidth={2}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
          </g>
        ))}

        {/* 라벨 */}
        {points.map((p, i) => {
          const meta = AXIS_META[p.axis];
          // 왼쪽/오른쪽 텍스트 정렬
          const isLeft = p.labelX < cx - 4;
          const isRight = p.labelX > cx + 4;
          const anchor = isLeft ? "end" : isRight ? "start" : "middle";
          return (
            <g key={`label-${i}`}>
              <text
                x={p.labelX}
                y={p.labelY - 2}
                textAnchor={anchor}
                fontSize={11}
                fontWeight={700}
                fill="#0B1220"
              >
                {meta.name}
              </text>
              <text
                x={p.labelX}
                y={p.labelY + 11}
                textAnchor={anchor}
                fontSize={10}
                fontWeight={600}
                fill="#006EFF"
              >
                {p.value}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 호버 툴팁 */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border border-ink-100 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ maxWidth: 240 }}
        >
          <div className="font-semibold text-ink-900">
            {AXIS_META[points[hover]!.axis].name}{" "}
            <span className="text-ink-400">({AXIS_META[points[hover]!.axis].full})</span>
          </div>
          <div className="mt-0.5 text-brand font-mono font-semibold">
            {points[hover]!.value} / 100
          </div>
          <div className="mt-1 text-[10px] text-ink-500 leading-tight">
            {AXIS_META[points[hover]!.axis].cite}
          </div>
        </div>
      )}
    </div>
  );
}
