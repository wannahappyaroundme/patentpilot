import type { PatentRow } from "@/lib/types";
import { patentRank, patentRankGrade } from "@/lib/patent-rank";

interface Props {
  patent: PatentRow;
  size?: number;
  showScore?: boolean;
}

const AXES: Array<keyof ReturnType<typeof patentRank>> = [
  "inv",
  "imp",
  "mkt",
  "net",
  "com",
];

/**
 * 매물 카드 / 매칭 후보 / 관련 매물에 들어가는 작은 5축 레이더 + 등급 배지.
 * D등급(35점 미만)은 회색조 + "정보 부족" 라벨로 시연 사고 방지.
 */
export function PatentRankMini({ patent, size = 48, showScore = true }: Props) {
  const scores = patentRank(patent);
  const grade = patentRankGrade(scores.overall);
  const isLowConfidence = scores.overall < 35;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  const points = AXES.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const value = (scores[axis] as number) / 100;
    return {
      x: cx + Math.cos(angle) * radius * value,
      y: cy + Math.sin(angle) * radius * value,
      vertexX: cx + Math.cos(angle) * radius,
      vertexY: cy + Math.sin(angle) * radius,
    };
  });

  function pentagon(scale: number): string {
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

  const color = isLowConfidence ? "#94A3B8" : grade.color;
  const fillOpacity = isLowConfidence ? 0.15 : 0.3;

  return (
    <div
      className="inline-flex items-center gap-1.5"
      title={
        isLowConfidence
          ? `PatentRank ${scores.overall} · 평가 정보 부족 (참고용)`
          : `PatentRank ${scores.overall} · 등급 ${grade.grade}`
      }
    >
      {/* 등급 배지 */}
      {showScore && (
        <div className="flex flex-col items-end leading-tight">
          {isLowConfidence ? (
            <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-500">
              N/A
            </span>
          ) : (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ background: grade.color }}
            >
              {grade.grade} {scores.overall}
            </span>
          )}
        </div>
      )}

      {/* 미니 레이더 */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`PatentRank ${scores.overall}`}
        style={{ opacity: isLowConfidence ? 0.5 : 1 }}
      >
        <path d={pentagon(1)} fill="none" stroke="#E2E8F0" strokeWidth={0.8} />
        <path d={pentagon(0.5)} fill="none" stroke="#E2E8F0" strokeWidth={0.5} />
        <path
          d={valuePath}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
