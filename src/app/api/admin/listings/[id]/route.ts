import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const VALID_STATUSES = ["pending", "reviewing", "listed", "rejected"] as const;
type Status = (typeof VALID_STATUSES)[number];
function isValidStatus(s: string): s is Status {
  return (VALID_STATUSES as readonly string[]).includes(s);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    const sb = createServiceClient();
    const { error } = await sb.from("listings").delete().eq("id", id);
    if (error) {
      console.error("listings delete error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete fatal", e);
    return NextResponse.json({ error: "서버 환경 오류" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  let body: { status?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const status = (body.status ?? "").trim();
  if (!isValidStatus(status)) {
    return NextResponse.json(
      { error: `status는 ${VALID_STATUSES.join(", ")} 중 하나여야 합니다.` },
      { status: 400 },
    );
  }
  try {
    const sb = createServiceClient();
    const { error } = await sb
      .from("listings")
      .update({ status })
      .eq("id", id);
    if (error) {
      console.error("listings update error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error("patch fatal", e);
    return NextResponse.json({ error: "서버 환경 오류" }, { status: 500 });
  }
}
