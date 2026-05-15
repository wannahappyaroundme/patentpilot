import Link from "next/link";
import { AlarmClock, Hourglass, GraduationCap, FlaskConical, Bot } from "lucide-react";

const ITEMS = [
  {
    href: "/market?urgency=RED",
    label: "긴급 매물",
    desc: "출원 15~20년차",
    Icon: AlarmClock,
    iconClass: "text-red-600",
    bgClass: "bg-red-50",
  },
  {
    href: "/market?urgency=YELLOW",
    label: "임박 매물",
    desc: "출원 8~14년차",
    Icon: Hourglass,
    iconClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  {
    href: "/market?org=UNIV",
    label: "대학 매물",
    desc: "산학협력단",
    Icon: GraduationCap,
    iconClass: "text-brand",
    bgClass: "bg-brand-50",
  },
  {
    href: "/market?org=GRI",
    label: "정출연 매물",
    desc: "ETRI · KAIST · KIST",
    Icon: FlaskConical,
    iconClass: "text-violet-600",
    bgClass: "bg-violet-50",
  },
  {
    href: "/chat",
    label: "AI 코파일럿",
    desc: "자연어 매칭 (베타)",
    Icon: Bot,
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
];

export function QuickMenu() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
      {ITEMS.map(({ href, label, desc, Icon, iconClass, bgClass }) => (
        <li key={href}>
          <Link
            href={href}
            className="group flex flex-col items-center rounded-2xl border border-ink-100 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass}`}>
              <Icon size={28} className={iconClass} strokeWidth={2} />
            </span>
            <span className="mt-3 text-sm font-semibold text-ink-900">{label}</span>
            <span className="mt-1 text-xs text-ink-500">{desc}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
