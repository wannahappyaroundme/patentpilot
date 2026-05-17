"use client";
import { useEffect } from "react";

/**
 * Self-XSS 예방 콘솔 경고 (Facebook/Google 스타일).
 * 일반 사용자가 콘솔에 모르는 코드 붙여넣어 자기 정보를 새지 않도록 큰 경고 출력.
 * 본질적으로 데이터 보호는 불가능하지만, 비기술 사용자 보호 + 시각적 억제 효과.
 */
export function ConsoleShield() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // SSR/hydration 동안 한 번만 실행
    if ((window as unknown as { __pp_shield?: boolean }).__pp_shield) return;
    (window as unknown as { __pp_shield?: boolean }).__pp_shield = true;

    const warnStyle = [
      "color: #DC2626",
      "font-size: 28px",
      "font-weight: 800",
      "text-shadow: 1px 1px 0 #FEE2E2",
    ].join(";");
    const subStyle = [
      "color: #0B1220",
      "font-size: 14px",
      "line-height: 1.5",
    ].join(";");
    const codeStyle = [
      "color: #006EFF",
      "font-family: monospace",
      "font-size: 13px",
    ].join(";");

    // eslint-disable-next-line no-console
    console.log("%c⚠️ 잠깐!", warnStyle);
    // eslint-disable-next-line no-console
    console.log(
      "%c이 콘솔은 PatentPilot 운영팀과 개발자를 위한 도구입니다.\n" +
        "출처를 알 수 없는 코드를 여기에 붙여넣지 마세요.\n" +
        "악성 스크립트가 본인 계정 또는 브라우저 정보를 탈취할 수 있어요.\n\n" +
        "PatentPilot은 어떤 경우에도 콘솔에 코드를 붙여달라고 요청하지 않습니다.",
      subStyle,
    );
    // eslint-disable-next-line no-console
    console.log(
      "%cℹ️ 협업·데이터 문의: ethos614@gmail.com",
      codeStyle,
    );
  }, []);

  return null;
}
