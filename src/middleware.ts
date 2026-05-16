import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
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

function diagnoseHeader(
  hasUser: boolean,
  hasPass: boolean,
  userLen: number,
  passLen: number,
  sentUserLen: number,
  sentPassLen: number,
): Record<string, string> {
  return {
    "x-pp-env-user": hasUser ? "set" : "missing",
    "x-pp-env-user-len": String(userLen),
    "x-pp-env-pass": hasPass ? "set" : "missing",
    "x-pp-env-pass-len": String(passLen),
    "x-pp-sent-user-len": String(sentUserLen),
    "x-pp-sent-pass-len": String(sentPassLen),
  };
}

export function middleware(req: NextRequest) {
  const rawUser = process.env.ADMIN_USER ?? "";
  const rawPass = process.env.ADMIN_PASSWORD ?? "";
  const expectedUser = rawUser.trim();
  const expectedPass = rawPass.trim();

  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "Admin credentials not configured on server (ADMIN_USER / ADMIN_PASSWORD).",
      {
        status: 503,
        headers: diagnoseHeader(
          !!expectedUser,
          !!expectedPass,
          expectedUser.length,
          expectedPass.length,
          0,
          0,
        ),
      },
    );
  }

  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    const res = unauthorized();
    Object.entries(
      diagnoseHeader(true, true, expectedUser.length, expectedPass.length, 0, 0),
    ).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const raw = header.slice(6).trim();
  const decoded = decodeBase64(raw);
  const sep = decoded.indexOf(":");
  if (sep === -1) {
    return unauthorized();
  }
  const user = decoded.slice(0, sep).trim();
  const pass = decoded.slice(sep + 1).trim();

  if (user !== expectedUser || pass !== expectedPass) {
    const res = unauthorized();
    Object.entries(
      diagnoseHeader(
        true,
        true,
        expectedUser.length,
        expectedPass.length,
        user.length,
        pass.length,
      ),
    ).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  return NextResponse.next();
}
