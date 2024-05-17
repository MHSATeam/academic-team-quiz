"use client";

import { RealtimeStatus } from "@/src/lib/buzzers/ably-realtime";
import React, { useEffect } from "react";

if (typeof window !== "undefined") {
  RealtimeStatus.connect();
}

export default function BuzzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.backgroundColor = "unset";
  }, []);
  return <>{children}</>;
}
