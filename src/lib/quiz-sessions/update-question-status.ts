import { Result } from "@prisma/client";

export async function updateQuestionStatus(
  questionTrackerId: number,
  result: Result
) {
  const res = await fetch("/api/update-question-track", {
    method: "POST",
    body: JSON.stringify({
      result,
      questionTrackerId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    alert("Failed to save question response!");
    return false;
  }

  return true;
}
