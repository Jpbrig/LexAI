import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { requestFingerprint } from "../rate-limit";

describe("rate limit", () => {
  const request = new NextRequest("http://localhost/api/test", { headers: { "x-forwarded-for": "203.0.113.12" } });

  test("does not retain the source IP in the identifier", () => {
    expect(requestFingerprint(request)).toMatch(/^[a-f0-9]{64}$/);
    expect(requestFingerprint(request)).not.toContain("203.0.113.12");
  });
});

