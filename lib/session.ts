import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "amaktech_session";unction secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters.");
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
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.user as SessionUser;
  } catch { return null; }
}
export async function clearSession() {
  const store = await cookies();
  store.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
