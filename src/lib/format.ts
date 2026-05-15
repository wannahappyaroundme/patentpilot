import type { Urgency } from "./types";

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function urgencyLabel(u: Urgency): string {
  switch (u) {
    case "RED":
      return "긴급";
    case "YELLOW":
      return "임박";
    case "GREEN":
      return "일반";
  }
}

export function urgencyClass(u: Urgency): string {
  switch (u) {
    case "RED":
      return "bg-red-50 text-red-700 border-red-200";
    case "YELLOW":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "GREEN":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

export function kiprisFallback(applicationNumber: string): string {
  // KIPRIS deeplink: 출원번호로 직접 조회
  return `https://doi.org/10.8080/${applicationNumber}`;
}
