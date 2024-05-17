"use client";

import { RealtimeStatus } from "@/src/lib/buzzers/ably-realtime";
import React from "react";

if (typeof window !== "undefined") {
  RealtimeStatus.connect();
}

export default function BuzzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
