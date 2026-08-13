import NextAuthMiddleware from "next-auth/middleware";

export const middleware = NextAuthMiddleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
