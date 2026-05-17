"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { Logo } from "./logo";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}

export function MobileDrawer({ open, onClose, links }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="배경 닫기"
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-screen w-72 max-w-[80vw] flex-col bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-ink-100 px-4">
          <Logo variant="mark" height={28} />
          <button
            type="button"
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-ink-900 hover:bg-ink-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/compare"
                onClick={onClose}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                📑 매물 비교
              </Link>
            </li>
          </ul>
        </nav>
        <div className="border-t border-ink-100 p-4">
          <Link
            href="/list"
            onClick={onClose}
            className="flex items-center justify-center rounded-md bg-brand py-2.5 text-sm font-semibold text-white"
          >
            매물 등록 신청
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
