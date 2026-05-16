interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
  height?: number;
}

/**
 * PatentPilot 로고.
 * - `mark`: 정사각 둥근 마크 (favicon·OG·헤더 모바일)
 * - `full`: 마크 + 워드마크 (헤더 데스크탑)
 *
 * 심볼 의미: 둥근 정사각 #006EFF 배경 + 흰색 종이비행기(Pilot) + 우측에 작은 점(매물 = 목적지)
 */
export function Logo({ variant = "full", className, height = 26 }: LogoProps) {
  if (variant === "mark") {
    const size = height;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="PatentPilot"
        role="img"
      >
        <rect width="40" height="40" rx="10" fill="#006EFF" />
        {/* 종이비행기 */}
        <path
          d="M11 13L29 9L21 30L18.5 22.5L11 13Z"
          fill="white"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 22.5L29 9"
          stroke="#006EFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* 목적지 점 */}
        <circle cx="32" cy="30" r="2.2" fill="#00E4DF" />
      </svg>
    );
  }

  const width = height * (220 / 40);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PatentPilot"
      role="img"
    >
      <rect width="40" height="40" rx="10" fill="#006EFF" />
      <path
        d="M11 13L29 9L21 30L18.5 22.5L11 13Z"
        fill="white"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 22.5L29 9"
        stroke="#006EFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="30" r="2.2" fill="#00E4DF" />
      <text
        x="52"
        y="28"
        fontFamily="Pretendard, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#0B1220"
        letterSpacing="-0.5"
      >
        Patent
      </text>
      <text
        x="129"
        y="28"
        fontFamily="Pretendard, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#006EFF"
        letterSpacing="-0.5"
      >
        Pilot
      </text>
    </svg>
  );
}
