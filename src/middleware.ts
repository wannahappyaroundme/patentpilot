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

function diagnosis(
  envUserLen: number,
  envPassLen: number,
  sentUserLen: number,
  sentPassLen: number,
  userMatch: boolean,
  passMatch: boolean,
): string {
  return JSON.stringify({
    env_user_len: envUserLen,
    env_pass_len: envPassLen,
    sent_user_len: sentUserLen,
    sent_pass_len: sentPassLen,
    user_match: userMatch,
    pass_match: passMatch,
  });
}

export function middleware(req: NextRequest) {
  const rawUser = process.env.ADMIN_USER ?? "";
  const rawPass = process.env.ADMIN_PASSWORD ?? "";
  const expectedUser = rawUser.trim();
  const expectedPass = rawPass.trim();

  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      `Admin credentials not configured on server. diag=${diagnosis(
        expectedUser.length,
        expectedPass.length,
        0,
        0,
        false,
        false,
      )}`,
      { status: 503 },
    );
  }

  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    return new NextResponse(
      `Unauthorized. diag=${diagnosis(
        expectedUser.length,
        expectedPass.length,
        0,
        0,
        false,
        false,
      )}`,
      {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
        },
      },
    );
  }

  const raw = header.slice(6).trim();
  const decoded = decodeBase64(raw);
  const sep = decoded.indexOf(":");
  if (sep === -1) return unauthorized();
  const user = decoded.slice(0, sep).trim();
  const pass = decoded.slice(sep + 1).trim();

  const userMatch = user === expectedUser;
  const passMatch = pass === expectedPass;
  if (!userMatch || !passMatch) {
    return new NextResponse(
      `Unauthorized. diag=${diagnosis(
        expectedUser.length,
        expectedPass.length,
        user.length,
        pass.length,
        userMatch,
        passMatch,
      )}`,
      {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
        },
      },
    );
  }

  return NextResponse.next();
}
