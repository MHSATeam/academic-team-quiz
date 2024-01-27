"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();

  return (
    <button className="p-2 dark:text-white" onClick={() => router.refresh()}>
      <RefreshCcw />
    </button>
  );
}
