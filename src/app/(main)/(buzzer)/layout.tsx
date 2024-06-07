"use client";

import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";

if (typeof window !== "undefined") {
  RealtimeClient.connect();
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
