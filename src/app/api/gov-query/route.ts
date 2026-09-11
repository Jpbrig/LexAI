import { NextRequest } from "next/server";
import { POST as consultarGov } from "../consultas/gov/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo") ?? "buscador";
  const termo = req.nextUrl.searchParams.get("termo") ?? "";

  const request = new Request("http://localhost/api/gov-query", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ tipo, termo }),
  });

  return consultarGov(request as NextRequest);
}

export async function POST(req: NextRequest) {
  return consultarGov(req);
}
