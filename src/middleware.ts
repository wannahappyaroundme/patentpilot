import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const REALM = "PatentPilot Admin";

function unauthorized(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function decodeBase64(s: string): string {
  if (typeof atob === "function") {
    try {
      return decodeURIComponent(
        atob(s)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(""),
      );
    } catch {
      return atob(s);
    }
  }
  return Buffer.from(s, "base64").toString("utf-8");
}

export function middleware(req: NextRequest) {
  const expectedUser = (process.env.ADMIN_USER ?? "").trim();
  const expectedPass = (process.env.ADMIN_PASSWORD ?? "").trim();

  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "Admin credentials not configured on server (ADMIN_USER / ADMIN_PASSWORD).",
      { status: 503 },
    );
  }

  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    return unauthorized();
  }

  const raw = header.slice(6).trim();
  const decoded = decodeBase64(raw);
  const sep = decoded.indexOf(":");
  if (sep === -1) return unauthorized();
  const user = decoded.slice(0, sep).trim();
  const pass = decoded.slice(sep + 1).trim();

  if (user !== expectedUser || pass !== expectedPass) {
    return unauthorized();
  }

  return NextResponse.next();
}
