"use client";

import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteSession({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this session?")) {
          const res = await fetch("/api/delete-quiz", {
            method: "POST",
            body: JSON.stringify({
              quizSessionId: sessionId,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) {
            alert("Failed to delete quiz!");
            return;
          }
          router.refresh();
        }
      }}
      className="dark:text-white p-2 hover:text-red-500 dark:hover:bg-dark-tremor-background-subtle hover:bg-tremor-background-subtle rounded-md"
    >
      <Trash />
    </button>
  );
}
