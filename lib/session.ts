import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "amaktech_session";
function secret() {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("BETTER_AUTH_SECRET must be set to at least 32 characters.");
  return new TextEncoder().encode(value);
}
export type SessionUser = { id: string; role: "CUSTOMER" | "SELLER" | "ADMIN"; email: string; name: string };
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;

  const signingKey = secret();
  try {
    const { payload } = await jwtVerify(token, signingKey, { algorithms: ["HS256"] });
    const user = payload.user;
    if (!user || typeof user !== "object") return null;

    const candidate = user as Record<string, unknown>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.email !== "string" ||
      typeof candidate.name !== "string" ||
      (candidate.role !== "CUSTOMER" &&
        candidate.role !== "SELLER" &&
        candidate.role !== "ADMIN")
    ) {
      return null;
    }

    return {
      id: candidate.id,
      email: candidate.email,
      name: candidate.name,
      role: candidate.role,
    };
  } catch { return null; }
}
export async function clearSession() {
  const store = await cookies();
  store.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
