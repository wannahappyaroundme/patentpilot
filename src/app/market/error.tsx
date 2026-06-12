"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-lg font-semibold text-slate-900">
        일시적인 오류가 발생했습니다
      </h2>
      <p className="text-sm text-slate-500">
        잠시 후 다시 시도해주세요. 문제가 계속되면 페이지를 새로고침해주세요.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        다시 시도
      </button>
    </div>
  );
}
