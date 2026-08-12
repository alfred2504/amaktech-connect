"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function ProtectedLink({ href, children }: { href: string; children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    if (!session?.user) {
      e.preventDefault();
      router.push("/login");
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
