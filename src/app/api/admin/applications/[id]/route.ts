import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";

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
    const { error } = await sb.from("applications").delete().eq("id", id);
    if (error) {
      console.error("applications delete error", error);
      return NextResponse.json({ error: "처리에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete fatal", e);
    return NextResponse.json({ error: "서버 환경 오류" }, { status: 500 });
  }
}
